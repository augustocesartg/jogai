import type { ComponentType, ReactNode } from 'react'
import type { Rng } from './rng'

/**
 * Contrato que um jogo implementa para rodar na sala online.
 * Tudo aqui é puro (sem React e sem DOM): roda no Durable Object do Cloudflare.
 */

/** O que o servidor está esperando acontecer: define o próximo prazo e a jogada automática. */
export interface Agenda {
  /** jogador (índice) esperado; null quando a espera não é de uma pessoa específica */
  jogador: number | null
  /** bot joga logo; humano tem tempo limite; proxima avança sozinha depois de uma pausa */
  tipo: 'bot' | 'humano' | 'proxima'
  /** espera em ms até a jogada automática; se omitido, vale o padrão da sala para esse tipo */
  ms?: number
}

export interface JogoServidor<E> {
  id: string
  /**
   * Cria a partida. `humanos` são os nomes na ordem da sala; os bots, se houver, entram depois
   * (conforme `opcoes`). Devolve null se as opções forem inválidas.
   */
  criar(humanos: string[], opcoes: unknown, usadas: string[], rng: Rng): E | null
  jogadores(e: E): { nome: string; bot: boolean }[]
  /** Valida e aplica uma ação. `eu` é o índice de quem agiu, ou -1 quando é o próprio servidor. null = ignorar. */
  aplicar(e: E, acao: unknown, eu: number, rng: Rng): E | null
  /** O que o jogador `eu` pode ver (nunca a resposta antes da hora). */
  visao(e: E, eu: number): unknown
  terminou(e: E): boolean
  agenda(e: E): Agenda | null
  /** Ação do servidor quando o prazo chega (jogada do bot, tempo esgotado ou próxima etapa). */
  automatico(e: E, a: Agenda, rng: Rng): unknown
  /** Ids do que já saiu (cartas, perguntas), para não repetir entre partidas. */
  usadas(e: E): string[]
}

export interface PropsLobby {
  /** quantos jogadores humanos há na sala */
  humanos: number
  onIniciar: (opcoes: unknown) => void
}

export interface PropsPartidaOnline {
  visao: unknown
  eu: number
  /** instante (relógio local) em que o servidor joga sozinho; null se não há prazo */
  fimEm: number | null
  agir: (acao: unknown) => void
  onNova: (() => void) | null
  esperaNova: string
  onSair: () => void
  rotuloSair: string
  extra: ReactNode
}

/** Lado do navegador: o que a sala online precisa de cada jogo. */
export interface JogoCliente {
  id: string
  nome: string
  /** ids já vistos neste aparelho, enviados à sala para evitar repetição */
  lerVistas(): string[]
  /** opções da partida (dificuldade, bots...) e botão de iniciar, mostrados ao anfitrião */
  Lobby: ComponentType<PropsLobby>
  Partida: ComponentType<PropsPartidaOnline>
}
