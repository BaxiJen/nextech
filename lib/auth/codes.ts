import { randomInt } from 'node:crypto'
import { DeleteCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, tables } from '@/lib/dynamodb/client'
import { normalizeEmail } from '@/lib/auth/allowlist'
import { hmac } from '@/lib/auth/secret'

export const CODE_TTL_SECONDS = 10 * 60
export const MAX_ATTEMPTS = 5
export const RESEND_COOLDOWN_SECONDS = 60

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000)
}

/**
 * `randomInt` sorteia com distribuição uniforme; `randomBytes % 1000000`
 * enviesaria os primeiros códigos.
 */
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

function codeHash(email: string, code: string): string {
  // O email entra no hash para que um código não valha em outra caixa.
  return hmac(`code:${normalizeEmail(email)}:${code}`)
}

export interface IssuedCode {
  code: string
  expiresAt: number
}

/**
 * Gera e guarda um código novo. Devolve null quando a pessoa pediu outro há
 * menos de `RESEND_COOLDOWN_SECONDS` — quem chama responde a mesma coisa nos
 * dois casos, senão o tempo de resposta vira um oráculo.
 *
 * Guardamos só o hash: uma leitura da tabela não permite entrar.
 */
export async function issueCode(email: string): Promise<IssuedCode | null> {
  const normalized = normalizeEmail(email)
  const issuedAt = nowInSeconds()
  const expiresAt = issuedAt + CODE_TTL_SECONDS
  const code = generateCode()

  try {
    await dynamodb.send(
      new PutCommand({
        TableName: tables.adminAuthCodes,
        Item: {
          email: normalized,
          code_hash: codeHash(normalized, code),
          issued_at: issuedAt,
          expires_at: expiresAt,
          attempts: 0,
        },
        ConditionExpression: 'attribute_not_exists(email) OR issued_at < :cutoff',
        ExpressionAttributeValues: { ':cutoff': issuedAt - RESEND_COOLDOWN_SECONDS },
      })
    )
  } catch (error) {
    if ((error as { name?: string })?.name === 'ConditionalCheckFailedException') return null
    throw error
  }

  return { code, expiresAt }
}

/**
 * Consome o código. A verificação e o consumo são a mesma escrita condicional:
 * duas requisições simultâneas com o código certo, só uma entra. Se fosse ler
 * e depois apagar, o intervalo entre as duas seria uma janela de reuso.
 *
 * O `expires_at` é comparado aqui e não confiado ao TTL do DynamoDB, que só
 * promete apagar em até 48h.
 */
export async function consumeCode(email: string, code: string): Promise<boolean> {
  const normalized = normalizeEmail(email)

  try {
    await dynamodb.send(
      new DeleteCommand({
        TableName: tables.adminAuthCodes,
        Key: { email: normalized },
        ConditionExpression:
          '#code_hash = :code_hash AND expires_at > :now AND attempts < :max',
        ExpressionAttributeNames: { '#code_hash': 'code_hash' },
        ExpressionAttributeValues: {
          ':code_hash': codeHash(normalized, code),
          ':now': nowInSeconds(),
          ':max': MAX_ATTEMPTS,
        },
      })
    )
    return true
  } catch (error) {
    if ((error as { name?: string })?.name !== 'ConditionalCheckFailedException') throw error
    await registerFailedAttempt(normalized)
    return false
  }
}

/**
 * Cada erro queima uma tentativa; na quinta o código morre. Pedir outro depois
 * do cooldown zera o contador, e tudo bem: quem pede é dono da caixa de email.
 */
async function registerFailedAttempt(email: string): Promise<void> {
  try {
    await dynamodb.send(
      new UpdateCommand({
        TableName: tables.adminAuthCodes,
        Key: { email },
        UpdateExpression: 'ADD attempts :one',
        ConditionExpression: 'attribute_exists(email)',
        ExpressionAttributeValues: { ':one': 1 },
      })
    )
  } catch (error) {
    // Código inexistente ou já expirado: não há contador para incrementar.
    if ((error as { name?: string })?.name !== 'ConditionalCheckFailedException') throw error
  }
}
