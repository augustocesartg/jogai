import { embaralhar, type Rng } from '../../plataforma/rng'
import { CORES } from '../../plataforma/tipos'
import {
  CASAS_TRILHA,
  CATEGORIAS,
  ESPECIAIS,
  FICHAS_TOTAL,
  MIN_DUELO,
  TEXTO_ESPECIAL,
  type Acao,
  type Categoria,
  type Estado,
  type Especial,
  type NivelBot,
  type NivelPergunta,
  type Pergunta,
  type PerguntaAtual,
  type Valor,
} from './types'

export interface ConfigJogador {
  nome: string
  bot: NivelBot | null
}

export interface OpcoesPartida {
  /** dificuldade das perguntas sorteadas */
  nivel?: NivelBot
  /** ids das perguntas já vistas em partidas anteriores (da mais antiga para a mais recente) */
  usadas?: string[]
  /** fichas necessárias para vencer (6 no jogo de tabuleiro) */
  fichasParaVencer?: number
}

/** Peso de cada nível de pergunta no sorteio, conforme a dificuldade escolhida. */
const PESOS: Record<NivelBot, Record<NivelPergunta, number>> = {
  facil: { 1: 4, 2: 2, 3: 0.5 },
  medio: { 1: 1, 2: 2, 3: 1.5 },
  dificil: { 1: 0.3, 2: 1, 3: 4 },
}

/** Fração das perguntas de uma categoria (as mais recentes) que não volta logo depois de o ciclo recomeçar. */
const RECENTES = 0.2

export const NOMES_BOTS = ['Ana', 'Beto', 'Carla', 'Davi', 'Eva']

const nomeDe = (e: Estado, i: number) => e.jogadores[i].nome

function log(e: Estado, msg: string) {
  e.historico = [...e.historico, msg].slice(-14)
}

/** Sorteia uma pergunta inédita da categoria e embaralha as alternativas. */
function sortear(e: Estado, categoria: Categoria, perguntas: Pergunta[], rng: Rng, valor: Valor, excluir?: string): PerguntaAtual {
  const daCategoria = perguntas.filter((p) => p.categoria === categoria)
  let livres = daCategoria.filter((p) => !e.usadas.includes(p.id) && p.id !== excluir)
  if (livres.length === 0) {
    // todas já saíram: recomeça o ciclo, mas as mais recentes continuam de fora
    const ids = new Set(daCategoria.map((p) => p.id))
    const recentes = e.usadas.filter((id) => ids.has(id)).slice(-Math.max(1, Math.floor(daCategoria.length * RECENTES)))
    const manter = new Set(recentes)
    e.usadas = e.usadas.filter((id) => !ids.has(id) || manter.has(id))
    livres = daCategoria.filter((p) => !e.usadas.includes(p.id) && p.id !== excluir)
    if (livres.length === 0) livres = daCategoria
  }
  const pesos = livres.map((p) => PESOS[e.nivelPerguntas][p.nivel])
  let sorteio = rng() * pesos.reduce((a, b) => a + b, 0)
  let escolhida = livres[livres.length - 1]
  for (let i = 0; i < livres.length; i++) {
    sorteio -= pesos[i]
    if (sorteio <= 0) {
      escolhida = livres[i]
      break
    }
  }
  e.usadas = [...e.usadas.filter((id) => id !== escolhida.id), escolhida.id]
  const opcoes = embaralhar([escolhida.certa, ...escolhida.erradas], rng)
  return {
    id: escolhida.id,
    categoria,
    nivel: escolhida.nivel,
    texto: escolhida.texto,
    opcoes,
    correta: opcoes.indexOf(escolhida.certa),
    eliminadas: [],
    tentativas: 1,
    erradas: [],
    valor,
  }
}

export function criarPartida(jogadores: ConfigJogador[], rng: Rng, opcoes: OpcoesPartida = {}): Estado {
  const nivel = opcoes.nivel ?? 'medio'
  // no tabuleiro quem tira a Coroa primeiro começa: equivale a sortear quem inicia
  const inicio = Math.floor(rng() * jogadores.length)
  const e: Estado = {
    jogadores: jogadores.map((j, i) => ({
      id: `j${i}`,
      nome: j.nome,
      bot: j.bot,
      cor: CORES[i % CORES.length],
      trilha: 0,
      fichas: [],
      especiais: { bomba: 1, chanceDupla: 1, tiroExtra: 1, passar: 1 },
    })),
    vez: inicio,
    fase: 'girar',
    valorPendente: null,
    giro: null,
    pergunta: null,
    duelo: null,
    resultado: null,
    fichasParaVencer: Math.max(1, Math.min(FICHAS_TOTAL, opcoes.fichasParaVencer ?? FICHAS_TOTAL)),
    nivelPerguntas: nivel,
    usadas: [...(opcoes.usadas ?? [])],
    vencedor: null,
    turno: 1,
    historico: [],
    eventos: [],
    seq: 0,
  }
  comecarVez(e)
  return e
}

