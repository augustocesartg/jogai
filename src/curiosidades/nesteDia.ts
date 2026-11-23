import { numeroDoDia } from './dia'

export interface FatoDoDia {
  ano: number
  texto: string
  /** artigo da Wikipédia relacionado, quando houver */
  artigo?: { titulo: string; resumo: string; url: string; imagem?: string }
}

interface RespostaWiki {
  selected?: {
    year: number
    text: string
    pages?: {
      titles?: { normalized?: string }
      extract?: string
      thumbnail?: { source?: string }
      content_urls?: { mobile?: { page?: string }; desktop?: { page?: string } }
    }[]
  }[]
}

const CHAVE_CACHE = 'jogai:nesteDia'

function lerCache(dia: string): FatoDoDia[] | null {
  try {
    const c = JSON.parse(localStorage.getItem(CHAVE_CACHE) ?? 'null')
    return c?.dia === dia && Array.isArray(c.fatos) && c.fatos.length > 0 ? c.fatos : null
  } catch {
    return null
  }
}

function guardarCache(dia: string, fatos: FatoDoDia[]) {
  try {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify({ dia, fatos }))
  } catch {
    // sem armazenamento: busca de novo na próxima vez
  }
}

export function converter(r: RespostaWiki): FatoDoDia[] {
  return (r.selected ?? [])
    .filter((f) => typeof f.year === 'number' && f.text)
    .map((f) => {
      const p = f.pages?.[0]
      const url = p?.content_urls?.mobile?.page ?? p?.content_urls?.desktop?.page
      return {
        ano: f.year,
        texto: f.text,
        artigo: p?.titles?.normalized && url ? { titulo: p.titles.normalized, resumo: p.extract ?? '', url, imagem: p.thumbnail?.source } : undefined,
      }
    })
}

/** Fatos de "Neste dia" da Wikipédia em português. Devolve null sem internet. O resultado fica guardado por dia. */
export async function buscarNesteDia(chave: string): Promise<FatoDoDia[] | null> {
  const cache = lerCache(chave)
  if (cache) return cache
  const [, m, d] = chave.split('-')
  try {
    const res = await fetch(`https://pt.wikipedia.org/api/rest_v1/feed/onthisday/selected/${m}/${d}`)
    if (!res.ok) return null
    const fatos = converter(await res.json())
    if (fatos.length === 0) return null
    guardarCache(chave, fatos)
    return fatos
  } catch {
    return null
  }
}

/** O fato em destaque do dia; os demais ficam para a janela. */
export function indiceDoDestaque(chave: string, total: number): number {
  return total > 0 ? numeroDoDia(chave) % total : 0
}
