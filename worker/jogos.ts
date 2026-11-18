import type { JogoServidor } from '../src/plataforma/jogo'
import { adivinhaiServidor } from '../src/games/adivinhai/servidor'
import { perguntaiServidor } from '../src/games/perguntai/servidor'

/** Jogos disponíveis nas salas online, pelo id guardado na sala. */
export const JOGOS: Record<string, JogoServidor<unknown>> = {
  adivinhai: adivinhaiServidor as JogoServidor<unknown>,
  perguntai: perguntaiServidor as JogoServidor<unknown>,
}
