import { CATEGORIAS, type Pergunta } from './types'

/** Banco sintético para testes e simulação: `porCategoria` perguntas por categoria, níveis 1 a 3 em rodízio. */
export function perguntasDeTeste(porCategoria = 12): Pergunta[] {
  return CATEGORIAS.flatMap((c) =>
    Array.from({ length: porCategoria }, (_, i) => ({
      id: `${c.id}:${i}`,
      categoria: c.id,
      texto: `Pergunta ${i} de ${c.nome}?`,
      certa: `certa ${c.id} ${i}`,
      erradas: [`a ${c.id} ${i}`, `b ${c.id} ${i}`, `c ${c.id} ${i}`] as [string, string, string],
      nivel: ((i % 3) + 1) as 1 | 2 | 3,
    })),
  )
}
