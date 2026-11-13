import type { Categoria, Estado, Item, Rodada } from './types'

/** O que um jogador pode ver da rodada: nada da carta além da categoria, e só os itens já escolhidos. */
export interface VisaoRodada extends Omit<Rodada, 'carta' | 'itens'> {
  categoria: Categoria
  /** mesma posição de `Rodada.itens`; null enquanto o número não foi escolhido */
  itens: (Item | null)[]
  /** só preenchida quando a rodada termina */
  resposta: string | null
}

export interface Visao extends Omit<Estado, 'rodada' | 'cartasUsadas'> {
  rodada: VisaoRodada
}

/** Versão do estado segura para enviar aos navegadores (no online, a resposta fica só no servidor). */
export function visaoDe(e: Estado): Visao {
  const { rodada, cartasUsadas: _usadas, ...resto } = e
  const { carta, itens, ...r } = rodada
  return {
    ...resto,
    rodada: {
      ...r,
      categoria: carta.categoria,
      itens: itens.map((item, i) => (r.usados.includes(i + 1) ? item : null)),
      resposta: r.fase === 'fim' ? carta.resposta : null,
    },
  }
}
