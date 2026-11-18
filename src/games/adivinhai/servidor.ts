import { MAX_JOGADORES, MIN_JOGADORES } from '../../plataforma/online/protocolo'
import type { JogoServidor } from '../../plataforma/jogo'
import { jogadaBot } from './bots'
import { CARTAS } from './cartas'
import { aplicar, criarPartida, NOMES_BOTS } from './motor'
import type { Acao, Estado, NivelBot } from './types'
import { TOTAL_ITENS } from './types'
import { visaoDe } from './visao'

function acaoValida(a: unknown): Acao | null {
  if (typeof a !== 'object' || a === null) return null
  const x = a as Record<string, unknown>
  if (x.tipo === 'escolher' && typeof x.numero === 'number') return { tipo: 'escolher', numero: x.numero }
  if (x.tipo === 'palpitar' && typeof x.texto === 'string') return { tipo: 'palpitar', texto: x.texto.slice(0, 80) }
  if (x.tipo === 'passar') return { tipo: 'passar' }
  if (x.tipo === 'proxima') return { tipo: 'proxima' }
  return null
}

/** O Adivinhaí na sala online: as regras são as mesmas do modo solo (`motor.ts`). */
export const adivinhaiServidor: JogoServidor<Estado> = {
  id: 'adivinhai',

  criar(humanos, opcoes, usadas, rng) {
    const o = (typeof opcoes === 'object' && opcoes !== null ? opcoes : {}) as { nivel?: unknown; bots?: unknown }
    const nivel: NivelBot = o.nivel === 'facil' || o.nivel === 'dificil' ? o.nivel : 'medio'
    const bots = Math.max(0, Math.min(MAX_JOGADORES - humanos.length, Math.floor(Number(o.bots) || 0)))
    if (humanos.length + bots < MIN_JOGADORES) return null
    // bot nunca leva o nome de um humano da sala
    const ocupados = new Set(humanos.map((n) => n.toLowerCase()))
    const nomesBots = NOMES_BOTS.filter((n) => !ocupados.has(n.toLowerCase())).concat(NOMES_BOTS.map((n) => `${n} 🤖`))
    return criarPartida(
      [...humanos.map((nome) => ({ nome, bot: null })), ...Array.from({ length: bots }, (_, i) => ({ nome: nomesBots[i], bot: nivel }))],
      CARTAS,
      rng,
      { nivel, usadas },
    )
  },

  jogadores: (e) => e.jogadores.map((j) => ({ nome: j.nome, bot: j.bot !== null })),

  aplicar(e, acao, eu, rng) {
    const a = acaoValida(acao)
    if (!a) return null
    // jogar só na própria vez; avançar a rodada vale para qualquer um
    if (eu >= 0 && a.tipo !== 'proxima' && e.rodada.vez !== eu) return null
    const depois = aplicar(e, a, CARTAS, rng)
    // ação inválida não muda nada e não pode reiniciar o relógio da sala
    return JSON.stringify(depois) === JSON.stringify(e) ? null : depois
  },

  visao: (e) => visaoDe(e),

  terminou: (e) => e.vencedor !== null,

  agenda(e) {
    if (e.vencedor !== null) return null
    const r = e.rodada
    if (r.fase === 'fim') return { jogador: null, tipo: 'proxima' }
    return { jogador: r.vez, tipo: e.jogadores[r.vez].bot ? 'bot' : 'humano' }
  },

  automatico(e, a, rng): Acao {
    if (a.tipo === 'proxima') return { tipo: 'proxima' }
    if (a.tipo === 'bot') return jogadaBot(e, rng)
    // tempo esgotado: escolhe um número ao acaso ou passa
    const r = e.rodada
    if (r.fase === 'escolher') {
      const livres = Array.from({ length: TOTAL_ITENS }, (_, i) => i + 1).filter((n) => !r.usados.includes(n))
      return { tipo: 'escolher', numero: livres[Math.floor(rng() * livres.length)] }
    }
    return { tipo: 'passar' }
  },

  usadas: (e) => e.cartasUsadas,
}
