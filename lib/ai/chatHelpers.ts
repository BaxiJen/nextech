import { APIConnectionError, APIError } from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'

/**
 * Helpers puros da rota de chat.
 *
 * Vivem fora do route handler para poderem ser testados sem subir o runtime do
 * Next nem falar com o Bedrock: é aqui que mora a defesa contra um histórico
 * adulterado pelo cliente e a decisão de tratar um erro como transitório.
 */

// O histórico chega do navegador, portanto não é confiável em tamanho nem em forma.
export const MAX_MESSAGES = 40
export const MAX_CONTENT_CHARS = 2_000

/** Aceita apenas role/content de user|assistant, com tamanho e quantidade limitados. */
export function sanitizeMessages(raw: unknown): ChatCompletionMessageParam[] {
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

/**
 * Erros que valem uma nova tentativa do cliente numa execução SSR separada.
 *
 * Timeout de conexão, throttling e falhas 5xx do provedor são transitórios.
 * Um 400 por prompt inválido não é, e repetir só queimaria mais tempo do
 * orçamento da rota.
 */
export function isRetryableBedrockError(error: unknown): boolean {
  if (error instanceof APIConnectionError) return true
  if (!(error instanceof APIError)) return false

  return error.status === 408 || error.status === 409 || error.status === 429 || error.status >= 500
}
