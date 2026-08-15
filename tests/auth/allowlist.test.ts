import { describe, expect, it } from 'vitest'
import { TEAM, displayName, findTeamMember, isTeamMember, normalizeEmail } from '@/lib/auth/allowlist'

describe('allowlist', () => {
  it('tem as quatro pessoas combinadas', () => {
    expect(TEAM.map(m => m.email).sort()).toEqual([
      'lala@baxi.ia.br',
      'leo@baxi.ia.br',
      'luiz@baxi.ia.br',
      'marcus@baxi.ia.br',
    ])
  })

  it('aceita variação de caixa e espaço, que é como email chega de formulário', () => {
    expect(findTeamMember('  LEO@BaXi.IA.br ')?.email).toBe('leo@baxi.ia.br')
  })

  it('recusa quem não está na lista', () => {
    expect(isTeamMember('estranho@example.invalid')).toBe(false)
    expect(findTeamMember('estranho@example.invalid')).toBeNull()
  })

  it('não confunde domínio parecido', () => {
    // Um domínio que só parece o certo não pode passar.
    expect(isTeamMember('leo@baxi-ia.br')).toBe(false)
    expect(isTeamMember('leo@baxi.ia.br.example.invalid')).toBe(false)
  })

  it('normaliza para minúsculas', () => {
    expect(normalizeEmail(' Marcus@BAXI.ia.BR ')).toBe('marcus@baxi.ia.br')
  })

  it('usa o primeiro nome na saudação', () => {
    expect(displayName('lala@baxi.ia.br')).toBe('Lala')
  })
})
