import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { issueCode, consumeCode, sendAdminAccessCode, createSession, readSession, revokeSession, touchSession, recordAuditEvent } =
  vi.hoisted(() => ({
    issueCode: vi.fn(),
    consumeCode: vi.fn(),
    sendAdminAccessCode: vi.fn(),
    createSession: vi.fn(),
    readSession: vi.fn(),
    revokeSession: vi.fn(),
    touchSession: vi.fn(),
    recordAuditEvent: vi.fn(),
  }))

vi.mock('@/lib/auth/codes', async importActual => {
  const real = await importActual<typeof import('@/lib/auth/codes')>()
  return { ...real, issueCode, consumeCode }
})
vi.mock('@/lib/email/adminAccessCode', () => ({ sendAdminAccessCode }))
vi.mock('@/lib/auth/session', async importActual => {
  const real = await importActual<typeof import('@/lib/auth/session')>()
  return { ...real, createSession, readSession, revokeSession, touchSession }
})
vi.mock('@/lib/admin/audit', () => ({ recordAuditEvent }))

const { POST: pedirCodigo } = await import('@/app/api/auth/codigo/route')
const { POST: entrar, GET: quemSou, DELETE: sair } = await import('@/app/api/auth/sessao/route')
const { SESSION_COOKIE } = await import('@/lib/auth/session')

const SEGREDO = 'a'.repeat(48)
const MEMBRO = 'leo@baxi.ia.br'
const ESTRANHO = 'invasor@example.invalid'

interface Init {
  method?: string
  body?: string
  headers?: Record<string, string>
  cookie?: string
}

function requisicao(url: string, init: Init = {}) {
  const headers = new Headers({ 'content-type': 'application/json', ...init.headers })
  if (init.cookie) headers.set('cookie', init.cookie)
  return new NextRequest(`https://www.baxijen.com.br${url}`, {
    method: init.method,
    body: init.body,
    headers,
  })
}

function postar(url: string, body: unknown, cookie?: string) {
  return requisicao(url, { method: 'POST', body: JSON.stringify(body), cookie })
}

