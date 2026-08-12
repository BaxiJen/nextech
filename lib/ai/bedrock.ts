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

/**
 * GLM 5, servido em sa-east-1. Escolhido sobre o GLM 4.7 Flash por qualidade de
 * condução do funil: em eval da conversa completa, extraiu o objetivo do lead
 * com o contexto todo (volume, urgência) em vez de repetir a frase literal do
 * visitante. Custa ~1s por turno contra ~0,4s do Flash, o que é irrelevante
 * para um chat de site.
 */
export const CHAT_MODEL = process.env.BEDROCK_CHAT_MODEL || 'zai.glm-5'

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
