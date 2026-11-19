import { describe, expect, it } from 'vitest'
import { BANCO } from './banco'
import { gerarTabuleiro, gerarTabuleiroDenso } from './gerador'
import type { Tabuleiro } from './types'
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

/** Toda sequência de 2 ou mais letras na grade tem de ser exatamente uma palavra colocada (regra básica de cruzadinha). */
function validarCruzadinha(t: Tabuleiro) {
  const letras = new Map<string, string>()
  const palavras = new Set<string>()
  for (const c of t.palavras) {
    palavras.add(`${c.linha},${c.coluna},${c.direcao},${c.palavra.chave.length}`)
    for (let i = 0; i < c.palavra.chave.length; i++) {
      const l = c.linha + (c.direcao === 'V' ? i : 0)
      const k = c.coluna + (c.direcao === 'H' ? i : 0)
      expect(l).toBeLessThan(t.tamanho)
      expect(k).toBeLessThan(t.tamanho)
      const antes = letras.get(`${l},${k}`)
      if (antes) expect(antes, `conflito em ${l},${k}`).toBe(c.palavra.chave[i])
      letras.set(`${l},${k}`, c.palavra.chave[i])
    }
  }
  const tem = (l: number, c: number) => letras.has(`${l},${c}`)
  for (const d of ['H', 'V'] as const) {
    for (let a = 0; a < t.tamanho; a++) {
      let b = 0
      while (b < t.tamanho) {
        const ocupada = d === 'H' ? tem(a, b) : tem(b, a)
        if (!ocupada) {
          b++
          continue
        }
        const ini = b
        while (b < t.tamanho && (d === 'H' ? tem(a, b) : tem(b, a))) b++
        const comp = b - ini
        if (comp >= 2) {
          const chave = d === 'H' ? `${a},${ini},H,${comp}` : `${ini},${a},V,${comp}`
          expect(palavras.has(chave), `sequência sem palavra: ${chave}`).toBe(true)
        }
      }
    }
  }
  const chaves = t.palavras.map((c) => c.palavra.chave)
  expect(new Set(chaves).size, 'palavra repetida').toBe(chaves.length)
}

describe('gerarTabuleiroDenso', () => {
  it('gera cruzadinhas válidas, cheias e com várias palavras (banco completo)', () => {
    let somaDensidade = 0
    for (let s = 1; s <= 25; s++) {
      const t = gerarTabuleiroDenso(todas, new Set(), { rng: rngSeed(s * 17) })
      validarCruzadinha(t)
      expect(t.palavras.length).toBeGreaterThanOrEqual(10)
      const brancas = new Set<string>()
      for (const c of t.palavras) {
        for (let i = 0; i < c.palavra.chave.length; i++) {
          brancas.add(`${c.linha + (c.direcao === 'V' ? i : 0)},${c.coluna + (c.direcao === 'H' ? i : 0)}`)
        }
      }
      somaDensidade += brancas.size / (t.tamanho * t.tamanho)
    }
    expect(somaDensidade / 25).toBeGreaterThan(0.45)
  })

  it('funciona com uma matéria só (banco menor), mesmo que caia para a grade esparsa', () => {
    for (const lista of Object.values(BANCO)) {
      for (let s = 1; s <= 6; s++) {
        const t = gerarTabuleiroDenso(lista, new Set(), { rng: rngSeed(s * 29) })
        validarCruzadinha(t)
        expect(t.palavras.length).toBeGreaterThanOrEqual(6)
      }
    }
  })

  it('numera as células iniciais sem repetir número entre posições diferentes', () => {
    const t = gerarTabuleiroDenso(todas, new Set(), { rng: rngSeed(3) })
    const porPosicao = new Map<string, number>()
    for (const c of t.palavras) {
      const k = `${c.linha},${c.coluna}`
      if (porPosicao.has(k)) expect(porPosicao.get(k)).toBe(c.numero)
      porPosicao.set(k, c.numero)
    }
    expect(new Set(porPosicao.values()).size).toBe(porPosicao.size)
  })

  it('prefere palavras inéditas quando há de sobra', () => {
    const vistas = new Set(todas.slice(0, 600).map((p) => p.id))
    let inéditas = 0
    let total = 0
    for (let s = 1; s <= 10; s++) {
      const t = gerarTabuleiroDenso(todas, vistas, { rng: rngSeed(s * 5) })
      for (const c of t.palavras) {
        total++
        if (!vistas.has(c.palavra.id)) inéditas++
      }
    }
    expect(inéditas / total).toBeGreaterThan(0.6)
  })
})
