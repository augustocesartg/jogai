import type { Colocada, Direcao, Palavra } from './types'

export type Rng = () => number
/** true = célula branca (recebe letra); false = bloco preto */
export type Mascara = boolean[][]

export interface Vaga {
  linha: number
  coluna: number
  direcao: Direcao
  tamanho: number
}

const clonar = (m: Mascara) => m.map((l) => [...l])

/** Comprimentos das sequências brancas que passam por (l, c) na horizontal e na vertical. */
function corridas(m: Mascara, l: number, c: number): [number, number] {
  const n = m.length
  let h = 1
  for (let k = c - 1; k >= 0 && m[l][k]; k--) h++
  for (let k = c + 1; k < n && m[l][k]; k++) h++
  let v = 1
  for (let k = l - 1; k >= 0 && m[k][c]; k--) v++
  for (let k = l + 1; k < n && m[k][c]; k++) v++
  return [h, v]
}

/** Remove células soltas e sequências de 2 letras (não existe palavra de 2 letras) e mantém só a maior região conectada. */
export function limpar(entrada: Mascara): Mascara {
  const m = clonar(entrada)
  const n = m.length
  for (let volta = 0; volta < 30; volta++) {
    let mudou = false
    for (let l = 0; l < n; l++) {
      for (let c = 0; c < n; c++) {
        if (!m[l][c]) continue
        const [h, v] = corridas(m, l, c)
        if ((h === 1 && v === 1) || h === 2 || v === 2) {
          m[l][c] = false
          mudou = true
        }
      }
    }
    if (!mudou) break
  }
  // maior região conectada
  const visto = Array.from({ length: n }, () => Array<boolean>(n).fill(false))
  let melhor: [number, number][] = []
  for (let l = 0; l < n; l++) {
    for (let c = 0; c < n; c++) {
      if (!m[l][c] || visto[l][c]) continue
      const fila: [number, number][] = [[l, c]]
      const regiao: [number, number][] = []
      visto[l][c] = true
      while (fila.length) {
        const [a, b] = fila.pop()!
        regiao.push([a, b])
        for (const [da, db] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const x = a + da
          const y = b + db
          if (x >= 0 && y >= 0 && x < n && y < n && m[x][y] && !visto[x][y]) {
            visto[x][y] = true
            fila.push([x, y])
          }
        }
      }
      if (regiao.length > melhor.length) melhor = regiao
    }
  }
  const manter = new Set(melhor.map(([a, b]) => `${a},${b}`))
  for (let l = 0; l < n; l++) for (let c = 0; c < n; c++) if (m[l][c] && !manter.has(`${l},${c}`)) m[l][c] = false
  // remover células ligadas só por regiões já cortadas pode ter criado novas corridas de 2: repete uma vez
  return melhor.length === entrada.flat().filter(Boolean).length ? m : limpar(m)
}

/**
 * Máscara em "treliça": linhas e colunas brancas a cada `periodo` células, com blocos nos demais cruzamentos
 * e alguns cortes extras para quebrar as palavras longas. Sem blocos brancos de 2x2, para o banco dar conta.
 */
export function mascaraTrelica(n: number, periodo: number, rng: Rng): Mascara {
  const dr = Math.floor(rng() * periodo)
  const dc = Math.floor(rng() * periodo)
  const linhaBranca = (l: number) => (l + dr) % periodo === 0
  const colunaBranca = (c: number) => (c + dc) % periodo === 0
  const m: Mascara = Array.from({ length: n }, (_, l) => Array.from({ length: n }, (_, c) => linhaBranca(l) || colunaBranca(c)))
  // cortes nas sequências longas, só em células que não são cruzamento (não cortam a outra direção)
  for (let l = 0; l < n; l++) {
    if (!linhaBranca(l)) continue
    if (rng() < 0.6) {
      const livres = Array.from({ length: n }, (_, c) => c).filter((c) => c >= 4 && c <= n - 5 && !colunaBranca(c))
      if (livres.length) m[l][livres[Math.floor(rng() * livres.length)]] = false
    }
  }
  for (let c = 0; c < n; c++) {
    if (!colunaBranca(c)) continue
    if (rng() < 0.6) {
      const livres = Array.from({ length: n }, (_, l) => l).filter((l) => l >= 4 && l <= n - 5 && !linhaBranca(l))
      if (livres.length) m[livres[Math.floor(rng() * livres.length)]][c] = false
    }
  }
  return m
}

/** Recorta uma silhueta (retangular ou redonda) sobre a máscara. */
export function silhueta(m: Mascara, forma: 'retangular' | 'redonda'): Mascara {
  if (forma === 'retangular') return m
  const n = m.length
  const meio = (n - 1) / 2
  return m.map((linha, l) => linha.map((b, c) => b && (l - meio) ** 2 + (c - meio) ** 2 <= (meio + 0.6) ** 2))
}

