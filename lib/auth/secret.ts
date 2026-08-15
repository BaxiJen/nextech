import { createHmac } from 'node:crypto'

/**
 * Segredo que tempera os hashes de código e de sessão. Sem ele, uma leitura
 * das tabelas bastaria para forjar acesso, então o sistema falha fechado —
 * mesma escolha que o painel já fazia com a credencial compartilhada.
 */
export class MissingAuthSecretError extends Error {
  constructor() {
    super('ADMIN_AUTH_SECRET não configurado')
    this.name = 'MissingAuthSecretError'
  }
}

/**
 * Lido a cada chamada, não no escopo do módulo: no runtime SSR o import pode
 * acontecer antes das variáveis de ambiente valerem, e uma constante de topo
 * congelaria o valor ausente pelo resto da vida do contêiner.
 */
export function authSecret(): string {
  const secret = process.env.ADMIN_AUTH_SECRET
  if (!secret || secret.length < 32) throw new MissingAuthSecretError()
  return secret
}

export function hasAuthSecret(): boolean {
  try {
    authSecret()
    return true
  } catch {
    return false
  }
}

export function hmac(value: string): string {
  return createHmac('sha256', authSecret()).update(value).digest('hex')
}
