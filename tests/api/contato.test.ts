import { beforeEach, describe, expect, it, vi } from 'vitest'

const { upsertLead, logInteraction } = vi.hoisted(() => ({
  upsertLead: vi.fn(),
  logInteraction: vi.fn(),
}))

vi.mock('@/lib/dynamodbService', () => ({ upsertLead, logInteraction }))

const { POST } = await import('@/app/api/contato/route')

const VALIDO = {
  nome: 'Marcus Ramalho',
  email: 'marcus@baxi.ia.br',
  empresa: 'BaXiJen',
  cargo: 'CTO',
  telefone: '(21) 99999-8888',
  assunto: 'agente-ia',
  mensagem: 'Precisamos de um agente que atenda no WhatsApp e consulte o ERP.',
}

// O rate limit guarda estado por IP no módulo, então cada teste usa um IP só seu.
let ipSeq = 0
function postar(body: unknown, ip = `198.51.100.${ipSeq++}`) {
  return POST(
    new Request('https://www.baxijen.com.br/api/contato', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    })
  )
}

beforeEach(() => {
  upsertLead.mockReset()
  logInteraction.mockReset()
  upsertLead.mockResolvedValue({ id: 'lead-1', email: 'marcus@baxi.ia.br' })
  logInteraction.mockResolvedValue(true)
})

describe('validação', () => {
  it('recusa envio sem nome', async () => {
    const res = await postar({ ...VALIDO, nome: '   ' })

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({ error: expect.stringContaining('nome') })
    expect(upsertLead).not.toHaveBeenCalled()
  })

  it('recusa email inválido', async () => {
    const res = await postar({ ...VALIDO, email: 'marcus@empresa' })

    expect(res.status).toBe(400)
    expect(upsertLead).not.toHaveBeenCalled()
  })

  it('recusa assunto fora da lista', async () => {
    const res = await postar({ ...VALIDO, assunto: 'inventado' })

    expect(res.status).toBe(400)
    expect(upsertLead).not.toHaveBeenCalled()
  })

  it('recusa assunto ausente ou vazio', async () => {
    expect((await postar({ ...VALIDO, assunto: '' })).status).toBe(400)
    expect((await postar({ ...VALIDO, assunto: undefined })).status).toBe(400)
  })

  it('recusa mensagem vazia', async () => {
    const res = await postar({ ...VALIDO, mensagem: '  ' })

    expect(res.status).toBe(400)
    expect(upsertLead).not.toHaveBeenCalled()
  })

  it('devolve 500 para corpo que não é JSON', async () => {
    const res = await POST(
      new Request('https://www.baxijen.com.br/api/contato', {
        method: 'POST',
        headers: { 'x-forwarded-for': '198.51.100.200' },
        body: 'não é json',
      })
    )

    expect(res.status).toBe(500)
  })
})

describe('persistência', () => {
  it('registra o lead e responde sucesso', async () => {
    const res = await postar(VALIDO)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ success: true })
    expect(upsertLead).toHaveBeenCalledTimes(1)
  })

  it('manda score e status como initial-only, nunca como sobrescrita', async () => {
    // Regressão: enviar score/status em `data` rebaixava lead já qualificado.
    await postar(VALIDO)

    const [, data, initialOnly] = upsertLead.mock.calls[0]
    expect(data).not.toHaveProperty('score')
    expect(data).not.toHaveProperty('status')
    expect(initialOnly).toMatchObject({ score: 0, status: 'new' })
  })

  it('não sobrescreve o objetivo de um lead que já veio do chat', async () => {
    await postar(VALIDO)

    const [, data, initialOnly] = upsertLead.mock.calls[0]
    expect(data).not.toHaveProperty('objective')
    expect(initialOnly.objective).toBe('Quero um agente de IA para minha empresa')
  })

  it('normaliza o email e o telefone', async () => {
    await postar({ ...VALIDO, email: '  Marcus@BaXi.IA.BR ' })

    const [email, data] = upsertLead.mock.calls[0]
    expect(email).toBe('marcus@baxi.ia.br')
    expect(data.phone).toBe('+5521999998888')
  })

  it('preserva telefone que não dá para normalizar em vez de descartar', async () => {
    await postar({ ...VALIDO, telefone: 'ramal 4021' })

    expect(upsertLead.mock.calls[0][1].phone).toBe('ramal 4021')
  })

  it('deixa o telefone indefinido quando o campo vem vazio', async () => {
    await postar({ ...VALIDO, telefone: '' })

    expect(upsertLead.mock.calls[0][1].phone).toBeUndefined()
  })

  it('guarda assunto, cargo e mensagem em notes para o painel', async () => {
    await postar(VALIDO)

    const { notes } = upsertLead.mock.calls[0][1]
    expect(notes).toContain('Quero um agente de IA para minha empresa')
    expect(notes).toContain('CTO')
    expect(notes).toContain('consulte o ERP')
  })

  it('trunca campos longos antes de gravar', async () => {
    await postar({ ...VALIDO, nome: 'a'.repeat(500), mensagem: 'b'.repeat(5_000) })

    const { name, notes } = upsertLead.mock.calls[0][1]
    expect(name).toHaveLength(120)
    expect(notes.length).toBeLessThan(2_300)
  })

  it('registra a submissão como interaction form_submit', async () => {
    await postar(VALIDO)

    expect(logInteraction).toHaveBeenCalledWith(
      'lead-1',
      'form_submit',
      expect.objectContaining({ assunto: 'agente-ia' })
    )
  })
})

describe('falhas', () => {
  it('devolve 502 e não finge sucesso quando o lead não persiste', async () => {
    // Foi o defeito do formulário SBPC: responder 200 com o dado perdido.
    upsertLead.mockResolvedValueOnce(null)

    const res = await postar(VALIDO)

    expect(res.status).toBe(502)
    await expect(res.json()).resolves.not.toHaveProperty('success')
  })

  it('não derruba a resposta se o registro da interaction falhar', async () => {
    // O lead já está salvo; perder o histórico não justifica erro ao visitante.
    logInteraction.mockRejectedValueOnce(new Error('throughput'))

    const res = await postar(VALIDO)

    expect(res.status).toBe(200)
  })
})

describe('rate limit', () => {
  it('bloqueia a partir da sexta tentativa do mesmo IP', async () => {
    const ip = '203.0.113.99'

    for (let i = 0; i < 5; i++) {
      expect((await postar(VALIDO, ip)).status).toBe(200)
    }

    const bloqueado = await postar(VALIDO, ip)
    expect(bloqueado.status).toBe(429)
    expect(bloqueado.headers.get('Retry-After')).toBeTruthy()
  })

  it('não penaliza outro visitante', async () => {
    const ip = '203.0.113.98'
    for (let i = 0; i < 6; i++) await postar(VALIDO, ip)

    expect((await postar(VALIDO, '203.0.113.97')).status).toBe(200)
  })
})
