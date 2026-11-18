import { useState } from 'react'
import { Online } from '../../plataforma/online/Online'
import { Configuracao } from './Configuracao'
import { Partida } from './Partida'
import type { ConfigPerguntai } from './progresso'

export function Perguntai({ onSair }: { onSair: () => void }) {
  const [config, setConfig] = useState<ConfigPerguntai | null>(null)
  const [rodada, setRodada] = useState(0)
  const [online, setOnline] = useState<string | null>(null)

  if (online !== null) return <Online jogo="perguntai" nome={online} onSair={() => setOnline(null)} />

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
  return <Partida key={rodada} config={config} onNova={() => setRodada((n) => n + 1)} onConfig={() => setConfig(null)} />
}
