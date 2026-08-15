import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, tables } from '@/lib/dynamodb/client'
import {
  FUNNEL_STEPS,
  reachedSteps,
  type ConversationTurn,
  type FunnelStep,
} from '@/lib/funnel/steps'

/** Mesma janela do histórico de chat: o evento só serve enquanto a conversa existe. */
const RETENTION_DAYS = Math.max(
  1,
  Number.parseInt(process.env.CHAT_RETENTION_DAYS || '180', 10) || 180
)

async function stepsJaRegistrados(sessionId: string): Promise<Set<string>> {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: tables.funnelEvents,
      KeyConditionExpression: '#session_id = :session_id',
      // `step` é palavra reservada no DynamoDB; daí o alias também na projeção.
      ExpressionAttributeNames: { '#session_id': 'session_id', '#step': 'step' },
      ExpressionAttributeValues: { ':session_id': sessionId },
      ProjectionExpression: '#step',
    })
  )
  return new Set((result.Items ?? []).map(item => String(item.step)))
}

/**
 * Grava as etapas novas desta conversa e devolve quais foram.
 *
 * Nunca lança: instrumentação que derruba a rota que ela observa é pior que
 * instrumentação nenhuma. Uma falha aqui vira log e a conversa segue.
 *
 * A escrita condicional é o que garante contagem exata — cada par
 * (sessão, etapa) entra uma vez só, então contar linhas por etapa no índice é
 * contar sessões, sem precisar deduplicar depois.
 */
export async function recordFunnelProgress(input: {
  sessionId: string
  messages: ConversationTurn[]
  assistantContent?: string
  leadCaptured?: boolean
}): Promise<FunnelStep[]> {
  try {
    const alcancadas = reachedSteps(input)
    if (alcancadas.length === 0) return []

    const jaRegistradas = await stepsJaRegistrados(input.sessionId)
    const novas = alcancadas.filter(step => !jaRegistradas.has(step))
    if (novas.length === 0) return []

    const occurredAt = new Date().toISOString()
    const expiresAt = Math.floor(Date.now() / 1000) + RETENTION_DAYS * 24 * 60 * 60

    const gravadas: FunnelStep[] = []
    for (const step of novas) {
      try {
        await dynamodb.send(
          new PutCommand({
            TableName: tables.funnelEvents,
            Item: {
              session_id: input.sessionId,
              step,
              step_index: FUNNEL_STEPS.indexOf(step),
              occurred_at: occurredAt,
              expires_at: expiresAt,
            },
            ConditionExpression: 'attribute_not_exists(session_id)',
          })
        )
        gravadas.push(step)
      } catch (error) {
        // Etapa já registrada por uma requisição concorrente da mesma sessão.
        if ((error as { name?: string })?.name !== 'ConditionalCheckFailedException') throw error
      }
    }

    return gravadas
  } catch (error) {
    console.error('[funil] falha ao registrar etapa', {
      sessionId: input.sessionId,
      error,
    })
    return []
  }
}