beforeEach(() => {
  vi.stubEnv('ADMIN_AUTH_SECRET', SEGREDO)
  for (const espiao of [issueCode, consumeCode, sendAdminAccessCode, createSession, readSession, revokeSession, touchSession, recordAuditEvent]) {
    espiao.mockReset()
  }
  issueCode.mockResolvedValue({ code: '123456', expiresAt: 9_999_999_999 })
  sendAdminAccessCode.mockResolvedValue('ses-msg-1')
  consumeCode.mockResolvedValue(true)
  createSession.mockResolvedValue({ token: 'token-novo', expiresAt: 9_999_999_999, maxAge: 604800 })
  recordAuditEvent.mockResolvedValue(undefined)
  touchSession.mockResolvedValue(undefined)
  revokeSession.mockResolvedValue(undefined)
  readSession.mockResolvedValue(null)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

describe('POST /api/auth/codigo', () => {
  it('envia o código para quem está na lista', async () => {
    const res = await pedirCodigo(postar('/api/auth/codigo', { email: MEMBRO }))

    expect(res.status).toBe(200)
    expect(issueCode).toHaveBeenCalledWith(MEMBRO)
    expect(sendAdminAccessCode).toHaveBeenCalledWith(
      expect.objectContaining({ email: MEMBRO, code: '123456' })
    )
  })

  it('não escreve nem envia nada para quem não está na lista', async () => {
    const res = await pedirCodigo(postar('/api/auth/codigo', { email: ESTRANHO }))

    expect(res.status).toBe(200)
    expect(issueCode).not.toHaveBeenCalled()
    expect(sendAdminAccessCode).not.toHaveBeenCalled()
  })

  it('responde exatamente a mesma coisa nos dois casos', async () => {
    // Se a resposta variasse, o formulário diria quem tem acesso ao painel.
    const deMembro = await pedirCodigo(postar('/api/auth/codigo', { email: MEMBRO }))
    const deEstranho = await pedirCodigo(postar('/api/auth/codigo', { email: ESTRANHO }))

    expect(deMembro.status).toBe(deEstranho.status)
    expect(await deMembro.json()).toEqual(await deEstranho.json())
  })

  it('aceita variação de caixa de quem está na lista', async () => {
    await pedirCodigo(postar('/api/auth/codigo', { email: ' LEO@BaXi.IA.br ' }))

    expect(sendAdminAccessCode).toHaveBeenCalled()
  })

  it('durante o cooldown responde igual e não manda segundo email', async () => {
    issueCode.mockResolvedValue(null)

    const res = await pedirCodigo(postar('/api/auth/codigo', { email: MEMBRO }))

    expect(res.status).toBe(200)
    expect(sendAdminAccessCode).not.toHaveBeenCalled()
  })

  it('recusa email malformado', async () => {
    const res = await pedirCodigo(postar('/api/auth/codigo', { email: 'nao-e-email' }))

    expect(res.status).toBe(400)
    expect(issueCode).not.toHaveBeenCalled()
  })

  it('recusa corpo que não é JSON', async () => {
    const res = await pedirCodigo(
      requisicao('/api/auth/codigo', { method: 'POST', body: 'nada disso' })
    )

    expect(res.status).toBe(400)
  })

  it('falha fechado sem o segredo', async () => {
    vi.stubEnv('ADMIN_AUTH_SECRET', '')

    const res = await pedirCodigo(postar('/api/auth/codigo', { email: MEMBRO }))

    expect(res.status).toBe(503)
    expect(issueCode).not.toHaveBeenCalled()
  })

  it('avisa quando o envio falha, em vez de fingir que mandou', async () => {
    sendAdminAccessCode.mockRejectedValue(new Error('SES fora do ar'))

    const res = await pedirCodigo(postar('/api/auth/codigo', { email: MEMBRO }))

    expect(res.status).toBe(500)
  })

  it('não deixa a resposta em cache', async () => {
    const res = await pedirCodigo(postar('/api/auth/codigo', { email: MEMBRO }))

    expect(res.headers.get('Cache-Control')).toBe('no-store')
  })
})

describe('POST /api/auth/sessao', () => {
  it('troca código válido por sessão com cookie httpOnly', async () => {
    const res = await entrar(postar('/api/auth/sessao', { email: MEMBRO, code: '123456' }))

    expect(res.status).toBe(200)
    const cookie = res.headers.get('set-cookie') as string
    expect(cookie).toContain(`${SESSION_COOKIE}=token-novo`)
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=lax')
  })

  it('registra a entrada na auditoria', async () => {
    await entrar(postar('/api/auth/sessao', { email: MEMBRO, code: '123456' }))

    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'session.start', entityId: MEMBRO })
    )
  })

  it('recusa quem não está na lista sem sequer consultar o código', async () => {
    const res = await entrar(postar('/api/auth/sessao', { email: ESTRANHO, code: '123456' }))

    expect(res.status).toBe(401)
    expect(consumeCode).not.toHaveBeenCalled()
  })

  it('dá a mesma resposta para código errado e para email de fora', async () => {
    consumeCode.mockResolvedValue(false)

    const errado = await entrar(postar('/api/auth/sessao', { email: MEMBRO, code: '000000' }))
    const deFora = await entrar(postar('/api/auth/sessao', { email: ESTRANHO, code: '000000' }))

    expect(errado.status).toBe(deFora.status)
    expect(await errado.json()).toEqual(await deFora.json())
  })

  it('não cria sessão quando o código é recusado', async () => {
    consumeCode.mockResolvedValue(false)

    const res = await entrar(postar('/api/auth/sessao', { email: MEMBRO, code: '000000' }))

    expect(res.status).toBe(401)
    expect(createSession).not.toHaveBeenCalled()
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('recusa código com tamanho diferente de seis dígitos', async () => {
    const res = await entrar(postar('/api/auth/sessao', { email: MEMBRO, code: '123' }))

    expect(res.status).toBe(401)
    expect(consumeCode).not.toHaveBeenCalled()
  })

  it('limpa formatação que a pessoa colou junto', async () => {
    await entrar(postar('/api/auth/sessao', { email: MEMBRO, code: '123 456' }))

    expect(consumeCode).toHaveBeenCalledWith(MEMBRO, '123456')
  })

  it('exige email e código', async () => {
    expect((await entrar(postar('/api/auth/sessao', { email: MEMBRO }))).status).toBe(400)
    expect((await entrar(postar('/api/auth/sessao', { code: '123456' }))).status).toBe(400)
  })

  it('não vira 200 quando o banco falha ao criar a sessão', async () => {
    createSession.mockRejectedValue(new Error('DynamoDB fora do ar'))

    const res = await entrar(postar('/api/auth/sessao', { email: MEMBRO, code: '123456' }))

    expect(res.status).toBe(500)
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('entra mesmo se a auditoria falhar, mas registra o erro', async () => {
    // A sessão já existe no banco; negar o login aqui seria mentir ao contrário.
    recordAuditEvent.mockRejectedValue(new Error('sem tabela'))

    const res = await entrar(postar('/api/auth/sessao', { email: MEMBRO, code: '123456' }))

    expect(res.status).toBe(200)
    expect(console.error).toHaveBeenCalled()
  })
})

describe('GET /api/auth/sessao', () => {
  it('devolve 401 sem sessão', async () => {
    readSession.mockResolvedValue(null)

    const res = await quemSou(requisicao('/api/auth/sessao'))

    expect(res.status).toBe(401)
    await expect(res.json()).resolves.toEqual({ authenticated: false })
  })

  it('devolve quem está logado', async () => {
    readSession.mockResolvedValue({ email: MEMBRO, name: 'Leo', createdAt: 'x', expiresAt: 1 })

    const res = await quemSou(requisicao('/api/auth/sessao', { cookie: `${SESSION_COOKIE}=tok` }))

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ authenticated: true, name: 'Leo' })
    expect(touchSession).toHaveBeenCalledWith('tok')
  })
})

describe('DELETE /api/auth/sessao', () => {
  it('revoga no banco e limpa o cookie', async () => {
    readSession.mockResolvedValue({ email: MEMBRO, name: 'Leo', createdAt: 'x', expiresAt: 1 })

    const res = await sair(requisicao('/api/auth/sessao', { cookie: `${SESSION_COOKIE}=tok` }))

    expect(revokeSession).toHaveBeenCalledWith('tok')
    expect(res.headers.get('set-cookie')).toContain('Max-Age=0')
    expect(recordAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'session.end' })
    )
  })

  it('não estoura quando não há cookie nenhum', async () => {
    const res = await sair(requisicao('/api/auth/sessao'))

    expect(res.status).toBe(200)
    expect(revokeSession).not.toHaveBeenCalled()
  })
})
