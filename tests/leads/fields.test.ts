import { describe, expect, it } from 'vitest'
import { isValidEmail, normalizePhone, trimTo } from '@/lib/leads/fields'

describe('isValidEmail', () => {
  it('aceita endereços comuns e ignora espaços nas pontas', () => {
    expect(isValidEmail('marcus@baxi.ia.br')).toBe(true)
    expect(isValidEmail('  marcus@baxi.ia.br  ')).toBe(true)
    expect(isValidEmail('nome.sobrenome+tag@empresa.com.br')).toBe(true)
  })

  it('rejeita endereços sem arroba, sem domínio ou com espaço no meio', () => {
    expect(isValidEmail('marcus')).toBe(false)
    expect(isValidEmail('marcus@')).toBe(false)
    expect(isValidEmail('marcus@empresa')).toBe(false)
    expect(isValidEmail('mar cus@empresa.com')).toBe(false)
    expect(isValidEmail('')).toBe(false)
  })

  it('exige pelo menos dois caracteres no TLD', () => {
    expect(isValidEmail('marcus@empresa.c')).toBe(false)
    expect(isValidEmail('marcus@empresa.co')).toBe(true)
  })
})

describe('normalizePhone', () => {
  it('converte celular e fixo nacionais para E.164', () => {
    expect(normalizePhone('21999998888')).toBe('+5521999998888')
    expect(normalizePhone('2133334444')).toBe('+552133334444')
  })

  it('normaliza as formas que uma pessoa realmente digita', () => {
    expect(normalizePhone('(21) 99999-8888')).toBe('+5521999998888')
    expect(normalizePhone('21 9 9999 8888')).toBe('+5521999998888')
    expect(normalizePhone('+55 21 99999-8888')).toBe('+5521999998888')
  })

  it('preserva número que já vem com código do país', () => {
    expect(normalizePhone('5521999998888')).toBe('+5521999998888')
    expect(normalizePhone('552133334444')).toBe('+552133334444')
  })

  it('retorna null quando a contagem de dígitos não fecha', () => {
    expect(normalizePhone('999998888')).toBeNull()
    expect(normalizePhone('219999988887777')).toBeNull()
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('sem número')).toBeNull()
  })

  it('não inventa DDI para número estrangeiro de 12 a 13 dígitos', () => {
    // 12 dígitos sem começar com 55 não é número brasileiro plausível.
    expect(normalizePhone('351912345678')).toBeNull()
  })
})

describe('trimTo', () => {
  it('corta espaços das pontas e respeita o limite', () => {
    expect(trimTo('  BaXiJen  ', 20)).toBe('BaXiJen')
    expect(trimTo('abcdefghij', 4)).toBe('abcd')
  })

  it('devolve string vazia para qualquer coisa que não seja string', () => {
    expect(trimTo(undefined, 10)).toBe('')
    expect(trimTo(null, 10)).toBe('')
    expect(trimTo(42, 10)).toBe('')
    expect(trimTo({ nome: 'x' }, 10)).toBe('')
  })
})
