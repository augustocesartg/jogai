import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { criarRng } from '../../plataforma/rng'
import { jogadaBot } from './bots'
import { aplicar, criarPartida, NOMES_BOTS, quemAge, type ConfigJogador } from './motor'
import { PERGUNTAS } from './perguntas'
import { gravarPerguntasVistas, lerPerguntasVistas, type ConfigPerguntai } from './progresso'
import { MS_GIRO, TelaPartida, type AcaoUI } from './TelaPartida'
import type { Acao, Estado } from './types'
import { visaoDe } from './visao'

function jogadoresDe(c: ConfigPerguntai): ConfigJogador[] {
  return [{ nome: c.nome, bot: null }, ...Array.from({ length: c.bots }, (_, i) => ({ nome: NOMES_BOTS[i], bot: c.nivel }))]
}

/** Quanto o bot "pensa" antes de agir; no duelo demora mais, para o jogador ter tempo de responder. */
function pausaBot(e: Estado, rng: () => number): number {
  if (e.fase === 'duelo') return 2500 + rng() * 3500
  if (e.fase === 'resultado') return 2600
  return 1100 + rng() * 800
}

interface Props {
  config: ConfigPerguntai
  onNova: () => void
  onConfig: () => void
}

export function Partida({ config, onNova, onConfig }: Props) {
  const [{ rng, inicial }] = useState(() => {
    const rng = criarRng(Math.floor(Math.random() * 2 ** 32))
    const inicial = criarPartida(jogadoresDe(config), rng, {
      nivel: config.nivel,
      usadas: lerPerguntasVistas(),
      fichasParaVencer: config.fichas,
    })
    return { rng, inicial }
  })
  const [estado, setEstado] = useState<Estado>(inicial)
  const estadoRef = useRef<Estado>(inicial)
  // instante do último giro da roleta: os bots esperam a animação terminar
  const giroEm = useRef(0)

  const executar = useCallback(
    (a: Acao) => {
      const antes = estadoRef.current
      const depois = aplicar(antes, a, PERGUNTAS, rng)
      if (depois === antes) return
      if (depois.seq !== antes.seq && depois.eventos.some((x) => x.tipo === 'giro')) giroEm.current = Date.now()
      estadoRef.current = depois
      setEstado(depois)
    },
    [rng],
  )

  // a tela fala por "você" (jogador 0); o jogo solo completa a ação com quem age
  const agirHumano = useCallback((a: AcaoUI) => executar({ ...a, jogador: 0 } as Acao), [executar])

  const usadas = estado.usadas.join('|')
  useEffect(() => {
    gravarPerguntasVistas(usadas ? usadas.split('|') : [])
  }, [usadas])

  // jogadas dos bots, com uma pausa para dar para acompanhar
  useEffect(() => {
    if (estado.vencedor !== null) return
    const bot = quemAge(estado).find((i) => estado.jogadores[i].bot !== null)
    if (bot === undefined) return
    const espera = Math.max(0, giroEm.current + MS_GIRO + 200 - Date.now()) + pausaBot(estado, rng)
    const t = setTimeout(() => executar(jogadaBot(estadoRef.current, bot, rng)), espera)
    return () => clearTimeout(t)
  }, [estado, rng, executar])

  const visao = useMemo(() => visaoDe(estado, 0), [estado])
  return <TelaPartida visao={visao} eu={0} agir={agirHumano} onNova={onNova} onSair={onConfig} />
}
