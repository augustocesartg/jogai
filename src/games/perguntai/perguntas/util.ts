import type { NivelPergunta, PerguntaBase } from '../types'

/** Monta uma pergunta: nível (1 fácil, 2 média, 3 difícil), texto, alternativa certa e as 3 erradas. */
export const q = (nivel: NivelPergunta, texto: string, certa: string, a: string, b: string, c: string): PerguntaBase => ({
  nivel,
  texto,
  certa,
  erradas: [a, b, c],
})
