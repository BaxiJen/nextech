/**
 * Rate limit em memória (janela deslizante) para o endpoint público de chat.
 *
 * Limitação conhecida: o estado vive no processo. Funciona no deploy atual
 * (container único / standalone). Com múltiplas instâncias ou serverless,
 * trocar por Redis/ElastiCache ou uma tabela dedicada no DynamoDB.
 */
type Bucket = { hits: number[] }

const buckets = new Map<string, Bucket>()
const MAX_KEYS = 10_000

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export function rateLimit(key: string, limit = 20, windowMs = 5 * 60 * 1000): RateLimitResult {
  const now = Date.now()

  // Proteção contra crescimento indefinido do Map
  if (buckets.size > MAX_KEYS) buckets.clear()

  const bucket = buckets.get(key) ?? { hits: [] }
  bucket.hits = bucket.hits.filter((t) => now - t < windowMs)

  if (bucket.hits.length >= limit) {
    buckets.set(key, bucket)
    const oldest = bucket.hits[0]
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    }
  }

  bucket.hits.push(now)
  buckets.set(key, bucket)

  return { allowed: true, remaining: limit - bucket.hits.length, retryAfterSeconds: 0 }
}

/** IP do cliente atrás de proxy/CDN. */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
