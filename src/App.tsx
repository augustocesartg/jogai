import { useState } from 'react'
import { PalavrasCruzadas } from './games/palavras-cruzadas/PalavrasCruzadas'

const JOGOS = [
  {
    id: 'cruzadas',
    nome: 'Palavras Cruzadas',
    descricao: 'História, artes, ciência e geografia',
    emoji: '🧩',
  },
]

export default function App() {
  const [jogo, setJogo] = useState<string | null>(null)

  if (jogo === 'cruzadas') return <PalavrasCruzadas onSair={() => setJogo(null)} />

  return (
    <main className="home">
      <h1 className="logo">Jogaí</h1>
      <p className="sub">Escolha um jogo</p>
      <ul className="lista-jogos">
        {JOGOS.map((j) => (
          <li key={j.id}>
            <button className="cartao-jogo" onClick={() => setJogo(j.id)}>
              <span className="emoji">{j.emoji}</span>
              <span>
                <strong>{j.nome}</strong>
                <small>{j.descricao}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}
