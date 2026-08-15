import { randomBytes } from 'node:crypto'
import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, tables } from '@/lib/dynamodb/client'
import { displayName, findTeamMember, normalizeEmail } from '@/lib/auth/allowlist'
import { hmac } from '@/lib/auth/secret'

export const SESSION_COOKIE = 'baxijen_admin_session'

/** Sete dias: uso interno diário, sem pedir código toda manhã. */
export function sessionTtlSeconds(): number {
  const days = Number.parseInt(process.env.ADMIN_SESSION_DAYS || '7', 10)
  return (Number.isFinite(days) && days > 0 ? days : 7) * 24 * 60 * 60
}

export interface AdminSession {
  email: string
  name: string
  createdAt: string
  expiresAt: number
}

export interface CreatedSession {
  token: string
  expiresAt: number
  maxAge: number
}

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/** A tabela guarda o hash do token, não o token — mesma regra do código. */
function tokenHash(token: string): string {
  return hmac(`session:${token}`)
}

export async function createSession(
  email: string,
  meta: { userAgent?: string | null; ip?: string | null } = {}
): Promise<CreatedSession> {
  const normalized = normalizeEmail(email)
  const token = randomBytes(32).toString('base64url')
  const maxAge = sessionTtlSeconds()
  const expiresAt = nowInSeconds() + maxAge
  const createdAt = new Date().toISOString()

  await dynamodb.send(
    new PutCommand({
      TableName: tables.adminSessions,
      Item: {
        token_hash: tokenHash(token),
        email: normalized,
        name: displayName(normalized),
        created_at: createdAt,
        last_seen_at: createdAt,
        expires_at: expiresAt,
        user_agent: meta.userAgent?.slice(0, 300) || undefined,
        ip: meta.ip || undefined,
      },
    })
  )

  return { token, expiresAt, maxAge }
}

/**
 * Devolve a sessão viva ou null. Confere três coisas, nessa ordem: o registro
 * existe, ainda não venceu (o TTL do DynamoDB é preguiçoso demais para servir
 * de relógio) e o email continua na allowlist — tirar alguém do código do
 * `allowlist.ts` corta o acesso no deploy seguinte, sem caçar sessão na tabela.
 */
export async function readSession(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token) return null

  const result = await dynamodb.send(
    new GetCommand({ TableName: tables.adminSessions, Key: { token_hash: tokenHash(token) } })
  )

  const item = result.Item
  if (!item) return null
  if (Number(item.expires_at) <= nowInSeconds()) return null
  if (!findTeamMember(String(item.email))) return null

  return {
    email: String(item.email),
    name: String(item.name || displayName(String(item.email))),
    createdAt: String(item.created_at),
    expiresAt: Number(item.expires_at),
  }
}

export async function touchSession(token: string): Promise<void> {
  await dynamodb.send(
    new UpdateCommand({
      TableName: tables.adminSessions,
      Key: { token_hash: tokenHash(token) },
      UpdateExpression: 'SET last_seen_at = :now',
      ConditionExpression: 'attribute_exists(token_hash)',
      ExpressionAttributeValues: { ':now': new Date().toISOString() },
    })
  ).catch((error: { name?: string }) => {
    if (error?.name !== 'ConditionalCheckFailedException') throw error
  })
}

export async function revokeSession(token: string | undefined | null): Promise<void> {
  if (!token) return
  await dynamodb.send(
    new DeleteCommand({ TableName: tables.adminSessions, Key: { token_hash: tokenHash(token) } })
  )
}

/** Derruba todas as sessões de uma pessoa. É o botão de emergência. */
export async function revokeAllSessions(email: string): Promise<number> {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: tables.adminSessions,
      IndexName: 'email-index',
      KeyConditionExpression: '#email = :email',
      ExpressionAttributeNames: { '#email': 'email' },
      ExpressionAttributeValues: { ':email': normalizeEmail(email) },
      ProjectionExpression: 'token_hash',
    })
  )

  const items = result.Items ?? []
  for (const item of items) {
    await dynamodb.send(
      new DeleteCommand({
        TableName: tables.adminSessions,
        Key: { token_hash: String(item.token_hash) },
      })
    )
  }

  return items.length
}

export interface CookieAttributes {
  name: string
  value: string
  httpOnly: true
  secure: boolean
  sameSite: 'lax'
  path: string
  maxAge: number
}

/**
 * `SameSite=Lax` já barra o envio em requisição de terceiro, que é o vetor de
 * CSRF que importa aqui. Em desenvolvimento o cookie sai sem `Secure`, senão
 * não sobrevive ao http://localhost.
 */
export function sessionCookie(token: string, maxAge: number): CookieAttributes {
  return {
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  }
}

export function expiredSessionCookie(): CookieAttributes {
  return { ...sessionCookie('', 0), maxAge: 0 }
}
