import { useState } from 'react'
import { Configuracao } from './Configuracao'
import { Online } from './online/Online'
import { Partida } from './Partida'
import { lerConfig, type ConfigAdivinhai } from './progresso'

interface Props {
  onSair: () => void
  // código vindo do link /sala/XXXX
  salaInicial?: string
}

export function Adivinhai({ onSair, salaInicial }: Props) {
  const [config, setConfig] = useState<ConfigAdivinhai | null>(null)
  const [rodada, setRodada] = useState(0)
  const [convite, setConvite] = useState(salaInicial)
  const [online, setOnline] = useState<string | null>(() => (salaInicial ? lerConfig().nome || 'Você' : null))

  if (online !== null) {
    return (
      <Online
        nome={online}
        codigoInicial={convite}
        onSair={() => {
          setConvite(undefined)
          setOnline(null)
        }}
      />
    )
  }

  if (!config) {
    return (
      <Configuracao
        onSair={onSair}
        onOnline={setOnline}
        onJogar={(c) => {
          setConfig(c)
          setRodada((n) => n + 1)
        }}
      />
    )
  }
  return (
    <Partida
      key={rodada}
      config={config}
      onNova={() => setRodada((n) => n + 1)}
      onConfig={() => setConfig(null)}
    />
  )
}
