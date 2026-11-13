import { describe, expect, it } from 'vitest'
import { definirSom, somLigado, tocar } from './sons'

describe('sons', () => {
  it('tocar não quebra quando não há áudio disponível', () => {
    expect(() => tocar('acerto')).not.toThrow()
    expect(() => tocar(['pista', 'erro'])).not.toThrow()
  })
  it('alterna o som ligado/desligado', () => {
    definirSom(false)
    expect(somLigado()).toBe(false)
    expect(() => tocar('vitoria')).not.toThrow()
    definirSom(true)
    expect(somLigado()).toBe(true)
  })
})
