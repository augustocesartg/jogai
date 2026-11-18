import type { JogoCliente } from '../../plataforma/jogo'
import { Lobby, PartidaOnline } from './ComponentesOnline'
import { lerPerguntasVistas } from './progresso'

export const perguntaiCliente: JogoCliente = {
  id: 'perguntai',
  nome: 'Perguntaí',
  lerVistas: lerPerguntasVistas,
  Lobby,
  Partida: PartidaOnline,
}
