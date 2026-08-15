import { describe, expect, it } from 'vitest'
import { FUNNEL_STEPS, furthestStep, reachedSteps } from '@/lib/funnel/steps'

const usuario = (content: string) => ({ role: 'user', content })
const agente = (content: string) => ({ role: 'assistant', content })

describe('início da conversa', () => {
  it('sem mensagem nenhuma não há etapa', () => {
    expect(reachedSteps({ messages: [] })).toEqual([])
  })

  it('só cumprimento conta como conversa iniciada, não como objetivo', () => {
    const steps = reachedSteps({ messages: [usuario('oi')] })

    expect(steps).toEqual(['conversa_iniciada'])
  })

  it('reconhece as variações de cumprimento que aparecem de verdade', () => {
    for (const texto of ['Oi', 'olá', 'Bom dia!', 'boa noite', 'opa', 'e aí', 'tudo bem?']) {
      expect(reachedSteps({ messages: [usuario(texto)] })).toEqual(['conversa_iniciada'])
    }
  })

  it('mensagem curta e vaga não vira objetivo descrito', () => {
    expect(reachedSteps({ messages: [usuario('quero saber')] })).toEqual(['conversa_iniciada'])
  })

  it('descrição de verdade marca o objetivo', () => {
    const steps = reachedSteps({
      messages: [usuario('Preciso de um agente que atenda no WhatsApp e consulte o ERP')],
    })

    expect(steps).toContain('objetivo_descrito')
  })
})

describe('diagnóstico', () => {
  it('exige objetivo e três respostas do visitante', () => {
    const conversa = [
      usuario('Quero automatizar o atendimento da minha operação'),
      agente('Entendi. Qual seu primeiro nome?'),
      usuario('Marcus'),
      agente('Qual o volume de atendimentos por mês?'),
      usuario('Uns 12.000 por mês, com pico em dezembro'),
    ]

    expect(reachedSteps({ messages: conversa })).toContain('diagnostico_respondido')
  })

  it('não marca diagnóstico com duas respostas', () => {
    const conversa = [
      usuario('Quero automatizar o atendimento da minha operação'),
      agente('Qual seu nome?'),
      usuario('Marcus'),
    ]

    expect(reachedSteps({ messages: conversa })).not.toContain('diagnostico_respondido')
  })
})

describe('pedido de contato', () => {
  it('reconhece as frases que o próprio prompt manda o agente usar', () => {
    // Se o SALES_AGENT_PROMPT mudar de vocabulário, é aqui que se descobre.
    const frases = [
      'Para o time preparar uma proposta, preciso de alguns dados de contato — são três informações rápidas.',
      'Pode me passar o telefone com DDD?',
      'Qual é o seu e-mail?',
      'Agora só falta o seu email para eu registrar.',
    ]

    for (const frase of frases) {
      expect(reachedSteps({ messages: [usuario('oi')], assistantContent: frase })).toContain(
        'dados_pedidos'
      )
    }
  })

  it('conversa sobre o produto não vira pedido de contato', () => {
    const steps = reachedSteps({
      messages: [usuario('oi')],
      assistantContent: 'O BXat Corporativo faz atendimento com soberania de dados. Qual sua área?',
    })

    expect(steps).not.toContain('dados_pedidos')
  })

  it('a resposta recém-gerada conta junto com o histórico', () => {
    const steps = reachedSteps({
      messages: [usuario('quero automatizar meu atendimento agora')],
      assistantContent: 'Qual é o seu telefone?',
    })

    expect(steps).toContain('dados_pedidos')
  })
})

describe('dados informados', () => {
  it('reconhece telefone em formatos diferentes', () => {
    for (const texto of ['(21) 99999-8888', 'meu telefone é 21999998888', '+55 21 99999-8888']) {
      expect(reachedSteps({ messages: [usuario(texto)] })).toContain('telefone_informado')
    }
  })

  it('número de volume não é telefone', () => {
    // "12.000 atendimentos" tem dígitos, mas não é contato — o falso positivo
    // aqui inflaria justamente a etapa que interessa medir.
    const textos = ['Temos cerca de 12.000 atendimentos por mês', 'somos 300 pessoas', 'faturamos 5.000.000']

    for (const texto of textos) {
      expect(reachedSteps({ messages: [usuario(texto)] })).not.toContain('telefone_informado')
    }
  })

  it('reconhece email e ignora texto que só fala de email', () => {
    expect(reachedSteps({ messages: [usuario('marcus@baxi.ia.br')] })).toContain('email_informado')
    expect(reachedSteps({ messages: [usuario('pode ser por email')] })).not.toContain(
      'email_informado'
    )
  })

  it('aceita email com pontuação colada no fim da frase', () => {
    expect(reachedSteps({ messages: [usuario('meu email é marcus@baxi.ia.br.')] })).toContain(
      'email_informado'
    )
  })

  it('captura de lead marca a última etapa', () => {
    expect(reachedSteps({ messages: [usuario('oi')], leadCaptured: true })).toContain(
      'lead_capturado'
    )
  })
})

describe('o caso real que motivou a instrumentação', () => {
  it('conversa que morre depois do volume para em diagnóstico', () => {
    // As duas conversas de 2026-08-14 morreram exatamente aqui: o visitante deu
    // contexto e volume, e o agente nunca chegou a pedir o email.
    const conversa = [
      usuario('Quero um agente de IA para atendimento no WhatsApp'),
      agente('Legal! Qual seu primeiro nome?'),
      usuario('Ana'),
      agente('Ana, qual o volume de atendimentos hoje?'),
      usuario('Uns 8.000 por mês, e cresce no fim do ano'),
      agente('Entendi. E qual o prazo que vocês têm em mente?'),
    ]

    const steps = reachedSteps({ messages: conversa })

    expect(furthestStep(steps)).toBe('diagnostico_respondido')
    expect(steps).not.toContain('dados_pedidos')
  })
})

describe('acumulação e ordem', () => {
  it('devolve as etapas na ordem do funil', () => {
    const conversa = [
      usuario('Quero automatizar o atendimento inteiro da operação'),
      agente('Qual seu nome?'),
      usuario('Marcus'),
      agente('Pode me passar o telefone com DDD?'),
      usuario('(21) 99999-8888'),
      agente('E o seu email?'),
      usuario('marcus@baxi.ia.br'),
    ]

    const steps = reachedSteps({ messages: conversa, leadCaptured: true })

    expect(steps).toEqual([...FUNNEL_STEPS])
    expect(steps.map(s => FUNNEL_STEPS.indexOf(s))).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('etapa alcançada não some se o visitante mudar de assunto', () => {
    const conversa = [
      usuario('Quero um agente de atendimento para o meu e-commerce'),
      agente('Qual é o seu e-mail?'),
      usuario('marcus@baxi.ia.br'),
      usuario('na verdade, deixa pra lá, só queria saber o preço'),
    ]

    expect(reachedSteps({ messages: conversa })).toContain('email_informado')
  })

  it('furthestStep devolve null sem etapa', () => {
    expect(furthestStep([])).toBeNull()
  })
})
