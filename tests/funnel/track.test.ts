import { beforeEach, describe, expect, it, vi } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('@/lib/dynamodb/client', () => ({
  dynamodb: { send },
  DYNAMODB_REGION: 'sa-east-1',
  tables: { funnelEvents: 'test-funnel-events' },
}))

const { recordFunnelProgress } = await import('@/lib/funnel/track')

const CONVERSA = [
  { role: 'user', content: 'Quero um agente de IA para o meu atendimento' },
  { role: 'assistant', content: 'Qual seu nome?' },
]

function inputDaChamada(index = 0) {
  return send.mock.calls[index][0].input
}

function escritas() {
  return send.mock.calls.map(c => c[0].input).filter(i => i.Item)
}

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue({ Items: [] })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('recordFunnelProgress', () => {
  it('grava as etapas alcançadas, uma linha por etapa', async () => {
    const gravadas = await recordFunnelProgress({ sessionId: 'sessao-1', messages: CONVERSA })

    expect(gravadas).toEqual(['conversa_iniciada', 'objetivo_descrito'])
    expect(escritas().map(e => e.Item.step)).toEqual(['conversa_iniciada', 'objetivo_descrito'])
  })

  it('cada escrita é condicional, que é o que garante contagem exata', async () => {
    await recordFunnelProgress({ sessionId: 'sessao-1', messages: CONVERSA })

    for (const escrita of escritas()) {
      expect(escrita.ConditionExpression).toBe('attribute_not_exists(session_id)')
    }
  })

  it('não regrava o que a sessão já tem', async () => {
    send.mockResolvedValueOnce({ Items: [{ step: 'conversa_iniciada' }] })

    const gravadas = await recordFunnelProgress({ sessionId: 'sessao-1', messages: CONVERSA })

    expect(gravadas).toEqual(['objetivo_descrito'])
    expect(escritas()).toHaveLength(1)
  })

  it('não escreve nada quando nada avançou', async () => {
    send.mockResolvedValueOnce({
      Items: [{ step: 'conversa_iniciada' }, { step: 'objetivo_descrito' }],
    })

    expect(await recordFunnelProgress({ sessionId: 'sessao-1', messages: CONVERSA })).toEqual([])
    expect(escritas()).toHaveLength(0)
  })

  it('engole a corrida entre duas requisições da mesma sessão', async () => {
    // Outra requisição gravou a mesma etapa no intervalo entre ler e escrever.
    send.mockResolvedValueOnce({ Items: [] })
    send.mockRejectedValueOnce(
      Object.assign(new Error('já existe'), { name: 'ConditionalCheckFailedException' })
    )

    const gravadas = await recordFunnelProgress({ sessionId: 'sessao-1', messages: CONVERSA })

    expect(gravadas).toEqual(['objetivo_descrito'])
  })

  it('nunca lança: instrumentação não pode derrubar o chat', async () => {
    send.mockRejectedValue(new Error('DynamoDB fora do ar'))

    await expect(
      recordFunnelProgress({ sessionId: 'sessao-1', messages: CONVERSA })
    ).resolves.toEqual([])
    expect(console.error).toHaveBeenCalled()
  })

  it('marca expiração junto com a retenção do histórico de chat', async () => {
    vi.stubEnv('CHAT_RETENTION_DAYS', '180')
    const agora = Math.floor(Date.now() / 1000)

    await recordFunnelProgress({ sessionId: 'sessao-1', messages: CONVERSA })

    const { expires_at } = escritas()[0].Item
    expect(expires_at).toBeGreaterThan(agora + 179 * 86400)
    expect(expires_at).toBeLessThanOrEqual(agora + 181 * 86400)
    vi.unstubAllEnvs()
  })

  it('consulta a sessão pela chave de partição, sem varrer a tabela', async () => {
    await recordFunnelProgress({ sessionId: 'sessao-1', messages: CONVERSA })

    expect(inputDaChamada(0).KeyConditionExpression).toBe('#session_id = :session_id')
    expect(inputDaChamada(0).ExpressionAttributeValues[':session_id']).toBe('sessao-1')
  })

  it('guarda o índice da etapa para ordenar sem depender do nome', async () => {
    await recordFunnelProgress({ sessionId: 'sessao-1', messages: CONVERSA, leadCaptured: true })

    const porStep = Object.fromEntries(escritas().map(e => [e.Item.step, e.Item.step_index]))
    expect(porStep['conversa_iniciada']).toBe(0)
    expect(porStep['lead_capturado']).toBe(6)
  })
})
