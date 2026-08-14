/**
 * Validação e normalização dos campos de identificação de um lead.
 *
 * Vive fora das rotas porque chat e formulário de contato precisam do mesmo
 * tratamento: um telefone digitado como "(21) 99999-8888" e como
 * "+5521999998888" tem que virar a mesma chave de contato.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim())
}

/**
 * Normaliza telefone brasileiro para E.164 (+55DDDNNNNNNNNN).
 *
 * Retorna null quando a quantidade de dígitos não corresponde a um número
 * nacional plausível — quem chama decide se isso é erro de validação ou se o
 * campo simplesmente fica vazio.
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10 || digits.length === 11) return `+55${digits}`
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) return `+${digits}`
  return null
}

/** Corta espaços das pontas e limita o tamanho de um campo de texto livre. */
export function trimTo(value: unknown, maxChars: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxChars) : ''
}
