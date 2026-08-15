import { beforeEach, describe, expect, it, vi } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('@/lib/dynamodb/client', () => ({
  dynamodb: { send },
  DYNAMODB_REGION: 'sa-east-1',
  tables: { adminAuthCodes: 'test-admin-auth-codes' },
}))

const { CODE_TTL_SECONDS, MAX_ATTEMPTS, consumeCode, generateCode, issueCode } = await import(
  '@/lib/auth/codes'
)

const SEGREDO = 'p'.repeat(48)

function inputDaChamada(index = 0) {
  return send.mock.calls[index][0].input
}

function falhaCondicional() {
  return Object.assign(new Error('condição falhou'), {
    name: 'ConditionalCheckFailedException',
  })
}

beforeEach(() => {
  vi.stubEnv('ADMIN_AUTH_SECRET', SEGREDO)
  send.mockReset()
  send.mockResolvedValue({})
})

describe('generateCode', () => {
  it('sempre devolve seis dígitos, inclusive com zero à esquerda', () => {
    for (let i = 0; i < 200; i += 1) {
      expect(generateCode()).toMatch(/^\d{6}$/)
    }
  })
})

describe('issueCode', () => {
  it('guarda o hash e nunca o código', async () => {
    const emitido = await issueCode('leo@baxi.ia.br')

    const { Item } = inputDaChamada()
    expect(emitido?.code).toMatch(/^\d{6}$/)
    expect(Item.code_hash).not.toContain(emitido?.code)
    expect(JSON.stringify(Item)).not.toContain(emitido?.code as string)
  })

  it('expira em dez minutos e começa com zero tentativas', async () => {
    const agora = Math.floor(Date.now() / 1000)

    await issueCode('leo@baxi.ia.br')

    const { Item } = inputDaChamada()
    expect(Item.expires_at - Item.issued_at).toBe(CODE_TTL_SECONDS)
    expect(Item.expires_at).toBeGreaterThanOrEqual(agora + CODE_TTL_SECONDS - 2)
    expect(Item.attempts).toBe(0)
  })

  it('normaliza o email na chave', async () => {
    await issueCode('  LEO@BaXi.IA.br  ')

    expect(inputDaChamada().Item.email).toBe('leo@baxi.ia.br')
  })

  it('barra reenvio dentro do minuto pela própria escrita condicional', async () => {
    await issueCode('leo@baxi.ia.br')

    const { ConditionExpression, ExpressionAttributeValues } = inputDaChamada()
    expect(ConditionExpression).toContain('issued_at <')
    expect(ExpressionAttributeValues[':cutoff']).toBeGreaterThan(0)
  })

  it('devolve null quando o cooldown recusa a escrita', async () => {
    send.mockRejectedValueOnce(falhaCondicional())

    expect(await issueCode('leo@baxi.ia.br')).toBeNull()
  })

  it('propaga erro que não seja o cooldown', async () => {
    send.mockRejectedValueOnce(new Error('DynamoDB fora do ar'))

    await expect(issueCode('leo@baxi.ia.br')).rejects.toThrow('DynamoDB fora do ar')
  })

  it('gera códigos diferentes a cada emissão', async () => {
    const emitidos = new Set<string>()
    for (let i = 0; i < 20; i += 1) {
      emitidos.add((await issueCode('leo@baxi.ia.br'))?.code as string)
    }

    // 20 sorteios em um milhão de possibilidades: repetir seria sinal de bug.
    expect(emitidos.size).toBeGreaterThan(15)
  })

  it('falha fechado sem o segredo', async () => {
    vi.stubEnv('ADMIN_AUTH_SECRET', '')

    await expect(issueCode('leo@baxi.ia.br')).rejects.toThrow('ADMIN_AUTH_SECRET')
  })
})

describe('consumeCode', () => {
  it('verifica e consome na mesma escrita, sem janela de reuso', async () => {
    expect(await consumeCode('leo@baxi.ia.br', '123456')).toBe(true)

    const { ConditionExpression, ExpressionAttributeValues } = inputDaChamada()
    expect(ConditionExpression).toContain('#code_hash = :code_hash')
    expect(ConditionExpression).toContain('expires_at > :now')
    expect(ConditionExpression).toContain(`attempts < :max`)
    expect(ExpressionAttributeValues[':max']).toBe(MAX_ATTEMPTS)
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('não confia no TTL do DynamoDB para expirar', async () => {
    // O TTL pode demorar até 48h; a condição compara o relógio na hora.
    const agora = Math.floor(Date.now() / 1000)

    await consumeCode('leo@baxi.ia.br', '123456')

    expect(inputDaChamada().ExpressionAttributeValues[':now']).toBeGreaterThanOrEqual(agora - 2)
  })

  it('recusa e queima uma tentativa quando o código está errado', async () => {
    send.mockRejectedValueOnce(falhaCondicional())

    expect(await consumeCode('leo@baxi.ia.br', '000000')).toBe(false)
    expect(inputDaChamada(1).UpdateExpression).toBe('ADD attempts :one')
    expect(inputDaChamada(1).ExpressionAttributeValues[':one']).toBe(1)
  })

  it('não estoura quando não há código para queimar tentativa', async () => {
    send.mockRejectedValueOnce(falhaCondicional())
    send.mockRejectedValueOnce(falhaCondicional())

    expect(await consumeCode('leo@baxi.ia.br', '000000')).toBe(false)
  })

  it('o mesmo código em caixas de email diferentes não vale', async () => {
    await consumeCode('leo@baxi.ia.br', '123456')
    await consumeCode('lala@baxi.ia.br', '123456')

    const primeiro = inputDaChamada(0).ExpressionAttributeValues[':code_hash']
    const segundo = inputDaChamada(1).ExpressionAttributeValues[':code_hash']
    expect(primeiro).not.toBe(segundo)
  })

  it('hash muda quando o segredo muda', async () => {
    await consumeCode('leo@baxi.ia.br', '123456')
    vi.stubEnv('ADMIN_AUTH_SECRET', 'z'.repeat(48))
    await consumeCode('leo@baxi.ia.br', '123456')

    expect(inputDaChamada(0).ExpressionAttributeValues[':code_hash']).not.toBe(
      inputDaChamada(1).ExpressionAttributeValues[':code_hash']
    )
  })

  it('propaga erro de infraestrutura em vez de responder "código errado"', async () => {
    send.mockRejectedValueOnce(new Error('DynamoDB fora do ar'))

    await expect(consumeCode('leo@baxi.ia.br', '123456')).rejects.toThrow('DynamoDB fora do ar')
  })
})
