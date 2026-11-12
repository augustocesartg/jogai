import { artes } from './data/artes'
import { artes2 } from './data/artes2'
import { ciencia } from './data/ciencia'
import { ciencia2 } from './data/ciencia2'
import { geografia } from './data/geografia'
import { geografia2 } from './data/geografia2'
import { historia } from './data/historia'
import { historia2 } from './data/historia2'
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
  historia: montar('historia', [...historia, ...historia2]),
  artes: montar('artes', [...artes, ...artes2]),
  ciencia: montar('ciencia', [...ciencia, ...ciencia2]),
  geografia: montar('geografia', [...geografia, ...geografia2]),
}
