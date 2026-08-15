import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { readSession } = vi.hoisted(() => ({ readSession: vi.fn() }))

vi.mock('@/lib/auth/session', async importActual => {
  const real = await importActual<typeof import('@/lib/auth/session')>()
  return { ...real, readSession }
})

const { proxy, config } = await import('@/proxy')
const { SESSION_COOKIE } = await import('@/lib/auth/session')

const SEGREDO = 'x'.repeat(48)
const SESSAO = { email: 'leo@baxi.ia.br', name: 'Leo', createdAt: '2026-08-15T00:00:00.000Z', expiresAt: 9_999_999_999 }

function pedido(pathname: string, cookie?: string) {
  const headers = new Headers()
  if (cookie) headers.set('cookie', `${SESSION_COOKIE}=${cookie}`)
  return new NextRequest(`https://www.baxijen.com.br${pathname}`, { headers })
}

beforeEach(() => {
  vi.stubEnv('ADMIN_AUTH_SECRET', SEGREDO)
  readSession.mockReset()
  readSession.mockResolvedValue(null)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('falha fechado', () => {
  it('responde 503 quando o segredo não está configurado', async () => {
    // Sem isso, um deploy sem variáveis publicaria dados pessoais de leads.
    vi.stubEnv('ADMIN_AUTH_SECRET', '')

    const res = await proxy(pedido('/admin/leads'))

    expect(res.status).toBe(503)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('recusa segredo curto demais para ser levado a sério', async () => {
    vi.stubEnv('ADMIN_AUTH_SECRET', 'curto')

    expect((await proxy(pedido('/admin/leads'))).status).toBe(503)
  })

  it('responde 503, e não 200, quando a leitura da sessão falha', async () => {
    // Indisponibilidade do DynamoDB não pode virar porta aberta.
    readSession.mockRejectedValue(new Error('DynamoDB fora do ar'))

    expect((await proxy(pedido('/admin/leads'))).status).toBe(503)
    expect((await proxy(pedido('/api/admin/leads'))).status).toBe(503)
  })
})

describe('sem sessão', () => {
  it('manda a página para o login guardando o destino', async () => {
    const res = await proxy(pedido('/admin/leads'))

    expect(res.status).toBe(307)
    const destino = new URL(res.headers.get('location') as string)
    expect(destino.pathname).toBe('/admin/login')
    expect(destino.searchParams.get('next')).toBe('/admin/leads')
  })

  it('responde 401 na API, para o fetch tratar sem seguir redirecionamento', async () => {
    const res = await proxy(pedido('/api/admin/leads'))

    expect(res.status).toBe(401)
    expect(res.headers.get('content-type')).toContain('application/json')
  })

  it('não vaza dado em cache intermediário', async () => {
    expect((await proxy(pedido('/api/admin/leads'))).headers.get('Cache-Control')).toBe('no-store')
  })
})

describe('com sessão', () => {
  it('deixa passar', async () => {
    readSession.mockResolvedValue(SESSAO)

    const res = await proxy(pedido('/admin/leads', 'token-qualquer'))

    expect(res.status).not.toBe(401)
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  it('valida o token que veio no cookie', async () => {
    readSession.mockResolvedValue(SESSAO)

    await proxy(pedido('/admin/leads', 'token-abc'))

    expect(readSession).toHaveBeenCalledWith('token-abc')
  })
})

describe('página de login', () => {
  it('passa sem sessão, senão o login redirecionaria para si mesmo', async () => {
    const res = await proxy(pedido('/admin/login'))

    expect(res.headers.get('x-middleware-next')).toBe('1')
    expect(readSession).not.toHaveBeenCalled()
  })

  it('carrega mesmo sem o segredo, para mostrar o erro na tela', async () => {
    vi.stubEnv('ADMIN_AUTH_SECRET', '')

    expect((await proxy(pedido('/admin/login'))).headers.get('x-middleware-next')).toBe('1')
  })
})

describe('matcher', () => {
  it('cobre o painel e as rotas administrativas', () => {
    expect(config.matcher).toContain('/admin/:path*')
    expect(config.matcher).toContain('/api/admin/:path*')
  })
})
