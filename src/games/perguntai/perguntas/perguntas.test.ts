import { describe, expect, it } from 'vitest'
import { CATEGORIAS } from '../types'
import { PERGUNTAS } from './index'

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

describe('banco de perguntas do Perguntaí', () => {
  it('tem 60 perguntas por categoria', () => {
    for (const c of CATEGORIAS) {
      expect(PERGUNTAS.filter((p) => p.categoria === c.id), c.id).toHaveLength(60)
    }
  })

  it('não repete id nem texto', () => {
    expect(new Set(PERGUNTAS.map((p) => p.id)).size).toBe(PERGUNTAS.length)
    expect(new Set(PERGUNTAS.map((p) => norm(p.texto))).size).toBe(PERGUNTAS.length)
  })

  it('ids cabem no limite que a sala online aceita', () => {
    for (const p of PERGUNTAS) expect(p.id.length).toBeLessThanOrEqual(40)
  })

  it('cada pergunta tem 4 alternativas diferentes e a certa não se repete entre as erradas', () => {
    for (const p of PERGUNTAS) {
      const todas = [p.certa, ...p.erradas].map(norm)
      expect(new Set(todas).size, p.texto).toBe(4)
      for (const a of [p.certa, ...p.erradas]) expect(a.trim().length, p.texto).toBeGreaterThan(0)
    }
  })

  it('o texto é uma pergunta e não contém a resposta', () => {
    for (const p of PERGUNTAS) {
      expect(p.texto.trim().endsWith('?'), p.texto).toBe(true)
      expect(p.texto.length, p.texto).toBeLessThanOrEqual(130)
      // respostas de uma letra ou número (ex.: "6") podem aparecer na pergunta sem entregar nada
      if (p.certa.length > 3) expect(norm(p.texto).includes(norm(p.certa)), p.texto).toBe(false)
    }
  })

  it('alternativas curtas: no máximo 40 caracteres', () => {
    for (const p of PERGUNTAS) {
      for (const a of [p.certa, ...p.erradas]) expect(a.length, `${p.texto} -> ${a}`).toBeLessThanOrEqual(40)
    }
  })

  it('cada categoria tem perguntas dos três níveis, com pelo menos 8 difíceis', () => {
    for (const c of CATEGORIAS) {
      const lista = PERGUNTAS.filter((p) => p.categoria === c.id)
      for (const nivel of [1, 2, 3] as const) {
        const n = lista.filter((p) => p.nivel === nivel).length
        expect(n, `${c.id} nível ${nivel}`).toBeGreaterThanOrEqual(nivel === 3 ? 8 : 10)
      }
    }
  })
})
