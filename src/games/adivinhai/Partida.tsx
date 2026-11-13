import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { jogadaBot } from './bots'
import { CARTAS } from './cartas'
import { aplicar, criarPartida, type ConfigJogador } from './motor'
import { gravarCartasUsadas, lerCartasUsadas, type ConfigAdivinhai } from './progresso'
import { criarRng } from './rng'
import { TelaPartida } from './TelaPartida'
import type { Acao, Estado } from './types'
import { visaoDe } from './visao'

const NOMES_BOTS = ['Ana', 'Beto', 'Carla', 'Davi', 'Eva']

function jogadoresDe(c: ConfigAdivinhai): ConfigJogador[] {
  return [
    { nome: c.nome, bot: null },
    ...Array.from({ length: c.bots }, (_, i) => ({ nome: NOMES_BOTS[i], bot: c.nivel })),
  ]
}

interface Props {
  config: ConfigAdivinhai
  onNova: () => void
  onConfig: () => void
}

export function Partida({ config, onNova, onConfig }: Props) {
  const [{ rng, inicial }] = useState(() => {
    const rng = criarRng(Math.floor(Math.random() * 2 ** 32))
    const inicial = criarPartida(jogadoresDe(config), CARTAS, rng, { nivel: config.nivel, usadas: lerCartasUsadas() })
    return { rng, inicial }
  })
  const [estado, setEstado] = useState<Estado>(inicial)
  const estadoRef = useRef<Estado>(inicial)

  const executar = useCallback(
    (a: Acao) => {
      const depois = aplicar(estadoRef.current, a, CARTAS, rng)
      estadoRef.current = depois
      setEstado(depois)
    },
    [rng],
  )

  const cartasUsadas = estado.cartasUsadas.join('|')
  useEffect(() => {
    gravarCartasUsadas(cartasUsadas ? cartasUsadas.split('|') : [])
  }, [cartasUsadas])

  const visao = useMemo(() => visaoDe(estado), [estado])
  const r = estado.rodada
  const jogador = estado.jogadores[r.vez]

  // jogada automática dos bots, com uma pausa para dar para acompanhar
  useEffect(() => {
    if (estado.vencedor !== null || r.fase === 'fim' || jogador.bot === null) return
    const t = setTimeout(() => executar(jogadaBot(estadoRef.current, rng)), 1000 + rng() * 700)
    return () => clearTimeout(t)
  }, [estado, r.fase, jogador.bot, rng, executar])

  return <TelaPartida visao={visao} eu={0} agir={executar} onNova={onNova} onSair={onConfig} />
}