/** Quem pode agir agora: o jogador da vez, ou os duelistas que ainda não responderam. */
export function quemAge(e: Estado): number[] {
  if (e.vencedor !== null || e.fase === 'fim') return []
  if (e.fase === 'duelo' && e.duelo) {
    return [e.duelo.desafiante, e.duelo.alvo].filter((i) => e.duelo!.respostas[i] === undefined)
  }
  return [e.vez]
}

/** Quem a categoria sorteada ainda não deu ficha: as únicas que valem na Coroa. */
export function categoriasLivres(e: Pick<Estado, 'jogadores' | 'vez'>, i = e.vez): Categoria[] {
  const tem = new Set(e.jogadores[i].fichas)
  return CATEGORIAS.map((c) => c.id).filter((c) => !tem.has(c))
}

/** Desafios possíveis para o jogador da vez (vazio quando o duelo não está disponível). */
export function desafiosPossiveis(e: Pick<Estado, 'jogadores' | 'vez'>, i = e.vez): { alvo: number; aposta: Categoria; premio: Categoria }[] {
  if (e.jogadores.length < MIN_DUELO) return []
  const eu = e.jogadores[i]
  const lista: { alvo: number; aposta: Categoria; premio: Categoria }[] = []
  e.jogadores.forEach((outro, alvo) => {
    if (alvo === i) return
    // cada um precisa ter uma ficha que o outro não tem: a troca é sempre de categorias diferentes
    for (const premio of outro.fichas) {
      if (eu.fichas.includes(premio)) continue
      for (const aposta of eu.fichas) {
        if (!outro.fichas.includes(aposta)) lista.push({ alvo, aposta, premio })
      }
    }
  })
  return lista
}

/** Começa a vez de e.vez: quem está na Coroa vai direto à pergunta da ficha, os outros giram a roleta. */
function comecarVez(e: Estado) {
  e.pergunta = null
  e.duelo = null
  e.resultado = null
  e.giro = null
  if (e.jogadores[e.vez].trilha >= CASAS_TRILHA - 1) {
    e.fase = 'categoria'
    e.valorPendente = 'ficha-trilha'
  } else {
    e.fase = 'girar'
    e.valorPendente = null
  }
}

function passarVez(e: Estado) {
  e.vez = (e.vez + 1) % e.jogadores.length
  e.turno += 1
  comecarVez(e)
  e.eventos.push({ tipo: 'vez', jogador: e.vez })
}

function ganharFicha(e: Estado, i: number, categoria: Categoria) {
  const j = e.jogadores[i]
  if (!j.fichas.includes(categoria)) j.fichas.push(categoria)
  if (e.vencedor === null && j.fichas.length >= e.fichasParaVencer) e.vencedor = i
}

function encerrarSeVenceu(e: Estado): boolean {
  if (e.vencedor === null) return false
  e.fase = 'fim'
  return true
}

function girar(e: Estado, perguntas: Pergunta[], rng: Rng) {
  if (e.fase !== 'girar') return
  const lados = CATEGORIAS.length + 1
  const s = Math.floor(rng() * lados)
  const resultado: Categoria | 'coroa' = s < CATEGORIAS.length ? CATEGORIAS[s].id : 'coroa'
  e.giro = resultado
  e.eventos.push({ tipo: 'giro', jogador: e.vez, resultado })
  if (resultado === 'coroa') {
    e.fase = 'categoria'
    e.valorPendente = 'ficha-roleta'
    log(e, `${nomeDe(e, e.vez)} tirou a Coroa!`)
    return
  }
  e.pergunta = sortear(e, resultado, perguntas, rng, 'trilha')
  e.fase = 'responder'
  log(e, `${nomeDe(e, e.vez)} tirou ${CATEGORIAS.find((c) => c.id === resultado)!.nome}.`)
}

