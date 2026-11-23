export type CategoriaCuriosidade = 'História' | 'Ciência' | 'Arte' | 'Geografia'

export interface Curiosidade {
  categoria: CategoriaCuriosidade
  titulo: string
  /** uma linha, aparece no cartão da home */
  resumo: string
  /** texto completo, aparece na janela */
  texto: string
  fonte: string
}

import { ARTE } from './dados/arte'
import { ARTE2 } from './dados/arte2'
import { CIENCIA } from './dados/ciencia'
import { CIENCIA2 } from './dados/ciencia2'
import { GEOGRAFIA } from './dados/geografia'
import { GEOGRAFIA2 } from './dados/geografia2'
import { HISTORIA } from './dados/historia'
import { HISTORIA2 } from './dados/historia2'

// intercala as categorias para que dias seguidos tragam assuntos diferentes
function intercalar(listas: Curiosidade[][]): Curiosidade[] {
  const saida: Curiosidade[] = []
  const max = Math.max(...listas.map((l) => l.length))
  for (let i = 0; i < max; i++) for (const l of listas) if (i < l.length) saida.push(l[i])
  return saida
}

export const CURIOSIDADES: Curiosidade[] = intercalar([
  [...CIENCIA, ...CIENCIA2],
  [...HISTORIA, ...HISTORIA2],
  [...GEOGRAFIA, ...GEOGRAFIA2],
  [...ARTE, ...ARTE2],
])
