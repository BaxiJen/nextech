import { beforeEach, describe, expect, it, vi } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('@/lib/dynamodb/client', () => ({
  dynamodb: { send },
  DYNAMODB_REGION: 'sa-east-1',
  tables: { adminAuditLog: 'test-admin-audit-log' },
}))

const { listAuditForEntity, listRecentAudit, recordAuditEvent } = await import('@/lib/admin/audit')

const ATOR = { email: 'leo@baxi.ia.br', name: 'Leo' }

function inputDaChamada(index = 0) {
  return send.mock.calls[index][0].input
}

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue({ Items: [] })
})

describe('recordAuditEvent', () => {
  it('guarda autor, ação e os dois valores', async () => {
    await recordAuditEvent({
      entityType: 'lead',
      entityId: 'lead-1',
      actor: ATOR,
      action: 'lead.status',
      field: 'status',
      before: 'new',
      after: 'qualified',
      label: 'Cliente',
    })

    expect(inputDaChamada().Item).toMatchObject({
      entity: 'lead#lead-1',
      entity_type: 'lead',
      entity_id: 'lead-1',
      actor: 'leo@baxi.ia.br',
      actor_name: 'Leo',
      action: 'lead.status',
      before: 'new',
      after: 'qualified',
    })
  })

  it('duas mudanças no mesmo instante não se sobrescrevem', async () => {
    await recordAuditEvent({ entityType: 'lead', entityId: 'lead-1', actor: ATOR, action: 'lead.status' })
    await recordAuditEvent({ entityType: 'lead', entityId: 'lead-1', actor: ATOR, action: 'lead.status' })

    expect(inputDaChamada(0).Item.occurred_at).not.toBe(inputDaChamada(1).Item.occurred_at)
  })

  it('mantém a data legível separada da chave de ordenação', async () => {
    await recordAuditEvent({ entityType: 'lead', entityId: 'lead-1', actor: ATOR, action: 'lead.delete' })

    const { Item } = inputDaChamada()
    expect(Item.at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(Item.occurred_at.startsWith(Item.at)).toBe(true)
  })
})

describe('leitura', () => {
  it('lista o histórico de um lead do mais recente para o mais antigo', async () => {
    await listAuditForEntity('lead', 'lead-1')

    const { ExpressionAttributeValues, ScanIndexForward } = inputDaChamada()
    expect(ExpressionAttributeValues[':entity']).toBe('lead#lead-1')
    expect(ScanIndexForward).toBe(false)
  })

  it('usa o índice por tipo para a atividade recente', async () => {
    await listRecentAudit('lead', 5)

    expect(inputDaChamada().IndexName).toBe('entity-type-index')
    expect(inputDaChamada().Limit).toBe(5)
  })
})
