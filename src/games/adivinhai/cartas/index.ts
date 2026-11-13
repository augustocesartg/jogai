import type { Carta, CartaBase, Categoria } from '../types'
import { ano } from './ano'
import { coisa } from './coisa'
import { digital } from './digital'
import { lugar } from './lugar'
import { pessoa } from './pessoa'

function montar(categoria: Categoria, base: CartaBase[]): Carta[] {
  return base.map((c) => ({ ...c, categoria, id: `${categoria}:${c.resposta}` }))
}

export const CARTAS: Carta[] = [
  ...montar('pessoa', pessoa),
  ...montar('lugar', lugar),
  ...montar('coisa', coisa),
  ...montar('ano', ano),
  ...montar('digital', digital),
]