function escolherCategoria(e: Estado, categoria: Categoria, perguntas: Pergunta[], rng: Rng) {
  if (e.fase !== 'categoria' || !e.valorPendente) return
  if (!categoriasLivres(e).includes(categoria)) return
  e.pergunta = sortear(e, categoria, perguntas, rng, e.valorPendente)
  e.valorPendente = null
  e.fase = 'responder'
  log(e, `${nomeDe(e, e.vez)} escolheu ${CATEGORIAS.find((c) => c.id === categoria)!.nome} valendo ficha.`)
}

function desafiar(e: Estado, a: Extract<Acao, { tipo: 'desafiar' }>, perguntas: Pergunta[], rng: Rng) {
  if (e.fase !== 'categoria') return
  const valido = desafiosPossiveis(e).some((d) => d.alvo === a.alvo && d.aposta === a.aposta && d.premio === a.premio)
  if (!valido) return
  e.pergunta = sortear(e, a.premio, perguntas, rng, 'duelo')
  e.duelo = { desafiante: e.vez, alvo: a.alvo, aposta: a.aposta, premio: a.premio, respostas: {} }
  e.valorPendente = null
  e.fase = 'duelo'
  e.eventos.push({ tipo: 'duelo', desafiante: e.vez, alvo: a.alvo })
  log(e, `${nomeDe(e, e.vez)} desafiou ${nomeDe(e, a.alvo)} para um duelo!`)
}

function resolverAcerto(e: Estado) {
  const p = e.pergunta!
  const i = e.vez
  const j = e.jogadores[i]
  e.eventos.push({ tipo: 'acerto', jogador: i })
  if (p.valor === 'trilha') {
    j.trilha = Math.min(CASAS_TRILHA - 1, j.trilha + 1)
    e.resultado = { tipo: 'acerto', jogador: i, valor: p.valor, chegouCoroa: j.trilha === CASAS_TRILHA - 1 }
    log(e, `${j.nome} acertou e avançou na trilha.`)
  } else {
    ganharFicha(e, i, p.categoria)
    j.trilha = 0
    e.resultado = { tipo: 'ficha', jogador: i, categoria: p.categoria }
    e.eventos.push({ tipo: 'ficha', jogador: i, categoria: p.categoria })
    log(e, `${j.nome} conquistou a ficha de ${CATEGORIAS.find((c) => c.id === p.categoria)!.nome}!`)
  }
  e.fase = 'resultado'
  encerrarSeVenceu(e)
}

function resolverErro(e: Estado, semResposta: boolean) {
  const p = e.pergunta!
  const i = e.vez
  const j = e.jogadores[i]
  e.eventos.push({ tipo: 'erro', jogador: i, segundaChance: false })
  if (p.valor === 'ficha-trilha') j.trilha = 0
  e.resultado = { tipo: 'erro', jogador: i, valor: p.valor, semResposta }
  log(e, `${j.nome} ${semResposta ? 'ficou sem responder' : 'errou'}${p.valor === 'ficha-trilha' ? ' e voltou ao início da trilha' : ''}.`)
  e.fase = 'resultado'
}

function responder(e: Estado, opcao: number) {
  const p = e.pergunta
  if (e.fase !== 'responder' || !p) return
  if (opcao === -1) return resolverErro(e, true)
  if (!Number.isInteger(opcao) || opcao < 0 || opcao >= p.opcoes.length) return
  if (p.eliminadas.includes(opcao) || p.erradas.includes(opcao)) return
  if (opcao === p.correta) return resolverAcerto(e)
  p.erradas.push(opcao)
  if (p.erradas.length < p.tentativas) {
    e.eventos.push({ tipo: 'erro', jogador: e.vez, segundaChance: true })
    log(e, `${nomeDe(e, e.vez)} errou a primeira, mas tem outra chance.`)
    return
  }
  resolverErro(e, false)
}

function responderDuelo(e: Estado, jogador: number, opcao: number) {
  const d = e.duelo
  const p = e.pergunta
  if (e.fase !== 'duelo' || !d || !p) return
  if (d.respostas[jogador] !== undefined) return
  if (opcao !== -1 && (!Number.isInteger(opcao) || opcao < 0 || opcao >= p.opcoes.length)) return
  d.respostas[jogador] = opcao
  const outro = jogador === d.desafiante ? d.alvo : d.desafiante
  const acertou = opcao === p.correta
  // o primeiro a acertar vence na hora; se os dois erram, ninguém leva nada
  if (!acertou && d.respostas[outro] === undefined) return
  fecharDuelo(e, acertou ? jogador : null)
}

