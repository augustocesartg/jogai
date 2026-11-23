import type { Curiosidade } from './banco'

const FUSO = 'America/Sao_Paulo'

/** Data de hoje no horário de Brasília, como AAAA-MM-DD (todo mundo troca de curiosidade à meia-noite daqui). */
export function chaveDoDia(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: FUSO, year: 'numeric', month: '2-digit', day: '2-digit' }).format(agora)
}

/** Número de dias desde 1970 da data AAAA-MM-DD. */
export function numeroDoDia(chave: string): number {
  const [a, m, d] = chave.split('-').map(Number)
  return Math.floor(Date.UTC(a, m - 1, d) / 86_400_000)
}

export function curiosidadeDoDia(chave: string, banco: Curiosidade[]): Curiosidade {
  return banco[numeroDoDia(chave) % banco.length]
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** "23 nov" */
export function dataCurta(chave: string): string {
  const [, m, d] = chave.split('-').map(Number)
  return `${d} ${MESES[m - 1]}`
}
