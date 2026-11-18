import { useState } from 'react'
import { Configuracao } from './Configuracao'
import { Partida } from './Partida'
import type { ConfigPerguntai } from './progresso'

export function Perguntai({ onSair }: { onSair: () => void }) {
  const [config, setConfig] = useState<ConfigPerguntai | null>(null)
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
  return <Partida key={rodada} config={config} onNova={() => setRodada((n) => n + 1)} onConfig={() => setConfig(null)} />
}
