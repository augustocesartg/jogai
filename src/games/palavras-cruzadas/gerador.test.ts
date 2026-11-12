import { describe, expect, it } from 'vitest'
import { BANCO } from './banco'
import { gerarTabuleiro } from './gerador'
import { normalizar } from './normalizar'

const todas = Object.values(BANCO).flat()

function rngSeed(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

describe('banco de palavras', () => {
  it('não tem ids duplicados', () => {
    const ids = todas.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('tem 300 palavras por matéria', () => {
    for (const lista of Object.values(BANCO)) expect(lista.length).toBe(300)
  })
  it('não repete a mesma resposta entre matérias', () => {
    const chaves = todas.map((p) => p.chave)
    expect(new Set(chaves).size).toBe(chaves.length)
  })
  it('respostas têm de 3 a 12 letras e dica', () => {
    for (const p of todas) {
      expect(p.chave.length).toBeGreaterThanOrEqual(3)
      expect(p.chave.length).toBeLessThanOrEqual(12)
      expect(p.dica.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('normalizar', () => {
  it('remove acentos e cedilha', () => {
    expect(normalizar('Cleópatra')).toBe('CLEOPATRA')
    expect(normalizar('Ação')).toBe('ACAO')
  })
})

describe('gerarTabuleiro', () => {
  it('gera grade válida e conectada com várias palavras', () => {
    for (let s = 1; s <= 20; s++) {
      const t = gerarTabuleiro(todas, new Set(), { rng: rngSeed(s) })
      expect(t.palavras.length).toBeGreaterThanOrEqual(6)
      const grade = new Map<string, string>()
      for (const c of t.palavras) {
        for (let i = 0; i < c.palavra.chave.length; i++) {
          const l = c.linha + (c.direcao === 'V' ? i : 0)
          const k = c.coluna + (c.direcao === 'H' ? i : 0)
          expect(l).toBeLessThan(t.tamanho)
          expect(k).toBeLessThan(t.tamanho)
          const letra = c.palavra.chave[i]
          const antes = grade.get(`${l},${k}`)
          if (antes) expect(antes).toBe(letra)
          grade.set(`${l},${k}`, letra)
        }
      }
    }
  })
  it('prioriza palavras não vistas', () => {
    const vistas = new Set(todas.slice(0, todas.length - 120).map((p) => p.id))
    const t = gerarTabuleiro(todas, vistas, { rng: rngSeed(7) })
    const novas = t.palavras.filter((c) => !vistas.has(c.palavra.id))
    expect(novas.length).toBe(t.palavras.length)
  })
})
