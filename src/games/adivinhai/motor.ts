import { conferirPalpite } from './palpite'
import { embaralhar, type Rng } from './rng'
import {
  CASAS,
  TOTAL_ITENS,
  type Acao,
  type Carta,
  type Comando,
  type Estado,
  type Item,
  type NivelBot,
  type Rodada,
} from './types'

export const CORES = ['#4F46E5', '#EC4899', '#10B981', '#3B82F6', '#F97316', '#8B5CF6']

export interface ConfigJogador {
  nome: string
  bot: NivelBot | null
}

const COMANDOS: Comando[] = ['perca', 'avance2', 'volte1', 'outro']

export const TEXTO_COMANDO: Record<Comando, string> = {
  perca: 'Perca a vez',
  avance2: 'Avance 2 casas',
  volte1: 'Volte 1 casa',
  outro: 'Escolha outro número',
}

/** Monta os 20 itens: pistas da carta + 2 ou 3 comandos, tudo em ordem sorteada. */
export function montarItens(carta: Carta, rng: Rng): Item[] {
  const nComandos = rng() < 0.5 ? 2 : 3
  const comandos: Item[] = embaralhar(COMANDOS, rng)
    .slice(0, nComandos)
    .map((comando) => ({ tipo: 'comando', comando }))
  const pistas: Item[] = embaralhar(carta.pistas, rng)
    .slice(0, TOTAL_ITENS - nComandos)
    .map(([dif, texto]) => ({ tipo: 'pista', dif, texto }))
  return embaralhar([...pistas, ...comandos], rng)
}

function sortearCarta(cartas: Carta[], usadas: string[], rng: Rng): { carta: Carta; usadas: string[] } {
  let livres = cartas.filter((c) => !usadas.includes(c.id))
  let base = usadas
  if (livres.length === 0) {
    livres = cartas
    base = []
  }
  const carta = livres[Math.floor(rng() * livres.length)]
  return { carta, usadas: [...base, carta.id] }
}

function novaRodada(carta: Carta, vez: number, rng: Rng): Rodada {
  return { carta, itens: montarItens(carta, rng), usados: [], vez, fase: 'escolher', atual: null, resultado: null }
}

export function criarPartida(jogadores: ConfigJogador[], cartas: Carta[], rng: Rng): Estado {
  const { carta, usadas } = sortearCarta(cartas, [], rng)
  return {
    jogadores: jogadores.map((j, i) => ({ id: `j${i}`, nome: j.nome, bot: j.bot, pos: 0, cor: CORES[i % CORES.length] })),
    mediador: 0,
    rodadaNum: 1,
    inicio: 0,
    rodada: novaRodada(carta, 0, rng),
    cartasUsadas: usadas,
    vencedor: null,
    historico: [],
    eventos: [],
    seq: 0,
  }
}

function log(e: Estado, msg: string) {
  e.historico = [...e.historico, msg].slice(-14)
}

function moverMediador(e: Estado, delta: number) {
  e.mediador += delta
  if (e.vencedor === null && e.mediador >= CASAS) e.vencedor = 'mediador'
}

function moverJogador(e: Estado, i: number, delta: number) {
  const j = e.jogadores[i]
  j.pos = Math.max(0, j.pos + delta)
  if (e.vencedor === null && j.pos >= CASAS) e.vencedor = i
}

function encerrarSeVenceu(e: Estado): boolean {
  if (e.vencedor === null) return false
  e.rodada.fase = 'fim'
  e.rodada.resultado ??= { tipo: 'vitoria' }
  return true
}

/** Passa a vez ao próximo jogador, ou encerra a rodada se todos os números foram usados. */
function seguir(e: Estado) {
  const r = e.rodada
  if (encerrarSeVenceu(e)) return
  if (r.usados.length >= TOTAL_ITENS) {
    r.fase = 'fim'
    r.atual = null
    r.resultado = { tipo: 'esgotou' }
    log(e, `Acabaram as dicas! A resposta era ${r.carta.resposta}.`)
    e.eventos.push({ tipo: 'esgotou' })
    return
  }
  r.vez = (r.vez + 1) % e.jogadores.length
  r.fase = 'escolher'
  r.atual = null
}

