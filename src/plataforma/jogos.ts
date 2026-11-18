import type { JogoCliente } from './jogo'
import { adivinhaiCliente } from '../games/adivinhai/online'

/** Jogos que têm modo online, pelo id que a sala guarda. */
export const JOGOS_CLIENTE: Record<string, JogoCliente> = {
  adivinhai: adivinhaiCliente,
}
