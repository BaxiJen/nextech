/**
 * Chamada do site que trouxe a pessoa ao /contato (ex.: `blog-qwen3090`).
 *
 * Compartilhado entre o formulário, que lê o valor da URL, e a rota, que o
 * grava no lead. Fora do formato, a origem vira `undefined` e o envio segue:
 * um link mal escrito não pode custar o contato.
 */
const ORIGEM = /^[a-z0-9-]{1,60}$/

export function normalizarOrigem(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const origem = value.trim().toLowerCase()
  return ORIGEM.test(origem) ? origem : undefined
}
