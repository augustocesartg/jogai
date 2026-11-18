import type { NivelBot } from '../../plataforma/tipos'

export type { NivelBot }

export type Categoria = 'ciencia' | 'arte' | 'esporte' | 'entretenimento' | 'geografia' | 'historia'

export const CATEGORIAS: { id: Categoria; nome: string; emoji: string; cor: string }[] = [
  { id: 'ciencia', nome: 'Ciências', emoji: '🔬', cor: '#10B981' },
  { id: 'arte', nome: 'Arte', emoji: '🎨', cor: '#EC4899' },
  { id: 'esporte', nome: 'Esportes', emoji: '⚽', cor: '#F97316' },
  { id: 'entretenimento', nome: 'Entretenimento', emoji: '🎬', cor: '#8B5CF6' },
  { id: 'geografia', nome: 'Geografia', emoji: '🌎', cor: '#3B82F6' },
  { id: 'historia', nome: 'História', emoji: '🏛️', cor: '#B45309' },
]

/** 1 = fácil, 2 = média, 3 = difícil */
export type NivelPergunta = 1 | 2 | 3

/** Pergunta como escrita nos arquivos de dados (a categoria vem do arquivo). */
export interface PerguntaBase {
  texto: string
  certa: string
  /** exatamente 3 alternativas erradas, plausíveis */
  erradas: [string, string, string]
  nivel: NivelPergunta
}

export interface Pergunta extends PerguntaBase {
  id: string
  categoria: Categoria
}

export type Especial = 'bomba' | 'chanceDupla' | 'tiroExtra' | 'passar'
export const ESPECIAIS: Especial[] = ['bomba', 'chanceDupla', 'tiroExtra', 'passar']

export const TEXTO_ESPECIAL: Record<Especial, string> = {
  bomba: 'Bomba',
  chanceDupla: 'Chance dupla',
  tiroExtra: 'Tiro extra',
  passar: 'Passar',
}

/** Casas da trilha de cada jogador: 3 de avanço (0 a 2) e a Coroa (3). */
export const CASAS_TRILHA = 4
export const FICHAS_TOTAL = CATEGORIAS.length
/** Duelo só existe com 3 ou mais jogadores. */
export const MIN_DUELO = 3

export interface Jogador {
  id: string
  nome: string
  bot: NivelBot | null
  cor: string
  /** 0 a 3; 3 = está na casa da Coroa */
  trilha: number
  fichas: Categoria[]
  especiais: Record<Especial, number>
}

/** O que a pergunta em jogo vale. */
export type Valor =
  /** pergunta comum: acertar avança uma casa na trilha */
  | 'trilha'
  /** na Coroa da trilha: acertar dá a ficha, errar volta ao início da trilha */
  | 'ficha-trilha'
  /** Coroa tirada na roleta: acertar dá a ficha, errar só passa a vez */
  | 'ficha-roleta'
  | 'duelo'

export interface PerguntaAtual {
  id: string
  categoria: Categoria
  nivel: NivelPergunta
  texto: string
  /** alternativas já embaralhadas */
  opcoes: string[]
  /** índice da alternativa certa em `opcoes` */
  correta: number
  /** alternativas tiradas pela Bomba */
  eliminadas: number[]
  /** tentativas permitidas (2 com a Chance dupla) */
  tentativas: 1 | 2
  /** alternativas já tentadas e erradas */
  erradas: number[]
  valor: Valor
}

export interface Duelo {
  desafiante: number
  alvo: number
  /** ficha do desafiante em risco */
  aposta: Categoria
  /** ficha do alvo que o desafiante quer */
  premio: Categoria
  /** opção escolhida por cada duelista (-1 = sem resposta); ausente = ainda não respondeu */
  respostas: Record<number, number>
}

export type Resultado =
  | { tipo: 'acerto'; jogador: number; valor: Valor; chegouCoroa: boolean }
  | { tipo: 'erro'; jogador: number; valor: Valor; semResposta: boolean }
  | { tipo: 'ficha'; jogador: number; categoria: Categoria }
  | { tipo: 'duelo'; desafiante: number; alvo: number; vencedor: number | null; aposta: Categoria; premio: Categoria }

export type Fase = 'girar' | 'categoria' | 'responder' | 'duelo' | 'resultado' | 'fim'

/** Fatos da última ação, para a interface animar (avisos, sons). */
export type Evento =
  | { tipo: 'giro'; jogador: number; resultado: Categoria | 'coroa' }
  | { tipo: 'acerto'; jogador: number }
  | { tipo: 'erro'; jogador: number; segundaChance: boolean }
  | { tipo: 'ficha'; jogador: number; categoria: Categoria }
  | { tipo: 'duelo'; desafiante: number; alvo: number }
  | { tipo: 'especial'; jogador: number; especial: Especial }
  | { tipo: 'vez'; jogador: number }

export interface Estado {
  jogadores: Jogador[]
  vez: number
  fase: Fase
  /** na fase 'categoria': o jogador escolhe a categoria valendo isto */
  valorPendente: 'ficha-trilha' | 'ficha-roleta' | null
  /** último resultado da roleta (para a animação) */
  giro: Categoria | 'coroa' | null
  pergunta: PerguntaAtual | null
  duelo: Duelo | null
  resultado: Resultado | null
  /** quantas fichas dão a vitória (6 no jogo de tabuleiro) */
  fichasParaVencer: number
  nivelPerguntas: NivelBot
  usadas: string[]
  vencedor: number | null
  turno: number
  historico: string[]
  eventos: Evento[]
  seq: number
}

/** Toda ação diz quem a faz; o motor só aceita de quem pode agir naquele momento. */
export type Acao =
  | { tipo: 'girar'; jogador: number }
  | { tipo: 'escolherCategoria'; jogador: number; categoria: Categoria }
  | { tipo: 'desafiar'; jogador: number; alvo: number; aposta: Categoria; premio: Categoria }
  | { tipo: 'responder'; jogador: number; /** -1 = sem resposta (tempo esgotado) */ opcao: number }
  | { tipo: 'usarEspecial'; jogador: number; especial: Especial }
  | { tipo: 'seguir'; jogador: number }
