import type { CategoriaCuriosidade, Curiosidade } from '../banco'

/** Cria a função de uma categoria: em('Ciência')(titulo, resumo, texto, fonte). */
export const em =
  (categoria: CategoriaCuriosidade) =>
  (titulo: string, resumo: string, texto: string, fonte: string): Curiosidade => ({ categoria, titulo, resumo, texto, fonte })
