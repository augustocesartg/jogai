import type { Materia } from './types'

const K_VISTAS = 'jogai:cruzadas:vistas'
const K_MATERIAS = 'jogai:cruzadas:materias'

function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? (JSON.parse(bruto) as T) : padrao
  } catch {
    return padrao
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    /* modo privado / sem armazenamento: segue sem persistir */
  }
}

export const lerVistas = () => new Set(ler<string[]>(K_VISTAS, []))
export const gravarVistas = (v: Set<string>) => gravar(K_VISTAS, [...v])
export const lerMaterias = (padrao: Materia[]) => ler<Materia[]>(K_MATERIAS, padrao)
export const gravarMaterias = (m: Materia[]) => gravar(K_MATERIAS, m)
