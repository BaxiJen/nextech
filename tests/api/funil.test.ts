import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { send, readSession } = vi.hoisted(() => ({ send: vi.fn(), readSession: vi.fn() }))

vi.mock('@/lib/dynamodb/client', () => ({
  dynamodb: { send },
  DYNAMODB_REGION: 'sa-east-1',
  tables: { funnelEvents: 'test-funnel-events', adminSessions: 'test-admin-sessions' },
}))
vi.mock('@/lib/auth/session', async importActual => {
  const real = await importActual<typeof import('@/lib/auth/session')>()
  return { ...real, readSession }
})

const { GET } = await import('@/app/api/admin/funil/route')
const { FUNNEL_STEPS } = await import('@/lib/funnel/steps')

const SESSAO = { email: 'leo@baxi.ia.br', name: 'Leo', createdAt: 'x', expiresAt: 9_999_999_999 }

/**
 * Contagem por etapa, na ordem do funil. Um número é uma página só; uma lista
 * são páginas sucessivas. O mock responde pela etapa pedida, não pela ordem da
 * chamada: as sete consultas saem concorrentes e a ordem não é garantida.
 */
function contagens(...valores: Array<number | number[]>) {
  const paginas = new Map<string, number[]>()
  FUNNEL_STEPS.forEach((step, i) => {
    const valor = valores[i] ?? 0
    paginas.set(step, Array.isArray(valor) ? valor : [valor])
  })

  const cursor = new Map<string, number>()
  send.mockImplementation(async (comando: { input: Record<string, never> }) => {
    const step = String(
      (comando.input as unknown as { ExpressionAttributeValues: Record<string, string> })
        .ExpressionAttributeValues[':step']
    )
    const lista = paginas.get(step) ?? [0]
    const indice = cursor.get(step) ?? 0
    cursor.set(step, indice + 1)

    return {
      Count: lista[indice] ?? 0,
      ...(indice >= lista.length - 1 ? {} : { LastEvaluatedKey: { step } }),
    }
  })
}

function pedido(query = '') {
  return new NextRequest(`https://www.baxijen.com.br/api/admin/funil${query}`, {
    headers: { cookie: 'baxijen_admin_session=tok' },
  })
}

beforeEach(() => {
  vi.stubEnv('ADMIN_AUTH_SECRET', 'a'.repeat(48))
  send.mockReset()
  readSession.mockReset()
  readSession.mockResolvedValue(SESSAO)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('acesso', () => {
  it('exige sessão', async () => {
    readSession.mockResolvedValue(null)

    expect((await GET(pedido())).status).toBe(401)
    expect(send).not.toHaveBeenCalled()
  })
})

describe('contas do funil', () => {
  it('calcula percentual do topo e perda entre etapas', async () => {
    contagens(100, 80, 40, 10, 8, 8, 6)

    const dados = await (await GET(pedido())).json()

    expect(dados.etapas[0]).toMatchObject({ sessoes: 100, percentualDoTopo: 100, perdaNaEtapa: 0 })
    expect(dados.etapas[1]).toMatchObject({ sessoes: 80, percentualDoTopo: 80, perdaNaEtapa: 20, percentualPerdido: 20 })
    expect(dados.etapas[2]).toMatchObject({ sessoes: 40, perdaNaEtapa: 40, percentualPerdido: 50 })
  })

  it('aponta o gargalo pela maior perda absoluta', async () => {
    contagens(100, 80, 40, 10, 8, 8, 6)

    const dados = await (await GET(pedido())).json()

    // Perdas: 20, 40, 30, 2, 0, 2. A maior é 80 -> 40, e o gargalo é rotulado
    // pela etapa que as conversas não alcançaram.
    expect(dados.gargalo.step).toBe('diagnostico_respondido')
    expect(dados.gargalo.perdaNaEtapa).toBe(40)
  })

  it('sem conversa nenhuma não inventa gargalo nem divide por zero', async () => {
    contagens(0, 0, 0, 0, 0, 0, 0)

    const dados = await (await GET(pedido())).json()

    expect(dados.gargalo).toBeNull()
    expect(dados.etapas.every((e: { percentualDoTopo: number }) => e.percentualDoTopo === 0)).toBe(true)
  })

  it('soma as páginas, porque Count é por página', async () => {
    contagens([30, 20], 0, 0, 0, 0, 0, 0)

    const dados = await (await GET(pedido())).json()

    expect(dados.etapas[0].sessoes).toBe(50)
  })
})

describe('janela', () => {
  it('usa 30 dias por padrão', async () => {
    contagens(1)

    expect((await (await GET(pedido())).json()).dias).toBe(30)
  })

  it('aceita o parâmetro e limita a faixa', async () => {
    contagens(1)
    expect((await (await GET(pedido('?dias=7'))).json()).dias).toBe(7)

    contagens(1)
    expect((await (await GET(pedido('?dias=9999'))).json()).dias).toBe(365)

    contagens(1)
    expect((await (await GET(pedido('?dias=abacaxi'))).json()).dias).toBe(30)
  })

  it('filtra pelo início da janela na consulta', async () => {
    contagens(1)

    await GET(pedido('?dias=7'))

    const { ExpressionAttributeValues, IndexName } = send.mock.calls[0][0].input
    expect(IndexName).toBe('step-index')
    const desde = new Date(ExpressionAttributeValues[':desde']).getTime()
    expect(Date.now() - desde).toBeGreaterThan(6.5 * 24 * 3600 * 1000)
  })
})
