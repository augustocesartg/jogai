import type { Carta, CartaBase, Categoria } from '../types'
import { ano } from './ano'
import { ano2 } from './ano2'
import { coisa } from './coisa'
import { coisa2 } from './coisa2'
import { digital } from './digital'
import { digital2 } from './digital2'
import { lugar } from './lugar'
import { lugar2 } from './lugar2'
import { pessoa } from './pessoa'
import { pessoa2 } from './pessoa2'

function montar(categoria: Categoria, base: CartaBase[]): Carta[] {
  return base.map((c) => ({ ...c, categoria, id: `${categoria}:${c.resposta}` }))
}

export const CARTAS: Carta[] = [
  ...montar('pessoa', [...pessoa, ...pessoa2]),
  ...montar('lugar', [...lugar, ...lugar2]),
  ...montar('coisa', [...coisa, ...coisa2]),
  ...montar('ano', [...ano, ...ano2]),
  ...montar('digital', [...digital, ...digital2]),
]