function fecharDuelo(e: Estado, vencedor: number | null) {
  const d = e.duelo!
  const desafiante = e.jogadores[d.desafiante]
  const alvo = e.jogadores[d.alvo]
  if (vencedor === d.desafiante) {
    // rouba a ficha do alvo e mantém a que apostou
    alvo.fichas = alvo.fichas.filter((c) => c !== d.premio)
    ganharFicha(e, d.desafiante, d.premio)
    e.eventos.push({ tipo: 'ficha', jogador: d.desafiante, categoria: d.premio })
  } else if (vencedor === d.alvo) {
    desafiante.fichas = desafiante.fichas.filter((c) => c !== d.aposta)
    ganharFicha(e, d.alvo, d.aposta)
    e.eventos.push({ tipo: 'ficha', jogador: d.alvo, categoria: d.aposta })
  }
  desafiante.trilha = 0
  e.resultado = { tipo: 'duelo', desafiante: d.desafiante, alvo: d.alvo, vencedor, aposta: d.aposta, premio: d.premio }
  const quem = vencedor === null ? 'Ninguém acertou' : `${nomeDe(e, vencedor)} venceu`
  log(e, `Duelo: ${quem}.`)
  e.fase = 'resultado'
  encerrarSeVenceu(e)
}

function usarEspecial(e: Estado, especial: Especial, perguntas: Pergunta[], rng: Rng) {
  const j = e.jogadores[e.vez]
  const p = e.pergunta
  if (!ESPECIAIS.includes(especial) || j.especiais[especial] <= 0) return

  // Tiro extra também vale depois de um erro: em vez de passar a vez, gira de novo
  if (especial === 'tiroExtra' && e.fase === 'resultado' && e.resultado?.tipo === 'erro' && e.vencedor === null) {
    j.especiais.tiroExtra -= 1
    e.eventos.push({ tipo: 'especial', jogador: e.vez, especial })
    log(e, `${j.nome} usou Tiro extra e joga de novo.`)
    comecarVez(e)
    return
  }

  if (e.fase !== 'responder' || !p || p.erradas.length > 0) return

  if (especial === 'bomba') {
    if (p.eliminadas.length > 0) return
    const erradas = embaralhar(
      p.opcoes.map((_, i) => i).filter((i) => i !== p.correta),
      rng,
    )
    p.eliminadas = erradas.slice(0, 2)
  } else if (especial === 'chanceDupla') {
    if (p.tentativas === 2) return
    p.tentativas = 2
  } else if (especial === 'passar') {
    e.pergunta = sortear(e, p.categoria, perguntas, rng, p.valor, p.id)
  } else if (especial === 'tiroExtra') {
    // só quando a categoria veio da roleta: na Coroa não há giro para repetir
    if (p.valor !== 'trilha') return
    e.pergunta = null
    e.fase = 'girar'
  }
  j.especiais[especial] -= 1
  e.eventos.push({ tipo: 'especial', jogador: e.vez, especial })
  log(e, `${j.nome} usou ${TEXTO_ESPECIAL[especial]}.`)
}

function seguir(e: Estado) {
  if (e.fase !== 'resultado') return
  const r = e.resultado
  // acertar (e ganhar ficha) mantém a vez; errar e perder o duelo passam a vez
  const continua =
    r?.tipo === 'acerto' || r?.tipo === 'ficha' || (r?.tipo === 'duelo' && r.vencedor === r.desafiante)
  if (continua) comecarVez(e)
  else passarVez(e)
}

/** Função pura: devolve um novo estado, sem alterar o recebido. Ações de quem não pode agir são ignoradas. */
export function aplicar(estado: Estado, acao: Acao, perguntas: Pergunta[], rng: Rng): Estado {
  const e = structuredClone(estado)
  e.eventos = []
  if (!quemAge(e).includes(acao.jogador)) return estado

  if (acao.tipo === 'girar') girar(e, perguntas, rng)
  else if (acao.tipo === 'escolherCategoria') escolherCategoria(e, acao.categoria, perguntas, rng)
  else if (acao.tipo === 'desafiar') desafiar(e, acao, perguntas, rng)
  else if (acao.tipo === 'responder') {
    if (e.fase === 'duelo') responderDuelo(e, acao.jogador, acao.opcao)
    else responder(e, acao.opcao)
  } else if (acao.tipo === 'usarEspecial') usarEspecial(e, acao.especial, perguntas, rng)
  else seguir(e)

  if (e.eventos.length > 0) e.seq += 1
  else e.eventos = estado.eventos
  return e
}
