import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { proxy } from '@/proxy'

const USUARIO = 'admin'
const SENHA = 'senha-longa-e-unica-para-teste'

function pedido(authorization?: string) {
  const headers = new Headers()
  if (authorization) headers.set('authorization', authorization)
  return new NextRequest('https://www.baxijen.com.br/admin/leads', { headers })
}

function basic(usuario: string, senha: string) {
  return `Basic ${Buffer.from(`${usuario}:${senha}`).toString('base64')}`
}

beforeEach(() => {
  vi.stubEnv('ADMIN_USERNAME', USUARIO)
  vi.stubEnv('ADMIN_PASSWORD', SENHA)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('falha fechado', () => {
  it('responde 503 quando as credenciais não estão configuradas', async () => {
    // Sem isso, um deploy sem variáveis publicaria dados pessoais de leads.
    vi.stubEnv('ADMIN_USERNAME', '')
    vi.stubEnv('ADMIN_PASSWORD', '')

    const res = proxy(pedido(basic(USUARIO, SENHA)))

    expect(res.status).toBe(503)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })

  it('responde 503 mesmo se só a senha faltar', () => {
    vi.stubEnv('ADMIN_PASSWORD', '')

    expect(proxy(pedido(basic(USUARIO, SENHA))).status).toBe(503)
  })
})

describe('autenticação', () => {
  it('exige credencial e anuncia o desafio Basic', () => {
    const res = proxy(pedido())

    expect(res.status).toBe(401)
    expect(res.headers.get('WWW-Authenticate')).toContain('Basic')
  })

  it('rejeita esquema que não seja Basic', () => {
    expect(proxy(pedido('Bearer um-token-qualquer')).status).toBe(401)
  })

  it('rejeita credencial sem separador de dois-pontos', () => {
    const semSeparador = `Basic ${Buffer.from('adminsemsenha').toString('base64')}`

    expect(proxy(pedido(semSeparador)).status).toBe(401)
  })

  it('rejeita usuário errado', () => {
    expect(proxy(pedido(basic('outro', SENHA))).status).toBe(401)
  })

  it('rejeita senha errada', () => {
    expect(proxy(pedido(basic(USUARIO, 'senha-errada'))).status).toBe(401)
  })

  it('rejeita senha de tamanho diferente sem estourar na comparação', () => {
    // timingSafeEqual lança se os buffers têm tamanhos diferentes; o guard de
    // length precisa vir antes.
    expect(() => proxy(pedido(basic(USUARIO, 'x')))).not.toThrow()
    expect(proxy(pedido(basic(USUARIO, 'x'))).status).toBe(401)
  })

  it('deixa passar a credencial correta', () => {
    const res = proxy(pedido(basic(USUARIO, SENHA)))

    expect(res.status).not.toBe(401)
    expect(res.status).not.toBe(503)
    expect(res.headers.get('x-middleware-next')).toBe('1')
  })

  it('aceita senha que contém dois-pontos', () => {
    // O split usa o primeiro `:`, então a senha pode conter outros.
    const senha = 'a:b:c:senha-com-dois-pontos'
    vi.stubEnv('ADMIN_PASSWORD', senha)

    expect(proxy(pedido(basic(USUARIO, senha))).headers.get('x-middleware-next')).toBe('1')
  })
})

describe('matcher', () => {
  it('cobre o painel e as rotas administrativas', async () => {
    const { config } = await import('@/proxy')

    expect(config.matcher).toContain('/admin/:path*')
    expect(config.matcher).toContain('/api/admin/:path*')
  })
})
