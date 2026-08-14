import { describe, expect, it } from 'vitest'
import { ASSUNTOS, assuntoLabel, isAssuntoValido } from '@/lib/contato/assuntos'

describe('ASSUNTOS', () => {
  it('não tem value duplicado', () => {
    const values = ASSUNTOS.map((a) => a.value)
    expect(new Set(values).size).toBe(values.length)
  })

  it('não expõe opção vazia — o placeholder é responsabilidade do formulário', () => {
    // Se o valor vazio entrasse aqui, a rota aceitaria envio sem assunto.
    expect(ASSUNTOS.every((a) => a.value.length > 0)).toBe(true)
    expect(ASSUNTOS.every((a) => a.label.length > 0)).toBe(true)
  })
})

describe('isAssuntoValido', () => {
  it('aceita todos os values da lista', () => {
    for (const { value } of ASSUNTOS) {
      expect(isAssuntoValido(value)).toBe(true)
    }
  })

  it('rejeita o placeholder e valores inventados', () => {
    expect(isAssuntoValido('')).toBe(false)
    expect(isAssuntoValido('qualquer-coisa')).toBe(false)
    expect(isAssuntoValido('AGENTE-IA')).toBe(false)
  })

  it('rejeita tipos que não são string', () => {
    expect(isAssuntoValido(undefined)).toBe(false)
    expect(isAssuntoValido(null)).toBe(false)
    expect(isAssuntoValido(42)).toBe(false)
    expect(isAssuntoValido(['agente-ia'])).toBe(false)
  })

  it('não confunde propriedade herdada de Object com assunto válido', () => {
    // Um Map evita o clássico buraco de usar objeto literal como dicionário.
    expect(isAssuntoValido('toString')).toBe(false)
    expect(isAssuntoValido('constructor')).toBe(false)
  })
})

describe('assuntoLabel', () => {
  it('devolve o rótulo legível que vai para o painel', () => {
    expect(assuntoLabel('agente-ia')).toBe('Quero um agente de IA para minha empresa')
    expect(assuntoLabel('outro')).toBe('Outro')
  })
})
