import { describe, expect, it } from 'vitest'
import { CARTAS } from './cartas'
import { aplicar, criarPartida } from './motor'
import { criarRng } from './rng'
import { visaoDe } from './visao'

describe('visaoDe', () => {
  it('não vaza a resposta nem pistas não escolhidas durante a rodada', () => {
    const rng = criarRng(7)
    let e = criarPartida([{ nome: 'A', bot: null }, { nome: 'B', bot: null }], CARTAS, rng)
    const carta = e.rodada.carta
    e = aplicar(e, { tipo: 'escolher', numero: 3 }, CARTAS, rng)
    const json = JSON.stringify(visaoDe(e))
    expect(json).not.toContain(carta.resposta)
    expect(json).not.toContain('chutes')
    const naoEscolhidas = e.rodada.itens
      .map((it, i) => ({ it, n: i + 1 }))
      .filter(({ n }) => !e.rodada.usados.includes(n))
    for (const { it } of naoEscolhidas) {
      if (it.tipo === 'pista') expect(json).not.toContain(it.texto)
    }
    expect(visaoDe(e).rodada.itens.filter(Boolean)).toHaveLength(1)
  })

  it('mostra a resposta quando a rodada termina', () => {
    const rng = criarRng(9)
    let e = criarPartida([{ nome: 'A', bot: null }, { nome: 'B', bot: null }], CARTAS, rng)
    for (let n = 1; e.rodada.fase !== 'fim' && n <= 20; n++) {
      e = aplicar(e, { tipo: 'escolher', numero: n }, CARTAS, rng)
      if (e.rodada.fase === 'palpitar') e = aplicar(e, { tipo: 'palpitar', texto: e.rodada.carta.resposta }, CARTAS, rng)
    }
    expect(visaoDe(e).rodada.resposta).toBe(e.rodada.carta.resposta)
  })
})
