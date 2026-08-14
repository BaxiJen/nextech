/**
 * Assuntos do formulário de contato.
 *
 * Compartilhado entre o formulário (que renderiza o select) e a rota de API
 * (que valida o valor recebido e grava o rótulo legível no lead). Manter a
 * lista em um só lugar evita que o cliente envie um valor que o servidor
 * rejeita, ou que o painel receba um slug sem significado.
 */
export const ASSUNTOS = [
  { value: 'agente-ia', label: 'Quero um agente de IA para minha empresa' },
  { value: 'bxat', label: 'Quero conhecer o BXat' },
  { value: 'soberania', label: 'Soberania de dados e infraestrutura' },
  { value: 'consultoria', label: 'Consultoria em IA / Diagnóstico' },
  { value: 'parceria', label: 'Parceria ou integração' },
  { value: 'outro', label: 'Outro' },
] as const

export type AssuntoValue = (typeof ASSUNTOS)[number]['value']

const LABEL_BY_VALUE = new Map<string, string>(ASSUNTOS.map((a) => [a.value, a.label]))

export function isAssuntoValido(value: unknown): value is AssuntoValue {
  return typeof value === 'string' && LABEL_BY_VALUE.has(value)
}

/** Rótulo legível de um assunto já validado. */
export function assuntoLabel(value: AssuntoValue): string {
  return LABEL_BY_VALUE.get(value) as string
}
