import type { Colocada, Direcao, Palavra, Tabuleiro } from './types'

export type Rng = () => number

export interface OpcoesGerador {
  tamanho?: number
  alvo?: number
  tentativas?: number
  rng?: Rng
}

function embaralhar<T>(lista: T[], rng: Rng): T[] {
  const a = [...lista]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Palavras não vistas primeiro (alternando matérias), depois as já vistas.
 */
export function ordenarPool(pool: Palavra[], vistas: Set<string>, rng: Rng): Palavra[] {
  const alternar = (lista: Palavra[]) => {
    const porMateria = new Map<string, Palavra[]>()
    for (const p of embaralhar(lista, rng)) {
      const l = porMateria.get(p.materia) ?? []
      l.push(p)
      porMateria.set(p.materia, l)
    }
    const filas = [...porMateria.values()]
    const saida: Palavra[] = []
    let restante = true
    while (restante) {
      restante = false
      for (const f of embaralhar(filas, rng)) {
        const p = f.shift()
        if (p) {
          saida.push(p)
          restante = true
        }
      }
    }
    return saida
  }
  return [
    ...alternar(pool.filter((p) => !vistas.has(p.id))),
    ...alternar(pool.filter((p) => vistas.has(p.id))),
  ]
}

interface Celula {
  letra: string
  h: boolean
  v: boolean
}

class Grade {
  celulas: (Celula | null)[][]
  readonly n: number
  constructor(n: number) {
    this.n = n
    this.celulas = Array.from({ length: n }, () => Array<Celula | null>(n).fill(null))
  }

  private dentro(l: number, c: number) {
    return l >= 0 && c >= 0 && l < this.n && c < this.n
  }

  private ocupada(l: number, c: number) {
    return this.dentro(l, c) && this.celulas[l][c] !== null
  }

  /** Retorna número de cruzamentos, ou -1 se inválido. */
  avaliar(chave: string, l: number, c: number, d: Direcao): number {
    const dl = d === 'V' ? 1 : 0
    const dc = d === 'H' ? 1 : 0
    const fl = l + dl * (chave.length - 1)
    const fc = c + dc * (chave.length - 1)
    if (!this.dentro(l, c) || !this.dentro(fl, fc)) return -1
    if (this.ocupada(l - dl, c - dc) || this.ocupada(fl + dl, fc + dc)) return -1
    let cruzamentos = 0
    for (let i = 0; i < chave.length; i++) {
      const r = l + dl * i
      const k = c + dc * i
      const cel = this.celulas[r][k]
      if (cel) {
        if (cel.letra !== chave[i]) return -1
        if ((d === 'H' && cel.h) || (d === 'V' && cel.v)) return -1
        cruzamentos++
      } else if (d === 'H') {
        if (this.ocupada(r - 1, k) || this.ocupada(r + 1, k)) return -1
      } else if (this.ocupada(r, k - 1) || this.ocupada(r, k + 1)) {
        return -1
      }
    }
    return cruzamentos
  }

  colocar(chave: string, l: number, c: number, d: Direcao) {
    for (let i = 0; i < chave.length; i++) {
      const r = l + (d === 'V' ? i : 0)
      const k = c + (d === 'H' ? i : 0)
      const cel = this.celulas[r][k] ?? { letra: chave[i], h: false, v: false }
      if (d === 'H') cel.h = true
      else cel.v = true
      this.celulas[r][k] = cel
    }
  }
}

function tentar(candidatas: Palavra[], tamanho: number, alvo: number, rng: Rng): Colocada[] {
  const grade = new Grade(tamanho)
  const colocadas: Colocada[] = []
  const lista = candidatas.filter((p) => p.chave.length <= tamanho)
  if (lista.length === 0) return colocadas

  const [primeira, ...resto] = lista
  const dir0: Direcao = rng() < 0.5 ? 'H' : 'V'
  const meio = Math.floor(tamanho / 2)
  const c0 = dir0 === 'H' ? Math.max(0, Math.floor((tamanho - primeira.chave.length) / 2)) : meio
  const l0 = dir0 === 'V' ? Math.max(0, Math.floor((tamanho - primeira.chave.length) / 2)) : meio
  grade.colocar(primeira.chave, l0, c0, dir0)
  colocadas.push({ palavra: primeira, linha: l0, coluna: c0, direcao: dir0, numero: 0 })

  for (const p of resto) {
    if (colocadas.length >= alvo) break
    let melhor: { l: number; c: number; d: Direcao; score: number }[] = []
    let melhorScore = 0
    for (const d of ['H', 'V'] as Direcao[]) {
      for (let l = 0; l < tamanho; l++) {
        for (let c = 0; c < tamanho; c++) {
          const s = grade.avaliar(p.chave, l, c, d)
          if (s < 1) continue
          if (s > melhorScore) {
            melhorScore = s
            melhor = [{ l, c, d, score: s }]
          } else if (s === melhorScore) {
            melhor.push({ l, c, d, score: s })
          }
        }
      }
    }
    if (melhor.length === 0) continue
    const esc = melhor[Math.floor(rng() * melhor.length)]
    grade.colocar(p.chave, esc.l, esc.c, esc.d)
    colocadas.push({ palavra: p, linha: esc.l, coluna: esc.c, direcao: esc.d, numero: 0 })
  }
  return colocadas
}

/** Atribui números às células iniciais (mesmo número para H e V na mesma célula). */
function numerar(colocadas: Colocada[]): Colocada[] {
  const ordenadas = [...colocadas].sort((a, b) => a.linha - b.linha || a.coluna - b.coluna)
  const numeros = new Map<string, number>()
  let n = 0
  return ordenadas.map((c) => {
    const k = `${c.linha},${c.coluna}`
    if (!numeros.has(k)) numeros.set(k, ++n)
    return { ...c, numero: numeros.get(k)! }
  })
}

export function gerarTabuleiro(
  pool: Palavra[],
  vistas: Set<string>,
  { tamanho = 11, alvo = 10, tentativas = 40, rng = Math.random }: OpcoesGerador = {},
): Tabuleiro {
  let melhor: Colocada[] = []
  for (let t = 0; t < tentativas; t++) {
    const ordenado = ordenarPool(pool, vistas, rng).slice(0, alvo * 4)
    // palavras longas primeiro tendem a gerar mais cruzamentos
    const candidatas = [...ordenado].sort((a, b) => b.chave.length - a.chave.length)
    const res = tentar(candidatas, tamanho, alvo, rng)
    if (res.length > melhor.length) melhor = res
    if (melhor.length >= alvo) break
  }
  return { tamanho, palavras: numerar(melhor) }
}
