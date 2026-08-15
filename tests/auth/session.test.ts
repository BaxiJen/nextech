import { beforeEach, describe, expect, it, vi } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('@/lib/dynamodb/client', () => ({
  dynamodb: { send },
  DYNAMODB_REGION: 'sa-east-1',
  tables: { adminSessions: 'test-admin-sessions' },
}))

const {
  SESSION_COOKIE,
  createSession,
  expiredSessionCookie,
  readSession,
  revokeAllSessions,
  revokeSession,
  sessionCookie,
  sessionTtlSeconds,
} = await import('@/lib/auth/session')

const SEGREDO = 's'.repeat(48)
const AGORA = () => Math.floor(Date.now() / 1000)

function inputDaChamada(index = 0) {
  return send.mock.calls[index][0].input
}

beforeEach(() => {
  vi.stubEnv('ADMIN_AUTH_SECRET', SEGREDO)
  vi.stubEnv('ADMIN_SESSION_DAYS', '')
  send.mockReset()
  send.mockResolvedValue({})
})

describe('createSession', () => {
  it('guarda o hash do token, não o token', async () => {
    const { token } = await createSession('leo@baxi.ia.br')

    const { Item } = inputDaChamada()
    expect(token.length).toBeGreaterThan(30)
    expect(Item.token_hash).not.toBe(token)
    expect(JSON.stringify(Item)).not.toContain(token)
  })

  it('vale sete dias por padrão', async () => {
    const { expiresAt, maxAge } = await createSession('leo@baxi.ia.br')

    expect(maxAge).toBe(7 * 24 * 60 * 60)
    expect(expiresAt).toBeGreaterThanOrEqual(AGORA() + maxAge - 2)
  })

  it('respeita ADMIN_SESSION_DAYS', async () => {
    vi.stubEnv('ADMIN_SESSION_DAYS', '2')

    expect(sessionTtlSeconds()).toBe(2 * 24 * 60 * 60)
  })

  it('ignora valor inválido em vez de criar sessão eterna ou morta', async () => {
    vi.stubEnv('ADMIN_SESSION_DAYS', 'muitos')
    expect(sessionTtlSeconds()).toBe(7 * 24 * 60 * 60)

    vi.stubEnv('ADMIN_SESSION_DAYS', '0')
    expect(sessionTtlSeconds()).toBe(7 * 24 * 60 * 60)
  })

  it('normaliza o email e resolve o nome pela allowlist', async () => {
    await createSession('  LEO@BaXi.IA.br ')

    const { Item } = inputDaChamada()
    expect(Item.email).toBe('leo@baxi.ia.br')
    expect(Item.name).toBe('Leo')
  })

  it('corta user agent gigante antes de gravar', async () => {
    await createSession('leo@baxi.ia.br', { userAgent: 'x'.repeat(1000) })

    expect(String(inputDaChamada().Item.user_agent).length).toBe(300)
  })

  it('dois logins geram tokens diferentes', async () => {
    const primeiro = await createSession('leo@baxi.ia.br')
    const segundo = await createSession('leo@baxi.ia.br')

    expect(primeiro.token).not.toBe(segundo.token)
  })
})

describe('readSession', () => {
  it('devolve null sem token, sem ir ao banco', async () => {
    expect(await readSession(undefined)).toBeNull()
    expect(send).not.toHaveBeenCalled()
  })

  it('devolve null quando o registro não existe', async () => {
    send.mockResolvedValue({})

    expect(await readSession('token-qualquer')).toBeNull()
  })

  it('devolve a sessão viva', async () => {
    send.mockResolvedValue({
      Item: {
        email: 'leo@baxi.ia.br',
        name: 'Leo',
        created_at: '2026-08-15T00:00:00.000Z',
        expires_at: AGORA() + 3600,
      },
    })

    expect(await readSession('token')).toMatchObject({ email: 'leo@baxi.ia.br', name: 'Leo' })
  })

  it('recusa sessão vencida mesmo que o TTL ainda não tenha apagado a linha', async () => {
    // O TTL do DynamoDB promete apagar em até 48h, não na hora.
    send.mockResolvedValue({
      Item: { email: 'leo@baxi.ia.br', name: 'Leo', created_at: 'x', expires_at: AGORA() - 1 },
    })

    expect(await readSession('token')).toBeNull()
  })

  it('recusa sessão de quem saiu da allowlist', async () => {
    // Tirar a pessoa do código corta o acesso sem caçar linha na tabela.
    send.mockResolvedValue({
      Item: { email: 'ex-funcionario@baxi.ia.br', name: 'Ex', created_at: 'x', expires_at: AGORA() + 3600 },
    })

    expect(await readSession('token')).toBeNull()
  })

  it('procura pelo hash do token, não pelo token', async () => {
    send.mockResolvedValue({})

    await readSession('token-secreto')

    expect(inputDaChamada().Key.token_hash).not.toBe('token-secreto')
  })
})

describe('revogação', () => {
  it('apaga o registro da sessão', async () => {
    await revokeSession('token')

    expect(inputDaChamada().Key.token_hash).toBeTruthy()
  })

  it('não faz chamada sem token', async () => {
    await revokeSession(undefined)

    expect(send).not.toHaveBeenCalled()
  })

  it('derruba todas as sessões de uma pessoa pelo índice de email', async () => {
    send.mockResolvedValueOnce({ Items: [{ token_hash: 'a' }, { token_hash: 'b' }] })

    expect(await revokeAllSessions('leo@baxi.ia.br')).toBe(2)
    expect(inputDaChamada(0).IndexName).toBe('email-index')
    expect(send).toHaveBeenCalledTimes(3)
  })
})

describe('cookie', () => {
  it('é httpOnly e SameSite=Lax', () => {
    const cookie = sessionCookie('token', 60)

    expect(cookie.name).toBe(SESSION_COOKIE)
    expect(cookie.httpOnly).toBe(true)
    expect(cookie.sameSite).toBe('lax')
    expect(cookie.path).toBe('/')
  })

  it('sai com Secure em produção', () => {
    vi.stubEnv('NODE_ENV', 'production')

    expect(sessionCookie('token', 60).secure).toBe(true)
  })

  it('sai sem Secure fora de produção, senão não sobrevive ao localhost', () => {
    vi.stubEnv('NODE_ENV', 'development')

    expect(sessionCookie('token', 60).secure).toBe(false)
  })

  it('o cookie de saída expira na hora', () => {
    expect(expiredSessionCookie().maxAge).toBe(0)
  })
})
