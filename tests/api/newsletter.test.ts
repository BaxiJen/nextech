import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  upsertNewsletterSubscriber,
  confirmNewsletterSubscription,
  unsubscribeNewsletterSubscription,
  sendNewsletterConfirmation,
} = vi.hoisted(() => ({
  upsertNewsletterSubscriber: vi.fn(),
  confirmNewsletterSubscription: vi.fn(),
  unsubscribeNewsletterSubscription: vi.fn(),
  sendNewsletterConfirmation: vi.fn(),
}))

vi.mock('@/lib/dynamodbService', () => ({
  upsertNewsletterSubscriber,
  confirmNewsletterSubscription,
  unsubscribeNewsletterSubscription,
}))
vi.mock('@/lib/email/newsletter', () => ({ sendNewsletterConfirmation }))

const { GET, POST } = await import('@/app/api/newsletter/route')

let ipSeq = 0
function inscrever(body: unknown, ip = `192.0.2.${ipSeq++}`) {
  return POST(
    new NextRequest('https://www.baxijen.com.br/api/newsletter', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: JSON.stringify(body),
    })
  )
}

function visitar(query: string) {
  return GET(new NextRequest(`https://www.baxijen.com.br/api/newsletter${query}`))
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.spyOn(console, 'info').mockImplementation(() => {})
  upsertNewsletterSubscriber.mockReset()
  confirmNewsletterSubscription.mockReset()
  unsubscribeNewsletterSubscription.mockReset()
  sendNewsletterConfirmation.mockReset()

  upsertNewsletterSubscriber.mockResolvedValue({
    email: 'marcus@baxi.ia.br',
    name: 'Marcus',
    confirmed: false,
    confirmToken: 'token-123',
  })
  sendNewsletterConfirmation.mockResolvedValue('ses-message-id')
})

describe('inscrição', () => {
  it('recusa email inválido antes de tocar o banco', async () => {
    const res = await inscrever({ email: 'marcus@empresa' })

    expect(res.status).toBe(400)
    expect(upsertNewsletterSubscriber).not.toHaveBeenCalled()
  })

  it('recusa corpo sem email', async () => {
    expect((await inscrever({})).status).toBe(400)
    expect((await inscrever({ email: 42 })).status).toBe(400)
  })

  it('normaliza o email para minúsculas', async () => {
    await inscrever({ email: '  Marcus@BaXi.IA.BR  ' })

    expect(upsertNewsletterSubscriber).toHaveBeenCalledWith('marcus@baxi.ia.br', undefined)
  })

  it('corta nome muito longo', async () => {
    await inscrever({ email: 'marcus@baxi.ia.br', name: 'a'.repeat(300) })

    expect(upsertNewsletterSubscriber.mock.calls[0][1]).toHaveLength(120)
  })

  it('envia o link de confirmação e pede verificação do email', async () => {
    const res = await inscrever({ email: 'marcus@baxi.ia.br' })

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ confirmation_required: true })
    expect(sendNewsletterConfirmation).toHaveBeenCalledWith({
      email: 'marcus@baxi.ia.br',
      name: 'Marcus',
      token: 'token-123',
    })
  })

  it('não reenvia email para quem já confirmou', async () => {
    upsertNewsletterSubscriber.mockResolvedValueOnce({
      email: 'marcus@baxi.ia.br',
      confirmed: true,
      confirmToken: 'token-123',
    })

    const res = await inscrever({ email: 'marcus@baxi.ia.br' })

    await expect(res.json()).resolves.toMatchObject({ already_subscribed: true })
    expect(sendNewsletterConfirmation).not.toHaveBeenCalled()
  })

  it('devolve 502 quando o SES falha, sem prometer email que não saiu', async () => {
    sendNewsletterConfirmation.mockRejectedValueOnce(new Error('MessageRejected'))

    const res = await inscrever({ email: 'marcus@baxi.ia.br' })

    expect(res.status).toBe(502)
  })

  it('bloqueia a partir da sexta tentativa do mesmo IP', async () => {
    const ip = '192.0.2.250'
    for (let i = 0; i < 5; i++) {
      expect((await inscrever({ email: 'marcus@baxi.ia.br' }, ip)).status).toBe(200)
    }

    const bloqueado = await inscrever({ email: 'marcus@baxi.ia.br' }, ip)
    expect(bloqueado.status).toBe(429)
    expect(bloqueado.headers.get('Retry-After')).toBeTruthy()
  })
})

describe('confirmação por link', () => {
  it('confirma e devolve o leitor ao blog', async () => {
    confirmNewsletterSubscription.mockResolvedValue(true)

    const res = await visitar('?token=token-123')

    expect(res.status).toBe(307)
    const destino = new URL(res.headers.get('location') as string)
    expect(destino.pathname).toBe('/blog')
    expect(destino.searchParams.get('confirmed')).toBe('true')
  })

  it('sinaliza erro quando o token não confere', async () => {
    confirmNewsletterSubscription.mockResolvedValue(false)

    const res = await visitar('?token=token-invalido')
    const destino = new URL(res.headers.get('location') as string)

    expect(destino.searchParams.get('confirmed')).toBe('error')
  })

  it('sinaliza erro quando a confirmação estoura', async () => {
    confirmNewsletterSubscription.mockRejectedValue(new Error('timeout'))

    const res = await visitar('?token=token-123')
    const destino = new URL(res.headers.get('location') as string)

    expect(destino.searchParams.get('confirmed')).toBe('error')
  })

  it('trata link sem token', async () => {
    const res = await visitar('')
    const destino = new URL(res.headers.get('location') as string)

    expect(destino.searchParams.get('confirmed')).toBe('missing')
    expect(confirmNewsletterSubscription).not.toHaveBeenCalled()
  })
})

describe('descadastro', () => {
  it('remove a inscrição pelo token de unsubscribe', async () => {
    unsubscribeNewsletterSubscription.mockResolvedValue(true)

    const res = await visitar('?token=unsub-123&action=unsubscribe')
    const destino = new URL(res.headers.get('location') as string)

    expect(unsubscribeNewsletterSubscription).toHaveBeenCalledWith('unsub-123')
    expect(destino.searchParams.get('unsubscribed')).toBe('true')
    expect(confirmNewsletterSubscription).not.toHaveBeenCalled()
  })

  it('sinaliza erro quando o token de unsubscribe não confere', async () => {
    unsubscribeNewsletterSubscription.mockResolvedValue(false)

    const res = await visitar('?token=nao-existe&action=unsubscribe')
    const destino = new URL(res.headers.get('location') as string)

    expect(destino.searchParams.get('unsubscribed')).toBe('error')
  })

  it('trata descadastro sem token', async () => {
    const res = await visitar('?action=unsubscribe')
    const destino = new URL(res.headers.get('location') as string)

    expect(destino.searchParams.get('unsubscribed')).toBe('missing')
  })
})
