import { isValidEmail, normalizePhone } from '@/lib/leads/fields'

/**
 * Etapas do funil do chat, na ordem em que o agente as percorre.
 *
 * A derivação é determinística e roda no servidor a partir do que a rota já
 * tem em mãos: o histórico da conversa e a resposta que acabou de ser gerada.
 * Nenhuma chamada extra de modelo, nenhum custo de inferência, nada que o
 * visitante perceba.
 */
export const FUNNEL_STEPS = [
  'conversa_iniciada',
  'objetivo_descrito',
  'diagnostico_respondido',
  'dados_pedidos',
  'telefone_informado',
  'email_informado',
  'lead_capturado',
] as const

export type FunnelStep = (typeof FUNNEL_STEPS)[number]

export const STEP_LABELS: Record<FunnelStep, string> = {
  conversa_iniciada: 'Conversa iniciada',
  objetivo_descrito: 'Objetivo descrito',
  diagnostico_respondido: 'Diagnóstico respondido',
  dados_pedidos: 'Agente pediu contato',
  telefone_informado: 'Telefone informado',
  email_informado: 'Email informado',
  lead_capturado: 'Lead capturado',
}

/** Só cumprimento, sem conteúdo: não conta como objetivo descrito. */
const APENAS_CUMPRIMENTO = /^(oi+|ol[áa]|opa|e a[íi]|bom dia|boa tarde|boa noite|tudo bem|hey|hi|hello)[\s!.,?]*$/i

/**
 * O agente pediu dados de contato.
 *
 * Esta é a única etapa lida por heurística de texto, e a única que pode
 * envelhecer: ela reconhece as frases que o `SALES_AGENT_PROMPT` manda o
 * agente usar na etapa de transição e de coleta. Se o prompt mudar de
 * vocabulário, os testes em `tests/funnel/steps.test.ts` quebram junto — que é
 * o ponto de tê-los.
 */
const PEDIDO_DE_CONTATO =
  /(dados de contato|informa[çc][õo]es r[áa]pidas|preciso de alguns dados|seu telefone|telefone com ddd|qual (?:é |e )?o seu (?:telefone|e-?mail|whatsapp)|me (?:passa|informa) o (?:seu )?(?:telefone|e-?mail)|seu e-?mail)/i

const MIN_CHARS_OBJETIVO = 15

function contemTelefone(texto: string): boolean {
  // Uma sequência solta de dígitos no meio da frase ainda é um telefone se
  // tiver o formato certo; o visitante raramente digita só o número.
  const candidatos = texto.match(/[\d()+\-.\s]{10,}/g) ?? []
  return candidatos.some(candidato => normalizePhone(candidato) !== null)
}

function contemEmail(texto: string): boolean {
  const candidatos = texto.match(/\S+@\S+\.\S+/g) ?? []
  return candidatos.some(candidato => isValidEmail(candidato.replace(/[.,;:]+$/, '')))
}

export interface ConversationTurn {
  role: string
  content: string
}

/**
 * Etapas já alcançadas por esta conversa. É cumulativa: uma vez alcançada, a
 * etapa não some se o visitante mudar de assunto depois.
 */
export function reachedSteps(input: {
  messages: ConversationTurn[]
  assistantContent?: string
  leadCaptured?: boolean
}): FunnelStep[] {
  const doVisitante = input.messages.filter(m => m.role === 'user').map(m => String(m.content))
  const doAgente = input.messages.filter(m => m.role === 'assistant').map(m => String(m.content))
  if (input.assistantContent) doAgente.push(input.assistantContent)

  const alcancadas = new Set<FunnelStep>()

  if (doVisitante.length > 0) alcancadas.add('conversa_iniciada')

  const descreveuObjetivo = doVisitante.some(
    texto => texto.trim().length >= MIN_CHARS_OBJETIVO && !APENAS_CUMPRIMENTO.test(texto.trim())
  )
  if (descreveuObjetivo) alcancadas.add('objetivo_descrito')

  // Três respostas do visitante significam que ele passou do "o que você
  // quer?" e entrou no diagnóstico: contexto, volume, prazo.
  if (descreveuObjetivo && doVisitante.length >= 3) alcancadas.add('diagnostico_respondido')

  if (doAgente.some(texto => PEDIDO_DE_CONTATO.test(texto))) alcancadas.add('dados_pedidos')
  if (doVisitante.some(contemTelefone)) alcancadas.add('telefone_informado')
  if (doVisitante.some(contemEmail)) alcancadas.add('email_informado')
  if (input.leadCaptured) alcancadas.add('lead_capturado')

  return FUNNEL_STEPS.filter(step => alcancadas.has(step))
}

/** Etapa mais avançada que a conversa alcançou, para leitura rápida. */
export function furthestStep(steps: FunnelStep[]): FunnelStep | null {
  let indice = -1
  for (const step of steps) indice = Math.max(indice, FUNNEL_STEPS.indexOf(step))
  return indice < 0 ? null : FUNNEL_STEPS[indice]
}
