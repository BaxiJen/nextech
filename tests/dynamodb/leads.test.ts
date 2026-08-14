import { beforeEach, describe, expect, it, vi } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('@/lib/dynamodb/client', () => ({
  dynamodb: { send },
  DYNAMODB_REGION: 'sa-east-1',
  tables: {
    leads: 'test-leads',
    chatHistory: 'test-chat-history',
    interactions: 'test-interactions',
    newsletter: 'test-newsletter',
  },
}))

const { calculateLeadScore, promoteLeadToQualified, upsertLead } = await import(
  '@/lib/dynamodbService'
)

/** Parâmetros do comando enviado ao DynamoDB na chamada `index`. */
function inputDaChamada(index = 0) {
  return send.mock.calls[index][0].input
}

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue({ Attributes: { id: 'lead-1', email: 'marcus@baxi.ia.br' } })
})

describe('upsertLead', () => {
  it('normaliza o email antes de usar como chave', async () => {
    await upsertLead('  Marcus@BaXi.IA.br  ', { name: 'Marcus' })

    expect(inputDaChamada().Key).toEqual({ email: 'marcus@baxi.ia.br' })
  })

  it('mantém id e created_at estáveis entre capturas do mesmo email', async () => {
    await upsertLead('marcus@baxi.ia.br', { name: 'Marcus' })

    const { UpdateExpression } = inputDaChamada()
    expect(UpdateExpression).toContain('#id = if_not_exists(#id, :id)')
    expect(UpdateExpression).toContain('#created_at = if_not_exists(#created_at, :created_at)')
    expect(UpdateExpression).toContain('#updated_at = :updated_at')
  })

  it('sobrescreve os campos passados em data', async () => {
    await upsertLead('marcus@baxi.ia.br', { name: 'Marcus', company: 'BaXiJen', score: 80 })

    const { UpdateExpression, ExpressionAttributeValues } = inputDaChamada()
    expect(UpdateExpression).toContain('#name = :name')
    expect(UpdateExpression).toContain('#company = :company')
    expect(UpdateExpression).toContain('#score = :score')
    expect(ExpressionAttributeValues[':score']).toBe(80)
  })

  it('grava campos de initialOnly apenas se ainda não existirem', async () => {
    await upsertLead('marcus@baxi.ia.br', { name: 'Marcus' }, { score: 0, status: 'new' })

    const { UpdateExpression } = inputDaChamada()
    expect(UpdateExpression).toContain('#score = if_not_exists(#score, :score)')
    expect(UpdateExpression).toContain('#status = if_not_exists(#status, :status)')
  })

  it('não rebaixa lead existente quando o formulário reenvia score zerado', async () => {
    // Regressão: o formulário de contato mandava score 0 / status new em data,
    // zerando um lead que o chat já tinha qualificado.
    await upsertLead(
      'marcus@baxi.ia.br',
      { name: 'Marcus', source: 'form' },
      { score: 0, status: 'new' }
    )

    const { UpdateExpression } = inputDaChamada()
    expect(UpdateExpression).not.toContain('#score = :score')
    expect(UpdateExpression).not.toContain('#status = :status')
  })

  it('deixa data vencer quando o mesmo campo aparece nos dois objetos', async () => {
    await upsertLead('marcus@baxi.ia.br', { score: 75 }, { score: 0 })

    const { UpdateExpression, ExpressionAttributeValues } = inputDaChamada()
    expect(UpdateExpression).toContain('#score = :score')
    expect(UpdateExpression).not.toContain('if_not_exists(#score')
    expect(ExpressionAttributeValues[':score']).toBe(75)
  })

  it('ignora campos undefined em vez de gravar valor vazio', async () => {
    await upsertLead('marcus@baxi.ia.br', { name: 'Marcus', phone: undefined, company: undefined })

    const { UpdateExpression, ExpressionAttributeNames } = inputDaChamada()
    expect(UpdateExpression).not.toContain('#phone')
    expect(ExpressionAttributeNames).not.toHaveProperty('#company')
  })

  it('devolve null em vez de estourar quando o DynamoDB falha', async () => {
    send.mockRejectedValueOnce(new Error('ProvisionedThroughputExceeded'))

    await expect(upsertLead('marcus@baxi.ia.br', { name: 'Marcus' })).resolves.toBeNull()
  })
})

describe('promoteLeadToQualified', () => {
  it('promove somente quando o lead ainda está em new', async () => {
    await promoteLeadToQualified('marcus@baxi.ia.br')

    const { ConditionExpression, ExpressionAttributeValues, Key } = inputDaChamada()
    expect(ConditionExpression).toBe('#status = :new')
    expect(ExpressionAttributeValues[':qualified']).toBe('qualified')
    expect(Key).toEqual({ email: 'marcus@baxi.ia.br' })
  })

  it('retorna true quando a promoção acontece', async () => {
    await expect(promoteLeadToQualified('marcus@baxi.ia.br')).resolves.toBe(true)
  })

  it('não reverte estado definido a mão no painel', async () => {
    // Lead marcado como `converted` reprova a condição: isso é o esperado,
    // não um erro, e a promoção precisa falhar em silêncio.
    const erro = Object.assign(new Error('condição reprovada'), {
      name: 'ConditionalCheckFailedException',
    })
    send.mockRejectedValueOnce(erro)

    await expect(promoteLeadToQualified('marcus@baxi.ia.br')).resolves.toBe(false)
  })

  it('retorna false em falha de infraestrutura sem propagar a exceção', async () => {
    send.mockRejectedValueOnce(new Error('timeout'))

    await expect(promoteLeadToQualified('marcus@baxi.ia.br')).resolves.toBe(false)
  })
})

describe('calculateLeadScore', () => {
  it('soma cinco pontos por mensagem até o teto de quarenta', () => {
    expect(calculateLeadScore(1, false, false, 0)).toBe(5)
    expect(calculateLeadScore(8, false, false, 0)).toBe(40)
    expect(calculateLeadScore(50, false, false, 0)).toBe(40)
  })

  it('pontua objetivo e telefone', () => {
    expect(calculateLeadScore(0, true, false, 0)).toBe(20)
    expect(calculateLeadScore(0, false, true, 0)).toBe(15)
    expect(calculateLeadScore(0, true, true, 0)).toBe(35)
  })

  it('pontua duração da sessão até o teto de vinte e cinco', () => {
    expect(calculateLeadScore(0, false, false, 10)).toBe(25)
    expect(calculateLeadScore(0, false, false, 60)).toBe(25)
  })

  it('nunca ultrapassa cem', () => {
    expect(calculateLeadScore(100, true, true, 100)).toBe(100)
  })

  it('atinge o corte de qualificação com cinco mensagens, objetivo e telefone', () => {
    // É exatamente o caminho que a rota de chat percorre ao capturar um lead.
    expect(calculateLeadScore(5, true, true, 0)).toBe(60)
    expect(calculateLeadScore(4, true, true, 0)).toBe(55)
  })
})
