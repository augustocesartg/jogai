import { MAX_JOGADORES, MIN_JOGADORES } from '../../plataforma/online/protocolo'
import type { Agenda, JogoServidor } from '../../plataforma/jogo'
import { jogadaBot } from './bots'
import { aplicar, categoriasLivres, criarPartida, NOMES_BOTS, quemAge } from './motor'
import { PERGUNTAS } from './perguntas'
import { visaoDe } from './visao'
import { CATEGORIAS, ESPECIAIS, type Acao, type Estado, type NivelBot } from './types'

const MS_RESPONDER = 20_000
const MS_GIRAR = 15_000
const MS_ESCOLHER = 20_000
const MS_CONTINUAR = 8_000

const ehCategoria = (x: unknown) => CATEGORIAS.some((c) => c.id === x)
const ehEspecial = (x: unknown) => ESPECIAIS.some((s) => s === x)
const inteiro = (x: unknown): x is number => typeof x === 'number' && Number.isInteger(x)

/** Lê uma ação vinda da rede e põe nela quem agiu (nunca confia no que o cliente diz sobre isso). */
function acaoValida(a: unknown, jogador: number): Acao | null {
  if (typeof a !== 'object' || a === null) return null
  const x = a as Record<string, unknown>
  if (x.tipo === 'girar') return { tipo: 'girar', jogador }
  if (x.tipo === 'seguir') return { tipo: 'seguir', jogador }
  if (x.tipo === 'responder' && inteiro(x.opcao)) return { tipo: 'responder', jogador, opcao: x.opcao }
  if (x.tipo === 'escolherCategoria' && ehCategoria(x.categoria)) {
    return { tipo: 'escolherCategoria', jogador, categoria: x.categoria as never }
  }
  if (x.tipo === 'usarEspecial' && ehEspecial(x.especial)) return { tipo: 'usarEspecial', jogador, especial: x.especial as never }
  if (x.tipo === 'desafiar' && inteiro(x.alvo) && ehCategoria(x.aposta) && ehCategoria(x.premio)) {
    return { tipo: 'desafiar', jogador, alvo: x.alvo, aposta: x.aposta as never, premio: x.premio as never }
  }
  return null
}

/** Variação pequena e repetível (sem aleatoriedade no estado) para os bots não agirem sempre no mesmo ritmo. */
const jitter = (e: Estado, base: number, amplitude: number) => base + ((e.seq * 37 + e.turno * 11) % 100) * (amplitude / 100)

/** O Perguntaí na sala online: as regras são as mesmas do modo solo (`motor.ts`). */
export const perguntaiServidor: JogoServidor<Estado> = {
  id: 'perguntai',

  criar(humanos, opcoes, usadas, rng) {
    const o = (typeof opcoes === 'object' && opcoes !== null ? opcoes : {}) as { nivel?: unknown; bots?: unknown; fichas?: unknown }
    const nivel: NivelBot = o.nivel === 'facil' || o.nivel === 'dificil' ? o.nivel : 'medio'
    const fichas = o.fichas === 3 || o.fichas === 6 ? o.fichas : 4
    const bots = Math.max(0, Math.min(MAX_JOGADORES - humanos.length, Math.floor(Number(o.bots) || 0)))
    if (humanos.length + bots < MIN_JOGADORES) return null
    // bot nunca leva o nome de um humano da sala
    const ocupados = new Set(humanos.map((n) => n.toLowerCase()))
    const nomesBots = NOMES_BOTS.filter((n) => !ocupados.has(n.toLowerCase())).concat(NOMES_BOTS.map((n) => `${n} 🤖`))
    return criarPartida(
      [...humanos.map((nome) => ({ nome, bot: null })), ...Array.from({ length: bots }, (_, i) => ({ nome: nomesBots[i], bot: nivel }))],
      rng,
      { nivel, usadas, fichasParaVencer: fichas },
    )
  },

  jogadores: (e) => e.jogadores.map((j) => ({ nome: j.nome, bot: j.bot !== null })),

  aplicar(e, acao, eu, rng) {
    // `eu` = -1 só quando é o próprio servidor agindo (a ação dele já traz o jogador)
    const jogador = eu >= 0 ? eu : typeof (acao as { jogador?: unknown } | null)?.jogador === 'number' ? (acao as { jogador: number }).jogador : -1
    const a = acaoValida(acao, jogador)
    if (!a || !quemAge(e).includes(jogador)) return null
    const depois = aplicar(e, a, PERGUNTAS, rng)
    // ação inválida não muda nada e não pode reiniciar o relógio da sala
    return JSON.stringify(depois) === JSON.stringify(e) ? null : depois
  },

  visao: (e, eu) => visaoDe(e, eu),

  terminou: (e) => e.vencedor !== null,

  agenda(e): Agenda | null {
    if (e.vencedor !== null || e.fase === 'fim') return null
    if (e.fase === 'duelo') {
      const pendentes = quemAge(e)
      const bot = pendentes.find((i) => e.jogadores[i].bot !== null)
      if (bot !== undefined) return { jogador: bot, tipo: 'bot', ms: jitter(e, 2500, 3500) }
      return pendentes.length > 0 ? { jogador: pendentes[0], tipo: 'humano', ms: MS_RESPONDER } : null
    }
    const bot = e.jogadores[e.vez].bot !== null
    if (e.fase === 'resultado') {
      return bot ? { jogador: e.vez, tipo: 'bot', ms: 2600 } : { jogador: null, tipo: 'proxima', ms: MS_CONTINUAR }
    }
    if (bot) {
      // depois do giro, dá tempo da animação da roleta antes de o bot responder
      const fresca = e.fase === 'responder' && e.pergunta !== null && e.pergunta.erradas.length === 0 && e.pergunta.eliminadas.length === 0
      return { jogador: e.vez, tipo: 'bot', ms: fresca ? jitter(e, 3200, 1500) : jitter(e, 1200, 800) }
    }
    const ms = e.fase === 'girar' ? MS_GIRAR : e.fase === 'categoria' ? MS_ESCOLHER : MS_RESPONDER
    return { jogador: e.vez, tipo: 'humano', ms }
  },

  automatico(e, a, rng): Acao {
    if (a.tipo === 'bot' && a.jogador !== null) return jogadaBot(e, a.jogador, rng)
    if (a.tipo === 'proxima') return { tipo: 'seguir', jogador: e.vez }
    // tempo esgotado: faz a jogada mais simples
    const i = a.jogador ?? e.vez
    if (e.fase === 'girar') return { tipo: 'girar', jogador: i }
    if (e.fase === 'categoria') {
      const livres = categoriasLivres(e, i)
      return { tipo: 'escolherCategoria', jogador: i, categoria: livres[Math.floor(rng() * livres.length)] }
    }
    if (e.fase === 'resultado') return { tipo: 'seguir', jogador: i }
    return { tipo: 'responder', jogador: i, opcao: -1 }
  },

  usadas: (e) => e.usadas,
}
