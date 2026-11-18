import type { JogoCliente } from '../../plataforma/jogo'
import { Lobby, PartidaOnline } from './ComponentesOnline'
import { lerCartasUsadas } from './progresso'

export const adivinhaiCliente: JogoCliente = {
  id: 'adivinhai',
  nome: 'Adivinhaí',
  lerVistas: lerCartasUsadas,
  Lobby,
  Partida: PartidaOnline,
}
