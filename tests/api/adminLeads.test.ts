import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getLeadById, updateLeadById, deleteLeadById, listLeads, recordAuditEvent, readSession } =
  vi.hoisted(() => ({
    getLeadById: vi.fn(),
    updateLeadById: vi.fn(),
    deleteLeadById: vi.fn(),
    listLeads: vi.fn(),
    recordAuditEvent: vi.fn(),
    readSession: vi.fn(),
  }))

vi.mock('@/lib/dynamodbService', async importActual => {
  const real = await importActual<typeof import('@/lib/dynamodbService')>()
  return { ...real, getLeadById, updateLeadById, deleteLeadById, listLeads }
})
vi.mock('@/lib/admin/audit', () => ({ recordAuditEvent, listAuditForEntity: vi.fn(), listRecentAudit: vi.fn() }))
vi.mock('@/lib/auth/session', async importActual => {
  const real = await importActual<typeof import('@/lib/auth/session')>()
  return { ...real, readSession }
})

const { PATCH, DELETE } = await import('@/app/api/admin/leads/[id]/route')
const { GET: listar } = await import('@/app/api/admin/leads/route')
const { SESSION_COOKIE } = await import('@/lib/auth/session')

const SEGREDO = 'a'.repeat(48)
const SESSAO = { email: 'leo@baxi.ia.br', name: 'Leo', createdAt: 'x', expiresAt: 9_999_999_999 }
const LEAD = {
  id: 'lead-1',
  email: 'cliente@example.invalid',
  name: 'Cliente',
  status: 'new' as const,
  score: 40,
  source: 'form',
  created_at: '2026-08-14T00:00:00.000Z',
  updated_at: '2026-08-14T00:00:00.000Z',
}

const contexto = { params: Promise.resolve({ id: 'lead-1' }) }

function pedido(metodo: string, body?: unknown, comSessao = true) {
  const headers = new Headers({ 'content-type': 'application/json' })
  if (comSessao) headers.set('cookie', `${SESSION_COOKIE}=tok`)
  return new NextRequest('https://www.baxijen.com.br/api/admin/leads/lead-1', {
    method: metodo,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
}

beforeEach(() => {
  vi.stubEnv('ADMIN_AUTH_SECRET', SEGREDO)
  for (const espiao of [getLeadById, updateLeadById, deleteLeadById, listLeads, recordAuditEvent, readSession]) {
    espiao.mockReset()
  }
  readSession.mockResolvedValue(SESSAO)
  getLeadById.mockResolvedValue(LEAD)
  updateLeadById.mockResolvedValue({ ...LEAD, status: 'qualified' })
  deleteLeadById.mockResolvedValue(true)
  listLeads.mockResolvedValue([LEAD])
  recordAuditEvent.mockResolvedValue(undefined)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('sessão obrigatória', () => {
  it('recusa listagem sem sessão', async () => {
    readSession.mockResolvedValue(null)

    expect((await listar(pedido('GET', undefined, false))).status).toBe(401)
    expect(listLeads).not.toHaveBeenCalled()
  })

  it('recusa mudança de status sem sessão', async () => {
    readSession.mockResolvedValue(null)

    const res = await PATCH(pedido('PATCH', { status: 'qualified' }, false), contexto)

    expect(res.status).toBe(401)
    expect(updateLeadById).not.toHaveBeenCalled()
  })

  it('recusa exclusão sem sessão', async () => {
    readSession.mockResolvedValue(null)

    expect((await DELETE(pedido('DELETE', undefined, false), contexto)).status).toBe(401)
    expect(deleteLeadById).not.toHaveBeenCalled()
  })

  it('falha fechado quando o segredo não está configurado', async () => {
    vi.stubEnv('ADMIN_AUTH_SECRET', '')

    expect((await listar(pedido('GET'))).status).toBe(503)
  })
})

describe('PATCH com auditoria', () => {
  it('grava quem mudou, de quê para quê', async () => {
    const res = await PATCH(pedido('PATCH', { status: 'qualified' }), contexto)

    expect(res.status).toBe(200)
    expect(recordAuditEvent).toHaveBeenCalledWith({
      entityType: 'lead',
      entityId: 'lead-1',
      actor: SESSAO,
      action: 'lead.status',
      field: 'status',
      before: 'new',
      after: 'qualified',
      label: 'Cliente',
    })
  })

  it('não polui a trilha quando o status não mudou', async () => {
    updateLeadById.mockResolvedValue({ ...LEAD, status: 'new' })

    await PATCH(pedido('PATCH', { status: 'new' }), contexto)

    expect(recordAuditEvent).not.toHaveBeenCalled()
  })

  it('recusa status fora da lista', async () => {
    const res = await PATCH(pedido('PATCH', { status: 'inventado' }), contexto)

    expect(res.status).toBe(400)
    expect(updateLeadById).not.toHaveBeenCalled()
  })

  it('devolve 404 quando o lead não existe', async () => {
    getLeadById.mockResolvedValue(null)

    const res = await PATCH(pedido('PATCH', { status: 'qualified' }), contexto)

    expect(res.status).toBe(404)
    expect(updateLeadById).not.toHaveBeenCalled()
  })

  it('não desfaz a mudança se a auditoria falhar, mas deixa rastro no log', async () => {
    // A escrita no lead já aconteceu: responder erro aqui inverteria a mentira
    // que a regra do projeto proíbe.
    recordAuditEvent.mockRejectedValue(new Error('sem tabela'))

    const res = await PATCH(pedido('PATCH', { status: 'qualified' }), contexto)

    expect(res.status).toBe(200)
    expect(console.error).toHaveBeenCalledWith(
      '[audit] falha ao registrar mudança de status',
      expect.objectContaining({ actor: 'leo@baxi.ia.br', before: 'new', after: 'qualified' })
    )
  })
})

describe('DELETE com auditoria', () => {
  it('registra o autor e o que foi excluído', async () => {
    const res = await DELETE(pedido('DELETE'), contexto)

    expect(res.status).toBe(200)
    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'lead.delete',
        actor: SESSAO,
        before: 'Cliente <cliente@example.invalid>',
      })
    )
  })

  it('lê o lead antes de apagar, senão não sobra o que registrar', async () => {
    await DELETE(pedido('DELETE'), contexto)

    const ordemLeitura = getLeadById.mock.invocationCallOrder[0]
    const ordemExclusao = deleteLeadById.mock.invocationCallOrder[0]
    expect(ordemLeitura).toBeLessThan(ordemExclusao)
  })

  it('devolve 404 e não audita quando não havia lead', async () => {
    getLeadById.mockResolvedValue(null)
    deleteLeadById.mockResolvedValue(false)

    const res = await DELETE(pedido('DELETE'), contexto)

    expect(res.status).toBe(404)
    expect(recordAuditEvent).not.toHaveBeenCalled()
  })
})