/** Mesma vez, outro número (comando "Escolha outro número"), a menos que não sobre número. */
function continuarVez(e: Estado) {
  const r = e.rodada
  if (encerrarSeVenceu(e)) return
  if (r.usados.length >= TOTAL_ITENS) return seguir(e)
  r.fase = 'escolher'
  r.atual = null
}

function escolher(e: Estado, numero: number) {
  const r = e.rodada
  const jogador = e.jogadores[r.vez]
  if (r.fase !== 'escolher' || e.vencedor !== null) return
  if (!Number.isInteger(numero) || numero < 1 || numero > TOTAL_ITENS || r.usados.includes(numero)) return

  r.usados.push(numero)
  r.atual = numero
  const item = r.itens[numero - 1]

  if (item.tipo === 'pista') {
    r.fase = 'palpitar'
    log(e, `${jogador.nome} escolheu o ${numero}.`)
    return
  }

  moverMediador(e, 1)
  e.eventos.push({ tipo: 'comando', comando: item.comando, jogador: r.vez })
  log(e, `${jogador.nome} escolheu o ${numero}: ${TEXTO_COMANDO[item.comando]}. Mediador +1.`)
  if (item.comando === 'avance2') moverJogador(e, r.vez, 2)
  if (item.comando === 'volte1') moverJogador(e, r.vez, -1)
  if (item.comando === 'outro') continuarVez(e)
  else seguir(e)
}

function errou(e: Estado, passou: boolean) {
  const r = e.rodada
  const jogador = e.jogadores[r.vez]
  moverMediador(e, 1)
  e.eventos.push({ tipo: 'erro', jogador: r.vez, passou })
  log(e, passou ? `${jogador.nome} passou. Mediador +1.` : `${jogador.nome} errou. Mediador +1.`)
  seguir(e)
}

function palpitar(e: Estado, texto: string) {
  const r = e.rodada
  if (r.fase !== 'palpitar' || e.vencedor !== null) return
  const i = r.vez
  if (conferirPalpite(r.carta, texto)) {
    const casas = Math.max(0, TOTAL_ITENS - r.usados.length)
    r.resultado = { tipo: 'acerto', jogador: i, casas }
    e.eventos.push({ tipo: 'acerto', jogador: i, casas })
    r.fase = 'fim'
    r.atual = null
    log(e, `${e.jogadores[i].nome} acertou: ${r.carta.resposta}! Avança ${casas} casas.`)
    moverJogador(e, i, casas)
    encerrarSeVenceu(e)
  } else {
    errou(e, false)
  }
}

function proxima(e: Estado, cartas: Carta[], rng: Rng) {
  if (e.rodada.fase !== 'fim' || e.vencedor !== null) return
  const { carta, usadas } = sortearCarta(cartas, e.cartasUsadas, rng)
  e.cartasUsadas = usadas
  e.rodadaNum += 1
  e.inicio = (e.inicio + 1) % e.jogadores.length
  e.rodada = novaRodada(carta, e.inicio, rng)
  e.eventos.push({ tipo: 'rodada', numero: e.rodadaNum })
}

/** Função pura: devolve um novo estado, sem alterar o recebido. */
export function aplicar(estado: Estado, acao: Acao, cartas: Carta[], rng: Rng): Estado {
  const e = structuredClone(estado)
  e.eventos = []
  if (acao.tipo === 'escolher') escolher(e, acao.numero)
  else if (acao.tipo === 'palpitar') palpitar(e, acao.texto)
  else if (acao.tipo === 'passar') {
    if (e.rodada.fase === 'palpitar' && e.vencedor === null) errou(e, true)
  } else proxima(e, cartas, rng)
  if (e.eventos.length > 0) e.seq += 1
  else e.eventos = estado.eventos
  return e
}
