import { randomUUID } from 'node:crypto'
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { dynamodb, tables } from '@/lib/dynamodb/client'

export type AuditAction = 'lead.status' | 'lead.update' | 'lead.delete' | 'session.start' | 'session.end'

export interface AuditEvent {
  entity: string
  entity_type: string
  entity_id: string
  occurred_at: string
  at: string
  actor: string
  actor_name: string
  action: AuditAction
  field?: string
  before?: string
  after?: string
  label?: string
}

export interface RecordAuditInput {
  entityType: 'lead' | 'session'
  entityId: string
  actor: { email: string; name: string }
  action: AuditAction
  field?: string
  before?: string | null
  after?: string | null
  /** Rótulo legível para a lista de atividade — nome ou email do lead. */
  label?: string
}

/**
 * A chave de ordenação leva um sufixo aleatório porque duas mudanças no mesmo
 * milissegundo se sobrescreveriam — e a trilha existe justamente para não
 * perder evento.
 */
export async function recordAuditEvent(input: RecordAuditInput): Promise<void> {
  const at = new Date().toISOString()

  await dynamodb.send(
    new PutCommand({
      TableName: tables.adminAuditLog,
      Item: {
        entity: `${input.entityType}#${input.entityId}`,
        entity_type: input.entityType,
        entity_id: input.entityId,
        occurred_at: `${at}#${randomUUID().slice(0, 8)}`,
        at,
        actor: input.actor.email,
        actor_name: input.actor.name,
        action: input.action,
        field: input.field,
        before: input.before ?? undefined,
        after: input.after ?? undefined,
        label: input.label,
      },
    })
  )
}

export async function listAuditForEntity(
  entityType: 'lead' | 'session',
  entityId: string,
  limit = 30
): Promise<AuditEvent[]> {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: tables.adminAuditLog,
      KeyConditionExpression: '#entity = :entity',
      ExpressionAttributeNames: { '#entity': 'entity' },
      ExpressionAttributeValues: { ':entity': `${entityType}#${entityId}` },
      ScanIndexForward: false,
      Limit: limit,
    })
  )

  return (result.Items ?? []) as AuditEvent[]
}

/** Atividade recente do painel, para a visão geral. */
export async function listRecentAudit(
  entityType: 'lead' | 'session' = 'lead',
  limit = 20
): Promise<AuditEvent[]> {
  const result = await dynamodb.send(
    new QueryCommand({
      TableName: tables.adminAuditLog,
      IndexName: 'entity-type-index',
      KeyConditionExpression: '#entity_type = :entity_type',
      ExpressionAttributeNames: { '#entity_type': 'entity_type' },
      ExpressionAttributeValues: { ':entity_type': entityType },
      ScanIndexForward: false,
      Limit: limit,
    })
  )

  return (result.Items ?? []) as AuditEvent[]
}
