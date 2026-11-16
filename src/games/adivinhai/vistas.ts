/**
 * Junta as listas de cartas já vistas de vários jogadores (cada uma da mais antiga para a mais recente).
 * O resultado também vai da mais antiga para a mais recente: uma carta recente para qualquer jogador conta como recente.
 */
export function unirVistas(listas: string[][]): string[] {
  const recencia = new Map<string, number>()
  for (const l of listas) {
    l.forEach((id, i) => recencia.set(id, Math.max(recencia.get(id) ?? 0, (i + 1) / l.length)))
  }
  return [...recencia.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id)
}
