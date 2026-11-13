import type { Carta } from './types'

const ARTIGOS = new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'dos', 'das', 'e'])

/** minúsculas, sem acentos, sem pontuação e sem artigos/preposições comuns */
export function normalizarPalpite(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((p) => p && !ARTIGOS.has(p))
    .join(' ')
}

function distancia(a: string, b: string): number {
  const linha = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    let anterior = linha[0]
    linha[0] = i
    for (let j = 1; j <= b.length; j++) {
      const atual = linha[j]
      linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, anterior + (a[i - 1] === b[j - 1] ? 0 : 1))
      anterior = atual
    }
  }
  return linha[b.length]
}

/** Aceita variações de escrita pequenas (1 erro em palavras médias, 2 em longas); números só exatos. */
export function conferirPalpite(carta: Carta, texto: string): boolean {
  const palpite = normalizarPalpite(texto)
  if (!palpite) return false
  const alvos = [carta.resposta, ...(carta.aceitas ?? [])].map(normalizarPalpite)
  if (alvos.some((a) => a === palpite)) return true
  if (carta.categoria === 'ano' || /\d/.test(palpite)) return false
  return alvos.some((a) => {
    if (a.length < 5) return false
    const limite = a.length >= 9 ? 2 : 1
    return distancia(a, palpite) <= limite
  })
}
