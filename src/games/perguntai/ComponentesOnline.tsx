import { useEffect, useState } from 'react'
import type { PropsLobby, PropsPartidaOnline } from '../../plataforma/jogo'
import { MAX_JOGADORES, MIN_JOGADORES } from '../../plataforma/online/protocolo'
import { marcarPerguntaVista } from './progresso'
import { TelaPartida } from './TelaPartida'
import type { NivelBot } from './types'
import type { Visao } from './visao'

const NIVEIS: { id: NivelBot; nome: string }[] = [
  { id: 'facil', nome: 'Fácil' },
  { id: 'medio', nome: 'Médio' },
  { id: 'dificil', nome: 'Difícil' },
]
const DURACOES = [
  { fichas: 3, nome: 'Curta · 3 fichas' },
  { fichas: 4, nome: 'Média · 4 fichas' },
  { fichas: 6, nome: 'Completa · 6 fichas' },
]

/** Opções do anfitrião na sala de espera: dificuldade, duração, bots e botão de iniciar. */
export function Lobby({ humanos, onIniciar }: PropsLobby) {
  const [nivel, setNivel] = useState<NivelBot>('medio')
  const [fichas, setFichas] = useState(4)
  const [bots, setBots] = useState(0)
  const maxBots = MAX_JOGADORES - humanos
  const botsAtuais = Math.min(bots, maxBots)
  const podeIniciar = humanos + botsAtuais >= MIN_JOGADORES

  return (
    <>
      <div className="adv-campo">
        <span>Dificuldade</span>
        <div className="chips">
          {NIVEIS.map((n) => (
            <button key={n.id} className={'chip' + (nivel === n.id ? ' ativo' : '')} aria-pressed={nivel === n.id} onClick={() => setNivel(n.id)}>
              {n.nome}
            </button>
          ))}
        </div>
      </div>
      <div className="adv-campo">
        <span>Duração</span>
        <div className="chips">
          {DURACOES.map((d) => (
            <button key={d.fichas} className={'chip' + (fichas === d.fichas ? ' ativo' : '')} aria-pressed={fichas === d.fichas} onClick={() => setFichas(d.fichas)}>
              {d.nome}
            </button>
          ))}
        </div>
      </div>
      <div className="adv-campo">
        <span>Bots para completar a sala</span>
        <div className="adv-stepper">
          <button onClick={() => setBots(Math.max(0, botsAtuais - 1))} aria-label="Menos um bot" disabled={botsAtuais === 0}>−</button>
          <b>{botsAtuais}</b>
          <button onClick={() => setBots(Math.min(maxBots, botsAtuais + 1))} aria-label="Mais um bot" disabled={botsAtuais >= maxBots}>+</button>
        </div>
      </div>
      <button className="primario adv-jogar" disabled={!podeIniciar} onClick={() => onIniciar({ nivel, fichas, bots: botsAtuais })}>
        Iniciar partida
      </button>
      {!podeIniciar && <small>Precisa de pelo menos {MIN_JOGADORES} jogadores (você pode completar com bots).</small>}
    </>
  )
}

export function PartidaOnline({ visao, eu, fimEm, agir, onNova, esperaNova, onSair, rotuloSair, extra }: PropsPartidaOnline) {
  const v = visao as Visao
  // a pergunta que acabou de sair entra na memória do aparelho, junto com as do modo solo
  const perguntaId = v.pergunta?.id ?? null
  useEffect(() => {
    if (perguntaId) marcarPerguntaVista(perguntaId)
  }, [perguntaId])
  return (
    <TelaPartida visao={v} eu={eu} fimEm={fimEm} agir={agir} onNova={onNova} esperaNova={esperaNova} onSair={onSair} rotuloSair={rotuloSair} extra={extra} />
  )
}
