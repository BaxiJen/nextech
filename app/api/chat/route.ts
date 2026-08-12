import { NextResponse } from 'next/server'
import { APIConnectionError, APIError } from 'openai'
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions'
import { saveChatMessage, upsertLead, calculateLeadScore, logInteraction, linkChatSessionToLead } from '@/lib/dynamodbService'
import {
  bedrock,
  CHAT_MODEL,
  BEDROCK_REGION,
  BEDROCK_REQUEST_TIMEOUT_MS,
  isBedrockConfigured,
} from '@/lib/ai/bedrock'
import { SALES_AGENT_PROMPT, WHATSAPP_DISPLAY, WHATSAPP_NUMBER } from '@/lib/ai/agentPrompt'
import { rateLimit, clientIp } from '@/lib/ai/rateLimit'

// Limites de entrada: o histórico chega do cliente, portanto não é confiável.
const MAX_MESSAGES = 40
const MAX_CONTENT_CHARS = 2_000
const MAX_OUTPUT_TOKENS = 600
const CHAT_ROUTE_BUDGET_MS = 24_000
const MIN_FOLLOW_UP_TIMEOUT_MS = 3_000

const FALLBACK_MESSAGE = `Desculpe, tive um problema técnico. Pode me chamar no WhatsApp? ${WHATSAPP_DISPLAY}`
const RETRYABLE_MESSAGE =
  'Recebi sua mensagem, mas o assistente está demorando mais que o esperado. Tente enviar novamente para continuarmos.'

interface CaptureLeadInput {
  name: string
  email: string
  phone: string
  objective: string
  organization?: string
}

// Schema de ferramenta para captura estruturada de lead
const LEAD_CAPTURE_TOOL: ChatCompletionTool = {
  type: 'function',
  function: {
    name: 'capture_lead',
    description:
      'Captura dados estruturados do cliente quando nome, telefone, email, objetivo e organização estão disponíveis',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome completo do cliente' },
        email: { type: 'string', description: 'Email do cliente' },
        phone: { type: 'string', description: 'Telefone do cliente (formato BR: DDD + 9 dígitos)' },
        objective: { type: 'string', description: 'Objetivo ou descrição do projeto' },
        organization: { type: 'string', description: 'Organização/empresa do cliente (opcional)' },
      },
      required: ['name', 'email', 'phone', 'objective'],
    },
  },
}

/** Aceita apenas role/content de user|assistant, com tamanho e quantidade limitados. */
function sanitizeMessages(raw: unknown): ChatCompletionMessageParam[] {
  if (!Array.isArray(raw)) return []

  const isValidTurn = (m: unknown): m is { role: 'user' | 'assistant'; content: string } => {
    if (!m || typeof m !== 'object') return false
    const { role, content } = m as Record<string, unknown>
    return (
      (role === 'user' || role === 'assistant') &&
      typeof content === 'string' &&
      content.trim().length > 0
    )
  }

  return raw
    .filter(isValidTurn)
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT_CHARS) }))
}

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

/** Normaliza telefone BR para E.164 (+55DDDNNNNNNNNN) quando possível. */
function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return `+${digits}`
  return null
}

function isRetryableBedrockError(error: unknown): boolean {
  if (error instanceof APIConnectionError) return true
  if (!(error instanceof APIError)) return false

  return error.status === 408 || error.status === 409 || error.status === 429 || error.status >= 500
}

