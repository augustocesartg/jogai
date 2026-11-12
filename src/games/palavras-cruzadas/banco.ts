import { artes } from './data/artes'
import { artes2 } from './data/artes2'
import { artes3 } from './data/artes3'
import { ciencia } from './data/ciencia'
import { ciencia2 } from './data/ciencia2'
import { ciencia3 } from './data/ciencia3'
import { geografia } from './data/geografia'
import { geografia2 } from './data/geografia2'
import { geografia3 } from './data/geografia3'
import { historia } from './data/historia'
import { historia2 } from './data/historia2'
import { historia3 } from './data/historia3'
import { normalizar } from './normalizar'
import type { Entrada, Materia, Palavra } from './types'

function montar(materia: Materia, entradas: Entrada[]): Palavra[] {
  return entradas.map(([resposta, dica]) => {
    const chave = normalizar(resposta)
    return {
      id: `${materia}:${chave}`,
      materia,
      resposta: resposta.replace(/\s+/g, ''),
      chave,
      dica,
    }
  })
}

export const BANCO: Record<Materia, Palavra[]> = {
  historia: montar('historia', [...historia, ...historia2, ...historia3]),
  artes: montar('artes', [...artes, ...artes2, ...artes3]),
  ciencia: montar('ciencia', [...ciencia, ...ciencia2, ...ciencia3]),
  geografia: montar('geografia', [...geografia, ...geografia2, ...geografia3]),
}
