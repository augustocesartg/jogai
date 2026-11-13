import { describe, it } from 'vitest'
import { jogadaBot } from './bots'
import { CARTAS } from './cartas'
import { aplicar, criarPartida } from './motor'
import { criarRng } from './rng'
import type { NivelBot } from './types'

// Rode com: VITE_SIMULAR=1 npx vitest run src/games/adivinhai/simulacao.test.ts
describe.skipIf(!import.meta.env.VITE_SIMULAR)('simulação de equilíbrio', () => {
  it('mede duração e taxa de vitória do mediador', { timeout: 300000 }, () => {
    const cenarios: { nome: string; niveis: NivelBot[] }[] = [
      { nome: '1 bot fácil (solo)', niveis: ['facil'] },
      { nome: '1 bot médio (solo)', niveis: ['medio'] },
      { nome: '1 bot difícil (solo)', niveis: ['dificil'] },
      { nome: '2 bots médios', niveis: ['medio', 'medio'] },
      { nome: '2 bots difíceis', niveis: ['dificil', 'dificil'] },
      { nome: '4 bots médios', niveis: ['medio', 'medio', 'medio', 'medio'] },
      { nome: '6 bots médios', niveis: ['medio', 'medio', 'medio', 'medio', 'medio', 'medio'] },
    ]
    const N = 2000
    for (const c of cenarios) {
      let rodadas = 0
      let mediador = 0
      let esgotadas = 0
      let rodadasTotal = 0
      let pistasNosAcertos = 0
      let acertos = 0
      for (let s = 1; s <= N; s++) {
        const rng = criarRng(s * 7919)
        let e = criarPartida(c.niveis.map((bot, i) => ({ nome: `B${i}`, bot })), CARTAS, rng, { nivel: c.niveis[0] })
        while (e.vencedor === null) {
          if (e.rodada.fase === 'fim') {
            rodadasTotal++
            if (e.rodada.resultado?.tipo === 'acerto') {
              acertos++
              pistasNosAcertos += e.rodada.usados.length
            }
            if (e.rodada.resultado?.tipo === 'esgotou') esgotadas++
            e = aplicar(e, { tipo: 'proxima' }, CARTAS, rng)
          } else {
            e = aplicar(e, jogadaBot(e, rng), CARTAS, rng)
          }
        }
        rodadas += e.rodadaNum
        if (e.vencedor === 'mediador') mediador++
      }
      console.log(
        `${c.nome}: rodadas/partida ${(rodadas / N).toFixed(1)} | mediador vence ${((mediador / N) * 100).toFixed(0)}% | sem acerto ${((esgotadas / rodadasTotal) * 100).toFixed(0)}% | pistas até acertar ${(pistasNosAcertos / Math.max(1, acertos)).toFixed(1)}`,
      )
    }
  })
})
