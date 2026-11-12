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

const K_STATS = 'jogai:stats'

export interface Stats {
  acertos: number
  sequencia: number
  ultimoDia: string
}

const dia = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function lerStats(): Stats {
  const s = ler<Stats>(K_STATS, { acertos: 0, sequencia: 0, ultimoDia: '' })
  const hoje = new Date()
  const ontem = new Date(hoje)
  ontem.setDate(hoje.getDate() - 1)
  // sequência quebrada se não jogou ontem nem hoje
  if (s.ultimoDia !== dia(hoje) && s.ultimoDia !== dia(ontem)) return { ...s, sequencia: 0 }
  return s
}

export function registrarAcerto() {
  const s = lerStats()
  const hoje = dia(new Date())
  gravar(K_STATS, {
    acertos: s.acertos + 1,
    sequencia: s.ultimoDia === hoje ? s.sequencia : s.sequencia + 1,
    ultimoDia: hoje,
  })
}
