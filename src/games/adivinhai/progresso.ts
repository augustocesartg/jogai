import type { NivelBot } from './types'

const K_CONFIG = 'jogai:adivinhai:config'

export interface ConfigAdivinhai {
  nome: string
  bots: number
  nivel: NivelBot
}

export const CONFIG_PADRAO: ConfigAdivinhai = { nome: '', bots: 2, nivel: 'medio' }

export function lerConfig(): ConfigAdivinhai {
  try {
    const bruto = localStorage.getItem(K_CONFIG)
    if (!bruto) return CONFIG_PADRAO
    const c = JSON.parse(bruto) as Partial<ConfigAdivinhai>
    return {
      nome: typeof c.nome === 'string' ? c.nome.slice(0, 16) : '',
      bots: typeof c.bots === 'number' ? Math.min(5, Math.max(0, Math.round(c.bots))) : CONFIG_PADRAO.bots,
      nivel: c.nivel === 'facil' || c.nivel === 'dificil' ? c.nivel : 'medio',
    }
  } catch {
    return CONFIG_PADRAO
  }
}

export function gravarConfig(c: ConfigAdivinhai) {
  try {
    localStorage.setItem(K_CONFIG, JSON.stringify(c))
  } catch {
    /* sem armazenamento: segue sem persistir */
  }
}

const K_CARTAS = 'jogai:adivinhai:cartas'

/** Ids das cartas já usadas, para não repetir entre partidas. */
export function lerCartasUsadas(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(K_CARTAS) ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function gravarCartasUsadas(ids: string[]) {
  try {
    localStorage.setItem(K_CARTAS, JSON.stringify(ids))
  } catch {
    /* sem armazenamento: segue sem persistir */
  }
}
