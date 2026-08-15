import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { send, readSession } = vi.hoisted(() => ({ send: vi.fn(), readSession: vi.fn() }))

vi.mock('@/lib/dynamodb/client', () => ({
  dynamodb: { send },
  DYNAMODB_REGION: 'sa-east-1',
  tables: { campaigns: 'test-campaigns', adminSessions: 'test-admin-sessions' },
}))
vi.mock('@/lib/auth/session', async importActual => {
  const real = await importActual<typeof import('@/lib/auth/session')>()
  return { ...real, readSession }
})

const { GET } = await import('@/app/api/admin/campanhas/route')

const SESSAO = { email: 'leo@baxi.ia.br', name: 'Leo', createdAt: 'x', expiresAt: 9_999_999_999 }
const CAMPANHA = {
  campaign_id: 'weekly-1e3da5bf97237c2ff40dcfd5',
  type: 'newsletter_digest',
  subject: 'Posts da semana | BaXiJen',
  status: 'completed',
  started_at: '2026-08-14T13:00:39.000Z',
  sent: 1,
  skipped: 0,
  failed: 0,
  subscribers: 1,
}

function pedido() {
  return new NextRequest('https://www.baxijen.com.br/api/admin/campanhas', {
    headers: { cookie: 'baxijen_admin_session=tok' },
  })
}

beforeEach(() => {
  vi.stubEnv('ADMIN_AUTH_SECRET', 'a'.repeat(48))
  send.mockReset()
  readSession.mockReset()
  readSession.mockResolvedValue(SESSAO)
  send.mockResolvedValue({ Items: [CAMPANHA] })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('GET /api/admin/campanhas', () => {
  it('exige sessão', async () => {
    readSession.mockResolvedValue(null)

    expect((await GET(pedido())).status).toBe(401)
    expect(send).not.toHaveBeenCalled()
  })

  it('lista pela mais recente', async () => {
    const res = await GET(pedido())

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual([CAMPANHA])
    expect(send.mock.calls[0][0].input.ScanIndexForward).toBe(false)
  })

  it('usa o índice por tipo, sem varrer a tabela', async () => {
    await GET(pedido())

    const { IndexName, ExpressionAttributeValues } = send.mock.calls[0][0].input
    expect(IndexName).toBe('type-index')
    expect(ExpressionAttributeValues[':type']).toBe('newsletter_digest')
  })

  it('devolve lista vazia quando não há campanha', async () => {
    send.mockResolvedValue({})

    await expect((await GET(pedido())).json()).resolves.toEqual([])
  })

  it('não deixa a resposta em cache', async () => {
    expect((await GET(pedido())).headers.get('Cache-Control')).toBe('no-store')
  })

  it('erro do banco não vira lista vazia silenciosa', async () => {
    send.mockRejectedValue(new Error('DynamoDB fora do ar'))

    expect((await GET(pedido())).status).toBe(500)
  })
})
