import { describe, expect, it } from 'vitest'
import { unirVistas } from './vistas'

describe('unirVistas', () => {
  it('junta sem repetir e deixa as mais recentes de qualquer jogador no fim', () => {
    const r = unirVistas([
      ['a', 'b', 'c', 'd'],
      ['x', 'a'],
    ])
    expect(new Set(r).size).toBe(r.length)
    expect([...r].sort()).toEqual(['a', 'b', 'c', 'd', 'x'])
    // 'a' é a mais recente do segundo jogador e 'd' a do primeiro: ambas ficam no fim
    expect(r.slice(-2).sort()).toEqual(['a', 'd'])
  })

  it('aceita listas vazias', () => {
    expect(unirVistas([[], []])).toEqual([])
  })
})