export async function POST(req: Request) {
  const startedAt = Date.now()

  try {
    const body = await req.json()
    const { messages: rawMessages, sessionId, retryAttempt } = body ?? {}
    const isRetryAttempt = retryAttempt === 1

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId é obrigatório' }, { status: 400 })
    }

    if (!isBedrockConfigured()) {
      console.error('BEDROCK_API_KEY não configurada')
      return NextResponse.json({ error: FALLBACK_MESSAGE }, { status: 503 })
    }

    // Endpoint público e sem autenticação (por design, é um chat de site):
    // o rate limit é a única barreira contra abuso e custo de inferência.
    const limit = rateLimit(`chat:${clientIp(req)}`)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Muitas mensagens em pouco tempo. Tente novamente em instantes ou chame no WhatsApp ${WHATSAPP_DISPLAY}.` },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      )
    }

    const messages = sanitizeMessages(rawMessages)
    if (messages.length === 0) {
      return NextResponse.json({ error: 'Nenhuma mensagem válida recebida' }, { status: 400 })
    }

    // Salvar mensagem do usuário no banco
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === 'user' && !isRetryAttempt) {
      // Ainda não temos o lead_id até fazer o upsert; manter null
      await saveChatMessage(sessionId, 'user', String(lastMessage.content))
    }

    const conversation: ChatCompletionMessageParam[] = [
      { role: 'system', content: SALES_AGENT_PROMPT },
      ...messages,
    ]

    let response
    try {
      response = await bedrock.chat.completions.create(
        {
          model: CHAT_MODEL,
          tools: [LEAD_CAPTURE_TOOL],
          tool_choice: 'auto',
          messages: conversation,
          // Fluxo de coleta guiada: temperatura baixa mantém o protocolo
          // de "uma pergunta por mensagem" mais estável.
          temperature: 0.4,
          max_tokens: MAX_OUTPUT_TOKENS,
        },
        { timeout: BEDROCK_REQUEST_TIMEOUT_MS, maxRetries: 0 }
      )
    } catch (error) {
      if (isRetryableBedrockError(error)) {
        console.warn('[chat_transient_error]', {
          sessionId,
          model: CHAT_MODEL,
          region: BEDROCK_REGION,
          latencyMs: Date.now() - startedAt,
          errorType: error instanceof Error ? error.name : 'unknown',
          status: error instanceof APIError ? error.status : undefined,
          retryAttempt: isRetryAttempt ? 1 : 0,
        })
        return NextResponse.json(
          { error: RETRYABLE_MESSAGE, retryable: true },
          { status: 503 }
        )
      }
      throw error
    }

    const assistantMessage = response.choices[0].message
    let assistantContent = assistantMessage.content || ''

    let whatsappLink: string | null = null
    let leadId: string | null = null

    const toolCall = assistantMessage.tool_calls?.[0]

    if (toolCall && 'function' in toolCall && toolCall.function?.name === 'capture_lead') {
      let toolResult: Record<string, unknown> = { success: false, reason: 'unknown' }

      try {
        const leadData: CaptureLeadInput = JSON.parse(toolCall.function.arguments)
        const email = String(leadData.email || '').trim().toLowerCase()
        const phone = normalizePhone(String(leadData.phone || ''))

        if (!isValidEmail(email)) {
          toolResult = { success: false, reason: 'invalid_email', instruction: 'Peça o email novamente, gentilmente.' }
        } else if (!phone) {
          toolResult = { success: false, reason: 'invalid_phone', instruction: 'Peça o telefone com DDD novamente.' }
        } else {
          const score = calculateLeadScore(messages.length, !!leadData.objective, true, 0)

          const lead = await upsertLead(email, {
            name: leadData.name,
            phone,
            objective: leadData.objective,
            source: 'chat',
            score,
            status: score >= 60 ? 'qualified' : 'new',
            company: leadData.organization || undefined,
          })

          if (lead) {
            leadId = lead.id

            await logInteraction(lead.id, 'message', {
              messageCount: messages.length,
              dataCollected: true,
              model: CHAT_MODEL,
              region: BEDROCK_REGION,
            })

            const whatsappText = `Olá, sou ${leadData.name}. Quero falar sobre ${leadData.objective}. Meu email: ${email}. Telefone: ${phone}${leadData.organization ? `. Organização: ${leadData.organization}` : ''}.`
            whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappText)}`

            // Vincular histórico da sessão ao lead
            try {
              await linkChatSessionToLead(sessionId, lead.id)
            } catch (e) {
              console.warn('Falha ao vincular sessão ao lead:', e)
            }

            toolResult = {
              success: true,
              instruction:
                'Lead registrado. Agradeça pelo nome, confirme que o time entrará em contato e avise que há um botão de WhatsApp abaixo para conversa imediata.',
            }
          } else {
            toolResult = { success: false, reason: 'storage_error' }
          }
        }
      } catch (e) {
        console.error('Erro ao processar tool_call:', e)
        toolResult = { success: false, reason: 'parse_error' }
      }

      // Segundo turno: sem devolver o resultado da ferramenta ao modelo,
      // a resposta da rodada com tool_call vem vazia e o visitante vê
      // uma bolha em branco no fim do funil.
      const followUpTimeoutMs = Math.min(
        BEDROCK_REQUEST_TIMEOUT_MS,
        CHAT_ROUTE_BUDGET_MS - (Date.now() - startedAt)
      )

      if (followUpTimeoutMs >= MIN_FOLLOW_UP_TIMEOUT_MS) {
        try {
          const followUp = await bedrock.chat.completions.create(
            {
              model: CHAT_MODEL,
              messages: [
                ...conversation,
                assistantMessage as ChatCompletionMessageParam,
                { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(toolResult) },
              ],
              temperature: 0.4,
              max_tokens: MAX_OUTPUT_TOKENS,
            },
            { timeout: followUpTimeoutMs, maxRetries: 0 }
          )
          assistantContent = followUp.choices[0].message.content || assistantContent
        } catch (e) {
          console.warn('[chat_follow_up_fallback]', {
            sessionId,
            latencyMs: Date.now() - startedAt,
            errorType: e instanceof Error ? e.name : 'unknown',
          })
        }
      } else {
        console.warn('[chat_follow_up_skipped]', {
          sessionId,
          latencyMs: Date.now() - startedAt,
          remainingMs: Math.max(0, followUpTimeoutMs),
        })
      }

      if (!assistantContent.trim()) {
        assistantContent = toolResult.success
          ? 'Perfeito, registrei seus dados! Nosso time vai analisar e entrar em contato em breve. Se preferir falar agora, use o botão do WhatsApp abaixo.'
          : 'Não consegui registrar seus dados agora. Pode confirmar seu email e telefone, por favor?'
      }
    }

    // Salvar resposta do assistente
    await saveChatMessage(sessionId, 'assistant', assistantContent, leadId || undefined)

    console.info('[chat]', {
      sessionId,
      model: CHAT_MODEL,
      region: BEDROCK_REGION,
      latencyMs: Date.now() - startedAt,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      finishReason: response.choices[0].finish_reason,
      leadCaptured: Boolean(leadId),
    })

    return NextResponse.json({
      role: 'assistant',
      content: assistantContent,
      whatsappLink,
      leadId,
    })
  } catch (error) {
    console.error('Chat API Error:', { error, latencyMs: Date.now() - startedAt })
    return NextResponse.json({ error: FALLBACK_MESSAGE }, { status: 500 })
  }
}
