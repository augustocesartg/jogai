import { describe, it } from 'vitest'
import { BANCO } from './banco'
import { extrairVagas, limpar, mascaraTrelica, preencher, silhueta } from './denso'

function rngSeed(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

// Rode com: VITE_SIMULAR=1 npx vitest run src/games/palavras-cruzadas/densidade.test.ts --reporter=verbose
describe.skipIf(!import.meta.env.VITE_SIMULAR)('densidade do gerador denso', () => {
  it('mede sucesso, tempo e densidade', { timeout: 300000 }, () => {
    const pools = { todas: Object.values(BANCO).flat(), historia: BANCO.historia }
    for (const [nome, pool] of Object.entries(pools)) {
      for (const periodo of [2, 3]) {
        for (const forma of ['retangular', 'redonda'] as const) {
          let ok = 0
          let dens = 0
          let vagasTot = 0
          let t = 0
          const N = 40
          for (let s = 1; s <= N; s++) {
            const rng = rngSeed(s * 131 + periodo)
            const m = limpar(silhueta(mascaraTrelica(11, periodo, rng), forma))
            const vagas = extrairVagas(m)
            const t0 = Date.now()
            const r = preencher(vagas, [...pool].sort(() => rng() - 0.5), rng, 4000)
            t += Date.now() - t0
            if (r) {
              ok++
              dens += m.flat().filter(Boolean).length / 121
              vagasTot += vagas.length
            }
          }
          console.log(`${nome} p${periodo} ${forma}: sucesso ${ok}/${N} | densidade ${(dens / Math.max(1, ok) * 100).toFixed(0)}% | vagas ${(vagasTot / Math.max(1, ok)).toFixed(0)} | ${(t / N).toFixed(0)} ms por tentativa`)
        }
      }
    }
  })
})
