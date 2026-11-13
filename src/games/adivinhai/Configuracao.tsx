import { useState } from 'react'
import { Mascote } from '../../components/Mascote'
import { gravarConfig, lerConfig, type ConfigAdivinhai } from './progresso'
import { CASAS, type NivelBot } from './types'

const NIVEIS: { id: NivelBot; nome: string }[] = [
  { id: 'facil', nome: 'Fácil' },
  { id: 'medio', nome: 'Médio' },
  { id: 'dificil', nome: 'Difícil' },
]

interface Props {
  onJogar: (c: ConfigAdivinhai) => void
  onSair: () => void
}

export function Configuracao({ onJogar, onSair }: Props) {
  const [config, setConfig] = useState<ConfigAdivinhai>(lerConfig)
  const atualizar = (parcial: Partial<ConfigAdivinhai>) => setConfig((c) => ({ ...c, ...parcial }))

  function jogar() {
    const final = { ...config, nome: config.nome.trim() || 'Você' }
    gravarConfig(final)
    onJogar(final)
  }

  return (
    <main className="config adv-config">
      <button className="voltar" onClick={onSair}>← Jogos</button>
      <div className="config-topo">
        <Mascote pose="escritor" tamanho={110} />
        <div>
          <h1>Adivinhaí</h1>
          <p className="sub">20 pistas, 1 resposta</p>
        </div>
      </div>

      <label className="adv-campo">
        <span>Seu nome</span>
        <input
          value={config.nome}
          maxLength={16}
          placeholder="Você"
          onChange={(e) => atualizar({ nome: e.target.value })}
        />
      </label>

      <div className="adv-campo">
        <span>Adversários (bots)</span>
        <div className="adv-stepper">
          <button onClick={() => atualizar({ bots: Math.max(0, config.bots - 1) })} aria-label="Menos um bot" disabled={config.bots === 0}>−</button>
          <b>{config.bots}</b>
          <button onClick={() => atualizar({ bots: Math.min(5, config.bots + 1) })} aria-label="Mais um bot" disabled={config.bots === 5}>+</button>
        </div>
        {config.bots === 0 && <small>Sem bots, é você contra o Mediador.</small>}
      </div>

      <div className="adv-campo">
        <span>Nível dos bots</span>
        <div className="chips">
          {NIVEIS.map((n) => (
            <button
              key={n.id}
              className={'chip' + (config.nivel === n.id ? ' ativo' : '')}
              aria-pressed={config.nivel === n.id}
              onClick={() => atualizar({ nivel: n.id })}
            >
              {n.nome}
            </button>
          ))}
        </div>
      </div>

      <button className="primario adv-jogar" onClick={jogar}>Jogar</button>

      <details className="adv-regras">
        <summary>Como jogar</summary>
        <ul>
          <li>Cada rodada tem uma carta secreta: pessoa, lugar, coisa, ano ou mundo digital.</li>
          <li>Na sua vez, escolha um número de 1 a 20 para ouvir uma pista, e então dê um palpite ou passe.</li>
          <li>Quem acerta avança <b>20 − pistas usadas</b> casas. Menos pistas, mais casas!</li>
          <li>O <b>Mediador</b> também tem um peão e avança 1 casa a cada pista que não leva ao acerto.</li>
          <li>Alguns números escondem comandos: perca a vez, avance 2, volte 1 ou escolha outro número.</li>
          <li>Quem chegar à casa {CASAS} primeiro vence, jogador ou Mediador.</li>
        </ul>
      </details>
    </main>
  )
}
