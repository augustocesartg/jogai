import { useState } from 'react'
import { Mascote } from '../../components/Mascote'
import { gravarConfig, lerConfig, type ConfigPerguntai } from './progresso'
import type { NivelBot } from './types'

const NIVEIS: { id: NivelBot; nome: string }[] = [
  { id: 'facil', nome: 'Fácil' },
  { id: 'medio', nome: 'Médio' },
  { id: 'dificil', nome: 'Difícil' },
]

const DURACOES: { fichas: number; nome: string; dica: string }[] = [
  { fichas: 3, nome: 'Curta', dica: '3 fichas' },
  { fichas: 4, nome: 'Média', dica: '4 fichas' },
  { fichas: 6, nome: 'Completa', dica: '6 fichas' },
]

interface Props {
  onJogar: (c: ConfigPerguntai) => void
  onSair: () => void
}

export function Configuracao({ onJogar, onSair }: Props) {
  const [config, setConfig] = useState<ConfigPerguntai>(lerConfig)
  const atualizar = (parcial: Partial<ConfigPerguntai>) => setConfig((c) => ({ ...c, ...parcial }))

  function jogar() {
    const final = { ...config, nome: config.nome.trim() || 'Você' }
    gravarConfig(final)
    onJogar(final)
  }

  return (
    <main className="config adv-config">
      <button className="voltar" onClick={onSair}>← Jogos</button>
      <div className="config-topo">
        <Mascote pose="detetive" tamanho={120} />
        <div>
          <h1>Perguntaí</h1>
          <p className="sub">Gire a roleta, acerte e junte as fichas</p>
        </div>
      </div>

      <label className="adv-campo">
        <span>Seu nome</span>
        <input value={config.nome} maxLength={16} placeholder="Você" onChange={(e) => atualizar({ nome: e.target.value })} />
      </label>

      <div className="adv-campo">
        <span>Adversários (bots)</span>
        <div className="adv-stepper">
          <button onClick={() => atualizar({ bots: Math.max(1, config.bots - 1) })} aria-label="Menos um bot" disabled={config.bots === 1}>−</button>
          <b>{config.bots}</b>
          <button onClick={() => atualizar({ bots: Math.min(5, config.bots + 1) })} aria-label="Mais um bot" disabled={config.bots === 5}>+</button>
        </div>
        {config.bots >= 2 && <small>Com 3 ou mais jogadores, quem chega à Coroa pode desafiar alguém para um duelo.</small>}
      </div>

      <div className="adv-campo">
        <span>Dificuldade</span>
        <div className="chips">
          {NIVEIS.map((n) => (
            <button key={n.id} className={'chip' + (config.nivel === n.id ? ' ativo' : '')} aria-pressed={config.nivel === n.id} onClick={() => atualizar({ nivel: n.id })}>
              {n.nome}
            </button>
          ))}
        </div>
        <small>Define a força dos bots e o quão difíceis são as perguntas.</small>
      </div>

      <div className="adv-campo">
        <span>Duração</span>
        <div className="chips">
          {DURACOES.map((d) => (
            <button key={d.fichas} className={'chip' + (config.fichas === d.fichas ? ' ativo' : '')} aria-pressed={config.fichas === d.fichas} onClick={() => atualizar({ fichas: d.fichas })}>
              {d.nome} · {d.dica}
            </button>
          ))}
        </div>
      </div>

      <button className="primario adv-jogar" onClick={jogar}>Jogar</button>

      <details className="adv-regras">
        <summary>Como jogar</summary>
        <ul>
          <li>Na sua vez, gire a roleta: ela sorteia uma das 6 categorias ou a Coroa.</li>
          <li>Responda a pergunta de 4 alternativas. Acertou? Avança uma casa na sua trilha e joga de novo. Errou? Passa a vez.</li>
          <li>A trilha tem 4 casas: 3 de avanço e a Coroa. Na Coroa, escolha uma categoria que você ainda não tem e acerte para ganhar a ficha. Se errar, volta ao início da trilha.</li>
          <li>Tirar a Coroa na roleta também vale a ficha, mas errar só passa a vez.</li>
          <li>Curingas (1 de cada, uso único): <b>Bomba</b> tira 2 erradas, <b>Chance dupla</b> dá uma segunda tentativa, <b>Tiro extra</b> gira de novo e <b>Passar</b> troca a pergunta.</li>
          <li>Duelo (3 ou mais jogadores): na Coroa, desafie quem tem uma ficha que você não tem, apostando uma ficha sua. Quem acertar primeiro leva a ficha.</li>
          <li>Vence quem juntar as fichas primeiro.</li>
        </ul>
      </details>
    </main>
  )
}
