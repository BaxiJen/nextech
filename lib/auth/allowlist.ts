/**
 * Lista fechada de quem pode entrar no painel.
 *
 * Fica no código, não em variável de ambiente, de propósito: assim toda
 * inclusão ou remoção passa por commit, revisão e histórico. Com quatro
 * pessoas, é mais auditável do que um valor solto no console da Amplify.
 */

export interface TeamMember {
  email: string
  name: string
}

export const TEAM: readonly TeamMember[] = [
  { email: 'leo@baxi.ia.br', name: 'Leo' },
  { email: 'marcus@baxi.ia.br', name: 'Marcus' },
  { email: 'luiz@baxi.ia.br', name: 'Luiz' },
  { email: 'lala@baxi.ia.br', name: 'Lala' },
] as const

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/** Retorna a pessoa da lista, ou null. Nunca revele o resultado ao visitante. */
export function findTeamMember(email: string): TeamMember | null {
  const normalized = normalizeEmail(email)
  return TEAM.find(member => member.email === normalized) ?? null
}

export function isTeamMember(email: string): boolean {
  return findTeamMember(email) !== null
}

/** Primeiro nome, para saudação. */
export function displayName(email: string): string {
  return findTeamMember(email)?.name ?? normalizeEmail(email)
}
