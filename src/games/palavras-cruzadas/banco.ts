import { artes } from './data/artes'
import { ciencia } from './data/ciencia'
import { geografia } from './data/geografia'
import { historia } from './data/historia'
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
  historia: montar('historia', historia),
  artes: montar('artes', artes),
  ciencia: montar('ciencia', ciencia),
  geografia: montar('geografia', geografia),
}
