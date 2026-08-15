import { NextRequest, NextResponse } from 'next/server'
import { findTeamMember } from '@/lib/auth/allowlist'
import { CODE_TTL_SECONDS, issueCode } from '@/lib/auth/codes'
import { hasAuthSecret } from '@/lib/auth/secret'
import { sendAdminAccessCode } from '@/lib/email/adminAccessCode'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * A resposta é a mesma para quem está e para quem não está na lista. Se
 * variasse, o formulário viraria um oráculo de quem tem acesso ao painel —
 * exatamente o que um atacante quer saber antes de tentar qualquer coisa.
 */
const RESPOSTA_NEUTRA = {
  ok: true,
  message: 'Se este endereço tiver acesso ao painel, o código chega em instantes.',
}

export async function POST(request: NextRequest) {
  if (!hasAuthSecret()) {
    console.error('ADMIN_AUTH_SECRET não configurado — pedido de código recusado')
    return NextResponse.json(
      { error: 'Painel administrativo indisponível' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  let email: unknown
  try {
    email = ((await request.json()) as { email?: unknown }).email
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  if (typeof email !== 'string' || email.length > 320 || !EMAIL_PATTERN.test(email.trim())) {
    return NextResponse.json({ error: 'Informe um email válido' }, { status: 400 })
  }

  const member = findTeamMember(email)
  if (!member) {
    // Sem escrita e sem envio. O atraso não iguala os dois caminhos, só reduz
    // a diferença de tempo que os separa.
    await new Promise(resolve => setTimeout(resolve, 250))
    return NextResponse.json(RESPOSTA_NEUTRA, { headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const issued = await issueCode(member.email)

    // null = pediu outro há menos de um minuto. O código anterior continua
    // valendo, então a pessoa não fica travada e o atacante não ganha nada.
    if (issued) {
      const messageId = await sendAdminAccessCode({
        email: member.email,
        code: issued.code,
        minutes: Math.round(CODE_TTL_SECONDS / 60),
      })
      console.log('[auth] código enviado', { email: member.email, messageId })
    }
  } catch (error) {
    console.error('[auth] falha ao emitir código', error)
    return NextResponse.json(
      { error: 'Não foi possível enviar o código agora. Tente de novo em instantes.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return NextResponse.json(RESPOSTA_NEUTRA, { headers: { 'Cache-Control': 'no-store' } })
}
