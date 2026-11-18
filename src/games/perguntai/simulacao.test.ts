import { describe, it } from 'vitest'
import { criarRng } from '../../plataforma/rng'
import { jogadaBot } from './bots'
import { aplicar, criarPartida, quemAge } from './motor'
import { PERGUNTAS } from './perguntas'
import type { NivelBot } from './types'

// Rode com: VITE_SIMULAR=1 npx vitest run src/games/perguntai/simulacao.test.ts --reporter=verbose
describe.skipIf(!import.meta.env.VITE_SIMULAR)('simulação de equilíbrio do Perguntaí', () => {
  it('mede duração, duelos e vantagem de quem começa', { timeout: 300000 }, () => {
    const perguntas = PERGUNTAS
    const cenarios: { nome: string; niveis: NivelBot[]; fichas: number }[] = []
    for (const fichas of [3, 4, 6]) {
      for (const n of [2, 3, 4, 6]) cenarios.push({ nome: `${n} bots médios, ${fichas} fichas`, niveis: Array(n).fill('medio'), fichas })
    }
    cenarios.push({ nome: '3 bots difíceis, 6 fichas', niveis: ['dificil', 'dificil', 'dificil'], fichas: 6 })
    cenarios.push({ nome: '3 bots fáceis, 6 fichas', niveis: ['facil', 'facil', 'facil'], fichas: 6 })
    const N = 400
    for (const c of cenarios) {
      let perguntasTotal = 0
      let duelos = 0
      let vitoriaDoInicial = 0
      let turnos = 0
      for (let s = 1; s <= N; s++) {
        const rng = criarRng(s * 7919)
        let e = criarPartida(c.niveis.map((bot, i) => ({ nome: `B${i}`, bot })), rng, { nivel: c.niveis[0], fichasParaVencer: c.fichas })
        const inicial = e.vez
        let ultimaFase = e.fase
        let passos = 0
        while (e.vencedor === null && passos++ < 100000) {
          const quem = quemAge(e)[0]
          e = aplicar(e, jogadaBot(e, quem, rng), perguntas, rng)
          if (e.fase === 'resultado' && ultimaFase !== 'resultado') {
            perguntasTotal++
            if (e.resultado?.tipo === 'duelo') duelos++
          }
          ultimaFase = e.fase
        }
        turnos += e.turno
        if (e.vencedor === inicial) vitoriaDoInicial++
      }
      console.log(
        `${c.nome}: turnos ${(turnos / N).toFixed(0)} | perguntas ${(perguntasTotal / N).toFixed(0)} (${(perguntasTotal / N / c.niveis.length).toFixed(0)} por jogador) | duelos ${(duelos / N).toFixed(1)} | quem começa vence ${((vitoriaDoInicial / N) * 100).toFixed(0)}% (justo = ${(100 / c.niveis.length).toFixed(0)}%)`,
      )
    }
  })
})
