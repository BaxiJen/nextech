import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))

vi.mock('@aws-sdk/client-sns', () => ({
  SNSClient: class {
    send = send
  },
  PublishCommand: class {
    constructor(public input: Record<string, unknown>) {}
  },
}))

const TOPIC = 'arn:aws:sns:sa-east-1:381492202560:baxijen-prod-new-leads'

const BASE = {
  leadId: 'lead-1',
  name: 'Marcus Ramalho',
  email: 'marcus@baxi.ia.br',
  subject: 'Quero um agente de IA para minha empresa',
  message: 'Precisamos de um agente que atenda no WhatsApp e consulte o ERP.',
  phone: '+5521999998888',
  company: 'BaXiJen',
  role: 'CTO',
  returning: false,
}

/**
 * O módulo lê o ambiente a cada chamada, então basta ajustar a variável.
 *
 * Passe string vazia para simular a variável ausente — não `undefined`, que
 * acionaria o valor padrão do parâmetro.
 */
async function carregar(topicArn: string = TOPIC) {
  vi.stubEnv('LEAD_NOTIFICATION_TOPIC_ARN', topicArn)
  return import('@/lib/notifications/newLead')
}

function publicado() {
  return send.mock.calls[0][0].input as { Subject: string; Message: string; TopicArn: string }
}

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue({ MessageId: 'sns-msg-1' })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('configuração', () => {
  it('reconhece o tópico configurado', async () => {
    const { isLeadNotificationConfigured } = await carregar()

    expect(isLeadNotificationConfigured()).toBe(true)
  })

  it('não publica nem estoura quando o tópico não está configurado', async () => {
    // Um deploy sem a variável não pode derrubar o formulário de contato.
    const aviso = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { isLeadNotificationConfigured, publishContactNotification } = await carregar('')

    expect(isLeadNotificationConfigured()).toBe(false)
    await expect(publishContactNotification(BASE)).resolves.toBeUndefined()
    expect(send).not.toHaveBeenCalled()
    expect(aviso).toHaveBeenCalled()
  })
})

describe('publicação', () => {
  it('publica no tópico e devolve o MessageId', async () => {
    const { publishContactNotification } = await carregar()

    await expect(publishContactNotification(BASE)).resolves.toBe('sns-msg-1')
    expect(publicado().TopicArn).toBe(TOPIC)
  })

  it('propaga a falha para quem chama decidir', async () => {
    // A rota trata: registra o erro e mantém o 200, porque o lead já foi salvo.
    send.mockRejectedValueOnce(new Error('AuthorizationError'))
    const { publishContactNotification } = await carregar()

    await expect(publishContactNotification(BASE)).rejects.toThrow('AuthorizationError')
  })
})

describe('assunto do email', () => {
  it('distingue contato novo de retorno', async () => {
    const { publishContactNotification } = await carregar()

    await publishContactNotification(BASE)
    expect(publicado().Subject).toBe('Novo contato: Marcus Ramalho')

    send.mockClear()
    await publishContactNotification({ ...BASE, returning: true })
    expect(publicado().Subject).toBe('Novo contato (retorno): Marcus Ramalho')
  })

  it('remove acentos, porque o SNS só aceita ASCII no Subject', async () => {
    // Um nome como "João" reprovaria a chamada inteira, não só o assunto.
    const { publishContactNotification } = await carregar()

    await publishContactNotification({ ...BASE, name: 'João Conceição' })

    expect(publicado().Subject).toBe('Novo contato: Joao Conceicao')
  })

  it('cai para um rótulo neutro quando não sobra nada em ASCII', async () => {
    const { publishContactNotification } = await carregar()

    await publishContactNotification({ ...BASE, name: '大和' })

    expect(publicado().Subject).toBe('Novo contato: sem identificacao')
  })

  it('respeita o limite de 100 caracteres', async () => {
    const { publishContactNotification } = await carregar()

    await publishContactNotification({ ...BASE, name: 'A'.repeat(200) })

    expect(publicado().Subject.length).toBeLessThanOrEqual(100)
  })

  it('não deixa quebra de linha no assunto', async () => {
    const { publishContactNotification } = await carregar()

    await publishContactNotification({ ...BASE, name: 'Marcus\nRamalho' })

    expect(publicado().Subject).not.toMatch(/[\r\n]/)
  })
})

describe('corpo do email', () => {
  it('inclui a mensagem escrita pelo visitante', async () => {
    // É o motivo de a rota publicar: o Lambda do stream não tem esse texto.
    const { publishContactNotification } = await carregar()

    await publishContactNotification(BASE)

    expect(publicado().Message).toContain('consulte o ERP')
  })

  it('traz identificação, assunto, lead ID e link do painel', async () => {
    const { publishContactNotification } = await carregar()

    await publishContactNotification(BASE)
    const msg = publicado().Message

    expect(msg).toContain('Marcus Ramalho')
    expect(msg).toContain('marcus@baxi.ia.br')
    expect(msg).toContain('+5521999998888')
    expect(msg).toContain('BaXiJen')
    expect(msg).toContain('CTO')
    expect(msg).toContain('Quero um agente de IA')
    expect(msg).toContain('lead-1')
    expect(msg).toContain('/admin/leads')
  })

  it('avisa quando o contato já era conhecido', async () => {
    const { publishContactNotification } = await carregar()

    await publishContactNotification({ ...BASE, returning: true })

    expect(publicado().Message).toContain('contato conhecido')
  })

  it('marca campos ausentes com traço em vez de "undefined"', async () => {
    const { publishContactNotification } = await carregar()

    await publishContactNotification({
      ...BASE,
      phone: undefined,
      company: undefined,
      role: undefined,
    })
    const msg = publicado().Message

    expect(msg).toContain('Telefone: -')
    expect(msg).toContain('Empresa: -')
    expect(msg).not.toContain('undefined')
  })

  it('achata quebras de linha nos campos de uma linha só', async () => {
    // Sem isso, um nome com \n desalinharia o corpo inteiro do email.
    const { publishContactNotification } = await carregar()

    await publishContactNotification({ ...BASE, company: 'BaXiJen\nLinha injetada' })

    expect(publicado().Message).toContain('Empresa: BaXiJen Linha injetada')
  })

  it('trunca mensagem muito longa', async () => {
    const { publishContactNotification } = await carregar()

    await publishContactNotification({ ...BASE, message: 'x'.repeat(5_000) })

    expect(publicado().Message.length).toBeLessThan(2_000)
  })

  it('preserva as quebras de linha dentro da mensagem', async () => {
    const { publishContactNotification } = await carregar()

    await publishContactNotification({ ...BASE, message: 'Primeira linha\nSegunda linha' })

    expect(publicado().Message).toContain('Primeira linha\nSegunda linha')
  })
})