/** Todas as sequências de 3 ou mais células brancas. */
export function extrairVagas(m: Mascara): Vaga[] {
  const n = m.length
  const vagas: Vaga[] = []
  for (let l = 0; l < n; l++) {
    let c = 0
    while (c < n) {
      if (!m[l][c]) {
        c++
        continue
      }
      const ini = c
      while (c < n && m[l][c]) c++
      if (c - ini >= 3) vagas.push({ linha: l, coluna: ini, direcao: 'H', tamanho: c - ini })
    }
  }
  for (let c = 0; c < n; c++) {
    let l = 0
    while (l < n) {
      if (!m[l][c]) {
        l++
        continue
      }
      const ini = l
      while (l < n && m[l][c]) l++
      if (l - ini >= 3) vagas.push({ linha: ini, coluna: c, direcao: 'V', tamanho: l - ini })
    }
  }
  return vagas
}

interface Cruzamento {
  outra: number
  minha: number
  dela: number
}

/**
 * Preenche as vagas por busca com retrocesso: a vaga com menos candidatas primeiro, filtrando as vagas que
 * cruzam a cada escolha. Devolve uma palavra por vaga, ou null se estourar o orçamento de nós.
 */
export function preencher(vagas: Vaga[], palavras: Palavra[], rng: Rng, limiteNos: number): Palavra[] | null {
  const porTamanho = new Map<number, Palavra[]>()
  for (const p of palavras) {
    const l = porTamanho.get(p.chave.length) ?? []
    l.push(p)
    porTamanho.set(p.chave.length, l)
  }
  // cruzamentos entre vagas
  const celulas = new Map<string, { vaga: number; pos: number }[]>()
  vagas.forEach((v, i) => {
    for (let k = 0; k < v.tamanho; k++) {
      const chave = `${v.linha + (v.direcao === 'V' ? k : 0)},${v.coluna + (v.direcao === 'H' ? k : 0)}`
      const lista = celulas.get(chave) ?? []
      lista.push({ vaga: i, pos: k })
      celulas.set(chave, lista)
    }
  })
  const cruz: Cruzamento[][] = vagas.map(() => [])
  for (const lista of celulas.values()) {
    if (lista.length === 2) {
      cruz[lista[0].vaga].push({ outra: lista[1].vaga, minha: lista[0].pos, dela: lista[1].pos })
      cruz[lista[1].vaga].push({ outra: lista[0].vaga, minha: lista[1].pos, dela: lista[0].pos })
    }
  }

  const listas: Palavra[][] = vagas.map((v) => porTamanho.get(v.tamanho) ?? [])
  if (listas.some((l) => l.length === 0)) return null
  const escolhida: (Palavra | null)[] = vagas.map(() => null)
  const usadas = new Set<string>()
  let nos = 0

  function resolver(restantes: number): boolean {
    if (restantes === 0) return true
    if (nos++ > limiteNos) return false
    // vaga mais restrita; empate sorteado
    let alvo = -1
    let menor = Infinity
    for (let i = 0; i < vagas.length; i++) {
      if (escolhida[i]) continue
      const t = listas[i].length
      if (t < menor || (t === menor && rng() < 0.5)) {
        menor = t
        alvo = i
      }
    }
    if (alvo < 0 || menor === 0) return false
    const candidatas = listas[alvo]
    for (const p of candidatas) {
      if (usadas.has(p.chave)) continue
      // filtra as vagas que cruzam
      const guardadas: { i: number; antes: Palavra[] }[] = []
      let ok = true
      for (const x of cruz[alvo]) {
        if (escolhida[x.outra]) {
          continue
        }
        const letra = p.chave[x.minha]
        const nova = listas[x.outra].filter((q) => q.chave[x.dela] === letra && q.chave !== p.chave)
        guardadas.push({ i: x.outra, antes: listas[x.outra] })
        listas[x.outra] = nova
        if (nova.length === 0) {
          ok = false
          break
        }
      }
      if (ok) {
        escolhida[alvo] = p
        usadas.add(p.chave)
        if (resolver(restantes - 1)) return true
        escolhida[alvo] = null
        usadas.delete(p.chave)
      }
      for (const g of guardadas) listas[g.i] = g.antes
      if (nos > limiteNos) return false
    }
    return false
  }

  return resolver(vagas.length) ? (escolhida as Palavra[]) : null
}

export interface ResultadoDenso {
  tamanho: number
  palavras: Colocada[]
  densidade: number
}

/** Numera as células iniciais (mesmo número para a horizontal e a vertical que começam na mesma célula). */
export function numerar(colocadas: Colocada[]): Colocada[] {
  const ordenadas = [...colocadas].sort((a, b) => a.linha - b.linha || a.coluna - b.coluna)
  const numeros = new Map<string, number>()
  let n = 0
  return ordenadas.map((c) => {
    const k = `${c.linha},${c.coluna}`
    if (!numeros.has(k)) numeros.set(k, ++n)
    return { ...c, numero: numeros.get(k)! }
  })
}
