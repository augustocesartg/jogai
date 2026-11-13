import { useState } from 'react'
import { Configuracao } from './Configuracao'
import { Partida } from './Partida'
import type { ConfigAdivinhai } from './progresso'

export function Adivinhai({ onSair }: { onSair: () => void }) {
  const [config, setConfig] = useState<ConfigAdivinhai | null>(null)
  const [rodada, setRodada] = useState(0)

  if (!config) {
    return (
      <Configuracao
        onSair={onSair}
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
