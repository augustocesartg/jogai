export type Categoria = 'pessoa' | 'lugar' | 'coisa' | 'ano' | 'digital'

export const CATEGORIAS: { id: Categoria; nome: string; emoji: string }[] = [
  { id: 'pessoa', nome: 'Pessoa', emoji: '🧑' },
  { id: 'lugar', nome: 'Lugar', emoji: '📍' },
  { id: 'coisa', nome: 'Coisa', emoji: '📦' },
  { id: 'ano', nome: 'Ano', emoji: '📅' },
  { id: 'digital', nome: 'Mundo Digital', emoji: '💻' },
]

/** Dificuldade da pista: f = fácil, m = média, d = difícil */
export type Dif = 'f' | 'm' | 'd'
export type Pista = [Dif, string]

/** Carta como escrita nos arquivos de dados (a categoria vem do arquivo). */
export interface CartaBase {
  resposta: string
  /** Outras formas aceitas (apelidos, nome completo). A própria resposta já é aceita. */
  aceitas?: string[]
  /** Palpites errados plausíveis, usados pelos bots. */
  chutes: string[]
  /** 18 pistas; a ordem é sorteada a cada rodada. */
  pistas: Pista[]
}

export interface Carta extends CartaBase {
  id: string
  categoria: Categoria
}

export type Comando = 'perca' | 'avance2' | 'volte1' | 'outro'

export type Item =
  | { tipo: 'pista'; texto: string; dif: Dif }
  | { tipo: 'comando'; comando: Comando }

export type NivelBot = 'facil' | 'medio' | 'dificil'

export interface Jogador {
  id: string
  nome: string
  bot: NivelBot | null
  pos: number
  cor: string
}

export type Fase = 'escolher' | 'palpitar' | 'fim'

export type Resultado =
  | { tipo: 'acerto'; jogador: number; casas: number }
  | { tipo: 'esgotou' }
  | { tipo: 'vitoria' }

export interface Rodada {
  carta: Carta
  /** 20 itens; o número N escolhido pelo jogador é itens[N - 1] */
  itens: Item[]
  /** números já escolhidos, na ordem */
  usados: number[]
  /** índice do jogador da vez */
  vez: number
  fase: Fase
  atual: number | null
  resultado: Resultado | null
}

export interface Estado {
  jogadores: Jogador[]
  mediador: number
  rodadaNum: number
  /** índice de quem começou a rodada (rodízio) */
  inicio: number
  rodada: Rodada
  cartasUsadas: string[]
  /** 'mediador', o índice do jogador, ou null enquanto a partida segue */
  vencedor: 'mediador' | number | null
  historico: string[]
}

export type Acao =
  | { tipo: 'escolher'; numero: number }
  | { tipo: 'palpitar'; texto: string }
  | { tipo: 'passar' }
  | { tipo: 'proxima' }

export const CASAS = 30
export const TOTAL_ITENS = 20
