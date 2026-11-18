import { criarSons, type Nota } from '../../plataforma/sons'

export { definirSom, somLigado } from '../../plataforma/sons'

export type Som = 'giro' | 'acerto' | 'erro' | 'ficha' | 'duelo' | 'especial' | 'vez' | 'vitoria' | 'derrota'

const SONS: Record<Som, Nota[]> = {
  giro: [[523, 0.07, 0.05], [587, 0.07, 0.05], [659, 0.07, 0.05], [740, 0.07, 0.05], [659, 0.07, 0.05], [587, 0.07, 0.05], [698, 0.18, 0.06]],
  acerto: [[523, 0.12], [659, 0.12], [784, 0.2]],
  erro: [[294, 0.16, 0.07], [247, 0.3, 0.07]],
  ficha: [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.14], [1319, 0.4]],
  duelo: [[392, 0.12, 0.08], [392, 0.12, 0.08], [523, 0.3, 0.09]],
  especial: [[698, 0.1], [880, 0.2]],
  vez: [[587, 0.1, 0.05]],
  vitoria: [[523, 0.14], [659, 0.14], [784, 0.14], [1047, 0.2], [988, 0.12], [1047, 0.5]],
  derrota: [[392, 0.24, 0.06], [349, 0.24, 0.06], [330, 0.24, 0.06], [294, 0.5, 0.06]],
}

export const tocar = criarSons(SONS)
