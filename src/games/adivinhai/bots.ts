import type { Rng } from './rng'
import type { Acao, Dif, Estado, NivelBot, NivelCarta } from './types'

const PESO: Record<Dif, number> = { f: 0.14, m: 0.08, d: 0.04 }
/** Ajusta o quão rápido o bot "descobre" a resposta; calibrado por simulação. */
const FATOR = 1
/** Cartas difíceis também custam mais aos bots. */
const FATOR_CARTA: Record<NivelCarta, number> = { 1: 1.1, 2: 1, 3: 0.85 }
const HABILIDADE: Record<NivelBot, number> = { facil: 0.7, medio: 1, dificil: 2.6 }
/** Disposição de arriscar um palpite: errar custa o mesmo que passar, então o difícil sempre tenta. */
const OUSADIA: Record<NivelBot, { base: number; inclinacao: number }> = {
  facil: { base: 0.15, inclinacao: 1.2 },
  medio: { base: 0.25, inclinacao: 1.5 },
  dificil: { base: 1, inclinacao: 0 },
}

/** Chance de o bot saber a resposta, dadas as pistas já reveladas. */
export function chanceDeAcerto(e: Estado, nivel: NivelBot): number {
  const r = e.rodada
  let soma = 0
  for (const n of r.usados) {
    const item = r.itens[n - 1]
    if (item.tipo === 'pista') soma += PESO[item.dif]
  }
  return 1 - Math.exp(-FATOR * FATOR_CARTA[r.carta.nivel] * HABILIDADE[nivel] * soma)
}

/** Decide a próxima ação do bot da vez. */
export function jogadaBot(e: Estado, rng: Rng): Acao {
  const r = e.rodada
  const bot = e.jogadores[r.vez].bot ?? 'medio'

  if (r.fase === 'escolher') {
    const livres = Array.from({ length: r.itens.length }, (_, i) => i + 1).filter((n) => !r.usados.includes(n))
    return { tipo: 'escolher', numero: livres[Math.floor(rng() * livres.length)] }
  }

  const p = chanceDeAcerto(e, bot)
  const o = OUSADIA[bot]
  const arrisca = rng() < Math.min(1, o.base + o.inclinacao * p)
  if (!arrisca) return { tipo: 'passar' }
  if (rng() < p) return { tipo: 'palpitar', texto: r.carta.resposta }
  const chutes = r.carta.chutes
  return { tipo: 'palpitar', texto: chutes.length ? chutes[Math.floor(rng() * chutes.length)] : 'não sei' }
}
