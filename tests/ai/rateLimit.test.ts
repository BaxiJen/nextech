import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clientIp, rateLimit } from '@/lib/ai/rateLimit'

// O bucket é global ao módulo, então cada teste usa uma chave própria para não
// herdar contagem do teste anterior.
let contador = 0
const chave = () => `teste-${contador++}`

describe('rateLimit', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('libera requisições até o limite e informa o saldo', () => {
    const k = chave()

    expect(rateLimit(k, 3, 60_000)).toMatchObject({ allowed: true, remaining: 2 })
    expect(rateLimit(k, 3, 60_000)).toMatchObject({ allowed: true, remaining: 1 })
    expect(rateLimit(k, 3, 60_000)).toMatchObject({ allowed: true, remaining: 0 })
  })

  it('bloqueia a partir da requisição excedente', () => {
    const k = chave()
    for (let i = 0; i < 3; i++) rateLimit(k, 3, 60_000)

    const bloqueado = rateLimit(k, 3, 60_000)
    expect(bloqueado.allowed).toBe(false)
    expect(bloqueado.remaining).toBe(0)
    expect(bloqueado.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('isola chaves diferentes', () => {
    const a = chave()
    const b = chave()
    for (let i = 0; i < 3; i++) rateLimit(a, 3, 60_000)

    expect(rateLimit(a, 3, 60_000).allowed).toBe(false)
    expect(rateLimit(b, 3, 60_000).allowed).toBe(true)
  })

  it('libera de novo depois que a janela desliza', () => {
    const k = chave()
    for (let i = 0; i < 3; i++) rateLimit(k, 3, 60_000)
    expect(rateLimit(k, 3, 60_000).allowed).toBe(false)

    vi.advanceTimersByTime(60_001)
    expect(rateLimit(k, 3, 60_000).allowed).toBe(true)
  })

  it('é janela deslizante, não balde fixo', () => {
    const k = chave()
    rateLimit(k, 2, 60_000)
    vi.advanceTimersByTime(30_000)
    rateLimit(k, 2, 60_000)

    expect(rateLimit(k, 2, 60_000).allowed).toBe(false)

    // Passados mais 30s, só o primeiro hit saiu da janela: abre uma vaga.
    vi.advanceTimersByTime(30_001)
    expect(rateLimit(k, 2, 60_000).allowed).toBe(true)
    expect(rateLimit(k, 2, 60_000).allowed).toBe(false)
  })

  it('retryAfterSeconds reflete quanto falta para o hit mais antigo expirar', () => {
    const k = chave()
    rateLimit(k, 1, 60_000)
    vi.advanceTimersByTime(20_000)

    expect(rateLimit(k, 1, 60_000).retryAfterSeconds).toBe(40)
  })
})

describe('clientIp', () => {
  it('usa o primeiro endereço de x-forwarded-for', () => {
    // Atrás de CDN a cadeia é "cliente, proxy1, proxy2"; só o primeiro é o visitante.
    const req = new Request('https://baxijen.com.br', {
      headers: { 'x-forwarded-for': '203.0.113.5, 70.41.3.18, 150.172.238.178' },
    })
    expect(clientIp(req)).toBe('203.0.113.5')
  })

  it('ignora espaços em volta do endereço', () => {
    const req = new Request('https://baxijen.com.br', {
      headers: { 'x-forwarded-for': '  203.0.113.5  , 70.41.3.18' },
    })
    expect(clientIp(req)).toBe('203.0.113.5')
  })

  it('cai para x-real-ip quando não há x-forwarded-for', () => {
    const req = new Request('https://baxijen.com.br', {
      headers: { 'x-real-ip': '198.51.100.7' },
    })
    expect(clientIp(req)).toBe('198.51.100.7')
  })

  it('devolve "unknown" quando nenhum header identifica o cliente', () => {
    expect(clientIp(new Request('https://baxijen.com.br'))).toBe('unknown')
  })
})
