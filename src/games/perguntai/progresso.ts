import type { NivelBot } from './types'

export interface ConfigPerguntai {
  nome: string
  bots: number
  nivel: NivelBot
  /** fichas para vencer: 3 (curta), 4 (média) ou 6 (completa) */
  fichas: number
}

export const CONFIG_PADRAO: ConfigPerguntai = { nome: '', bots: 2, nivel: 'medio', fichas: 4 }

const K_CONFIG = 'jogai:perguntai:config'
const K_PERGUNTAS = 'jogai:perguntai:perguntas'

export function lerConfig(): ConfigPerguntai {
  try {
    const bruto = localStorage.getItem(K_CONFIG)
    if (!bruto) return CONFIG_PADRAO
    const c = JSON.parse(bruto) as Partial<ConfigPerguntai>
    return {
      nome: typeof c.nome === 'string' ? c.nome.slice(0, 16) : '',
      bots: typeof c.bots === 'number' ? Math.min(5, Math.max(1, Math.round(c.bots))) : CONFIG_PADRAO.bots,
      nivel: c.nivel === 'facil' || c.nivel === 'dificil' ? c.nivel : 'medio',
      fichas: c.fichas === 3 || c.fichas === 6 ? c.fichas : 4,
    }
  } catch {
    return CONFIG_PADRAO
  }
}

export function gravarConfig(c: ConfigPerguntai) {
  try {
    localStorage.setItem(K_CONFIG, JSON.stringify(c))
  } catch {
    /* sem armazenamento: segue sem persistir */
  }
}

/** Ids das perguntas já vistas (da mais antiga para a mais recente), para não repetir entre partidas. */
export function lerPerguntasVistas(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(K_PERGUNTAS) ?? '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Marca uma pergunta como vista (a mais recente vai para o fim da lista). */
export function marcarPerguntaVista(id: string) {
  const lista = lerPerguntasVistas().filter((x) => x !== id)
  gravarPerguntasVistas([...lista, id])
}

export function gravarPerguntasVistas(ids: string[]) {
  try {
    localStorage.setItem(K_PERGUNTAS, JSON.stringify(ids.slice(-700)))
  } catch {
    /* sem armazenamento: segue sem persistir */
  }
}
