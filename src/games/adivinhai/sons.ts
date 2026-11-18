import { criarSons, type Nota } from '../../plataforma/sons'

export { definirSom, somLigado } from '../../plataforma/sons'

/** Efeitos sonoros do Adivinhaí (o motor de áudio fica em `plataforma/sons.ts`). */
export type Som =
  | 'pista'
  | 'acerto'
  | 'erro'
  | 'passou'
  | 'perca'
  | 'avance2'
  | 'volte1'
  | 'outro'
  | 'rodada'
  | 'esgotou'
  | 'vitoria'
  | 'derrota'

const SONS: Record<Som, Nota[]> = {
  pista: [[587, 0.12, 0.07]],
  acerto: [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.3]],
  erro: [[294, 0.16, 0.07], [247, 0.3, 0.07]],
  passou: [[392, 0.18, 0.05]],
  perca: [[392, 0.14, 0.06], [330, 0.3, 0.06]],
  avance2: [[440, 0.12], [587, 0.12], [740, 0.22]],
  volte1: [[740, 0.12], [587, 0.12], [440, 0.22]],
  outro: [[523, 0.1], [523, 0.1], [698, 0.24]],
  rodada: [[587, 0.14], [784, 0.26]],
  esgotou: [[392, 0.18, 0.06], [330, 0.18, 0.06], [262, 0.38, 0.06]],
  vitoria: [[523, 0.14], [659, 0.14], [784, 0.14], [1047, 0.2], [988, 0.12], [1047, 0.5]],
  derrota: [[392, 0.24, 0.06], [349, 0.24, 0.06], [330, 0.24, 0.06], [294, 0.5, 0.06]],
}

export const tocar = criarSons(SONS)
