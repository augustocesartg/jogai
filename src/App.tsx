import { useState } from 'react'
import { Mascote } from './components/Mascote'
import { PalavrasCruzadas } from './games/palavras-cruzadas/PalavrasCruzadas'
import { lerStats } from './games/palavras-cruzadas/progresso'

const EM_BREVE = [
  { nome: 'Caça-palavras', emoji: '🔎' },
  { nome: 'Forca', emoji: '🪢' },
]

export default function App() {
  const [jogo, setJogo] = useState<string | null>(null)

  if (jogo === 'cruzadas') return <PalavrasCruzadas onSair={() => setJogo(null)} />
  return <Home onJogar={setJogo} />
}

function Home({ onJogar }: { onJogar: (id: string) => void }) {
  const [stats] = useState(lerStats)

  return (
    <main className="home">
      <header className="topo">
        <Mascote pose="boas-vindas" tamanho={132} className="mascote-home" />
        <div>
          <h1 className="logo">Jogaí</h1>
          <p className="tagline">Bora jogar?</p>
        </div>
      </header>

      {stats.acertos > 0 && (
        <div className="stats" aria-label="Seu progresso">
          <span className="stat">✅ <b>{stats.acertos}</b> palavras acertadas</span>
          {stats.sequencia > 0 && (
            <span className="stat">🔥 <b>{stats.sequencia}</b> {stats.sequencia === 1 ? 'dia' : 'dias'} seguidos</span>
          )}
        </div>
      )}

      <h2 className="secao">Jogos</h2>
      <ul className="lista-jogos">
        <li>
          <button className="cartao-jogo destaque" onClick={() => onJogar('cruzadas')}>
            <span className="emoji">🧩</span>
            <span className="textos">
              <strong>Palavras Cruzadas</strong>
              <small>História, artes, ciência e geografia</small>
            </span>
            <span className="jogar">Jogar ▶</span>
          </button>
        </li>
        {EM_BREVE.map((j) => (
          <li key={j.nome}>
            <div className="cartao-jogo breve" aria-disabled="true">
              <span className="emoji">{j.emoji}</span>
              <span className="textos">
                <strong>{j.nome}</strong>
                <small>Em breve</small>
              </span>
              <span className="cadeado" aria-hidden="true">🔒</span>
            </div>
          </li>
        ))}
      </ul>

      <footer className="rodape">Jogaí · jogos de palavras e conhecimento</footer>
    </main>
  )
}
