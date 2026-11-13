import type { Acao, NivelBot } from '../types'
import type { Visao } from '../visao'

// Mensagens trocadas entre o navegador e a sala (Durable Object). Usado pelos dois lados.
export const MAX_JOGADORES = 6
export const TAMANHO_CODIGO = 4
export const ALFABETO_CODIGO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export interface JogadorSala {
  id: string
  nome: string
  conectado: boolean
}

export type Cliente =
  | { t: 'entrar'; id: string; nome: string }
  | { t: 'sair' }
  | { t: 'iniciar'; nivel: NivelBot }
  | { t: 'agir'; acao: Acao }
  | { t: 'revanche' }
  | { t: 'ping' }

export type ErroSala = 'cheia' | 'inexistente' | 'invalido' | 'iniciada'

export type Servidor =
  | { t: 'sala'; codigo: string; voce: string; anfitriao: string; jogadores: JogadorSala[]; visao: Visao | null; eu: number }
  | { t: 'erro'; erro: ErroSala }
  | { t: 'pong' }

export const codigoValido = (c: string) =>
  c.length === TAMANHO_CODIGO && [...c].every((ch) => ALFABETO_CODIGO.includes(ch))

export const MIN_JOGADORES = 2
