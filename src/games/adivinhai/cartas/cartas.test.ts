import { describe, expect, it } from 'vitest'
import { normalizarPalpite } from '../palpite'
import { CATEGORIAS } from '../types'
import { CARTAS } from './index'

describe('cartas', () => {
  it('têm 10 cartas por categoria', () => {
    for (const c of CATEGORIAS) {
      expect(CARTAS.filter((x) => x.categoria === c.id).length, c.nome).toBe(10)
    }
  })

  it('não repetem id', () => {
    const ids = CARTAS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('têm exatamente 18 pistas, não vazias, sem repetição', () => {
    for (const c of CARTAS) {
      expect(c.pistas.length, c.id).toBe(18)
      const textos = c.pistas.map(([, t]) => t.trim())
      expect(textos.every((t) => t.length > 10), c.id).toBe(true)
      expect(new Set(textos).size, c.id).toBe(18)
    }
  })

  it('misturam dificuldades (pelo menos 4 de cada)', () => {
    for (const c of CARTAS) {
      for (const dif of ['f', 'm', 'd'] as const) {
        expect(c.pistas.filter(([x]) => x === dif).length, `${c.id} ${dif}`).toBeGreaterThanOrEqual(4)
      }
    }
  })

  it('nenhuma pista contém a resposta ou suas variações', () => {
    for (const c of CARTAS) {
      const alvos = [c.resposta, ...(c.aceitas ?? [])].map(normalizarPalpite).filter(Boolean)
      for (const [, texto] of c.pistas) {
        const p = ` ${normalizarPalpite(texto)} `
        for (const a of alvos) {
          expect(p.includes(` ${a} `), `${c.id}: "${texto}" contém "${a}"`).toBe(false)
        }
      }
    }
  })

  it('têm pelo menos 3 chutes errados, diferentes da resposta', () => {
    for (const c of CARTAS) {
      expect(c.chutes.length, c.id).toBeGreaterThanOrEqual(3)
      const alvos = [c.resposta, ...(c.aceitas ?? [])].map(normalizarPalpite)
      for (const chute of c.chutes) expect(alvos).not.toContain(normalizarPalpite(chute))
    }
  })

  it('anos têm resposta numérica', () => {
    for (const c of CARTAS.filter((x) => x.categoria === 'ano')) expect(c.resposta).toMatch(/^\d{4}$/)
  })
})
