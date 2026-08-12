import { OpenAI } from 'openai'

/**
 * Cliente de inferência do Amazon Bedrock via endpoint Mantle
 * (compatível com a API Chat Completions da OpenAI).
 *
 * Autenticação: chave de API de longo prazo do Bedrock
 * (console Bedrock > API keys), enviada como Bearer token.
 *
 * Região padrão: sa-east-1 (São Paulo) — inferência in-region,
 * sem tráfego cross-region, latência menor para usuários no Brasil
 * e dados de inferência mantidos no Brasil.
 */
export const BEDROCK_REGION = process.env.BEDROCK_REGION || 'sa-east-1'

/** GLM 4.7 Flash: 203K de contexto, até 4K de saída, tool calling client-side. */
export const CHAT_MODEL = process.env.BEDROCK_CHAT_MODEL || 'zai.glm-4.7-flash'

export const BEDROCK_BASE_URL =
  process.env.BEDROCK_BASE_URL || `https://bedrock-mantle.${BEDROCK_REGION}.api.aws/v1`

export const bedrock = new OpenAI({
  apiKey: process.env.BEDROCK_API_KEY || 'placeholder',
  baseURL: BEDROCK_BASE_URL,
  // Chat de site: melhor falhar rápido e cair no fallback de WhatsApp
  // do que deixar o visitante esperando.
  timeout: 25_000,
  maxRetries: 1,
})

export const isBedrockConfigured = () => Boolean(process.env.BEDROCK_API_KEY)
