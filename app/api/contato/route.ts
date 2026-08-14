import { NextResponse } from 'next/server'
import { assuntoLabel, isAssuntoValido } from '@/lib/contato/assuntos'
import { isValidEmail, normalizePhone, trimTo } from '@/lib/leads/fields'
import { logInteraction, upsertLead } from '@/lib/dynamodbService'
import { clientIp, rateLimit } from '@/lib/ai/rateLimit'
import { publishContactNotification } from '@/lib/notifications/newLead'

const MAX_NOME_CHARS = 120
const MAX_CAMPO_CHARS = 160
const MAX_MENSAGEM_CHARS = 2_000

// Formulário humano: cinco envios em quinze minutos já cobre quem erra o
// preenchimento e tenta de novo. O mesmo teto usado na newsletter.
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

export async function POST(request: Request) {
  const limit = rateLimit(`contato:${clientIp(request)}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
    )
  }

  try {
    const body = await request.json()

    const nome = trimTo(body?.nome, MAX_NOME_CHARS)
    const email = trimTo(body?.email, MAX_CAMPO_CHARS).toLowerCase()
    const empresa = trimTo(body?.empresa, MAX_CAMPO_CHARS)
    const cargo = trimTo(body?.cargo, MAX_CAMPO_CHARS)
    const telefone = trimTo(body?.telefone, MAX_CAMPO_CHARS)
    const mensagem = trimTo(body?.mensagem, MAX_MENSAGEM_CHARS)
    const assunto = body?.assunto

    if (!nome) {
      return NextResponse.json({ error: 'Informe seu nome.' }, { status: 400 })
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 })
    }
    if (!isAssuntoValido(assunto)) {
      return NextResponse.json({ error: 'Selecione um assunto válido.' }, { status: 400 })
    }
    if (!mensagem) {
      return NextResponse.json({ error: 'Descreva seu desafio.' }, { status: 400 })
    }

    const label = assuntoLabel(assunto)

    // O telefone é opcional: se vier num formato que não dá para normalizar,
    // guardamos o que a pessoa digitou em vez de descartar o contato.
    const phone = telefone ? (normalizePhone(telefone) ?? telefone) : undefined

    const lead = await upsertLead(
      email,
      {
        name: nome,
        source: 'form',
        phone,
        company: empresa || undefined,
        notes: `[${label}]${cargo ? ` (${cargo})` : ''} ${mensagem}`,
      },
      {
        // Só valem na criação: um lead que já veio do chat qualificado não
        // pode ser rebaixado por preencher o formulário depois.
        objective: label,
        score: 0,
        status: 'new',
      }
    )

    if (!lead) {
      // Falha de persistência precisa chegar ao visitante. Responder sucesso
      // aqui faria a pessoa ir embora achando que foi atendida.
      console.error('[contato] lead não persistido no DynamoDB')
      return NextResponse.json(
        { error: 'Não conseguimos registrar seu contato agora. Tente novamente em instantes.' },
        { status: 502 }
      )
    }

    // Histórico append-only: `notes` guarda a última mensagem para o painel,
    // as interactions preservam todas as submissões anteriores.
    try {
      await logInteraction(lead.id, 'form_submit', {
        assunto,
        assuntoLabel: label,
        cargo: cargo || undefined,
        empresa: empresa || undefined,
        mensagem,
      })
    } catch (error) {
      console.warn('[contato] falha ao registrar interaction:', error)
    }

    // `upsertLead` grava created_at com if_not_exists e updated_at com o mesmo
    // instante, então os dois só coincidem na criação. É o sinal mais barato
    // para saber se quem escreveu já era conhecido.
    const returning = lead.created_at !== lead.updated_at

    // O Lambda do stream ignora `source` form justamente para que este aviso
    // seja o único — ele é o que carrega a mensagem e reconhece o retorno.
    let notificationId: string | undefined
    try {
      notificationId = await publishContactNotification({
        leadId: lead.id,
        name: nome,
        email,
        subject: label,
        message: mensagem,
        phone,
        company: empresa || undefined,
        role: cargo || undefined,
        returning,
      })
    } catch (error) {
      // O lead está salvo; perder o aviso não pode virar erro para o visitante.
      console.error('[contato] falha ao publicar notificação:', error)
    }

    console.info('[contato]', { leadId: lead.id, assunto, returning, notificationId })

    return NextResponse.json({ success: true, message: 'Contato registrado com sucesso!' })
  } catch (error) {
    console.error('[contato] erro ao processar:', error)
    return NextResponse.json({ error: 'Erro ao processar contato' }, { status: 500 })
  }
}
