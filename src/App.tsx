import { lazy, Suspense, useState } from 'react'
import { Mascote } from './components/Mascote'
import { lerStats } from './games/palavras-cruzadas/progresso'
import { lerConfig } from './games/adivinhai/progresso'

// cada jogo é um pedaço separado: a home abre leve e o jogo carrega ao entrar (o service worker guarda tudo para o offline)
const Adivinhai = lazy(() => import('./games/adivinhai/Adivinhai').then((m) => ({ default: m.Adivinhai })))
const PalavrasCruzadas = lazy(() =>
  import('./games/palavras-cruzadas/PalavrasCruzadas').then((m) => ({ default: m.PalavrasCruzadas })),
)
const Perguntai = lazy(() => import('./games/perguntai/Perguntai').then((m) => ({ default: m.Perguntai })))
const Online = lazy(() => import('./plataforma/online/Online').then((m) => ({ default: m.Online })))

const EM_BREVE = [
  { nome: 'Caça-palavras', emoji: '🔎' },
  { nome: 'Forca', emoji: '🪢' },
]

export default function App() {
  // link de convite: /sala/ABCD abre direto a sala, de qualquer jogo
  const [salaInicial, setSalaInicial] = useState(() => location.pathname.match(/^\/sala\/([A-Z0-9]{4})$/)?.[1])
  const [jogo, setJogo] = useState<string | null>(null)

  let tela
  if (salaInicial) {
    tela = <Online nome={lerConfig().nome || 'Você'} codigoInicial={salaInicial} onSair={() => setSalaInicial(undefined)} />
  } else if (jogo === 'cruzadas') tela = <PalavrasCruzadas onSair={() => setJogo(null)} />
  else if (jogo === 'adivinhai') tela = <Adivinhai onSair={() => setJogo(null)} />
  else if (jogo === 'perguntai') tela = <Perguntai onSair={() => setJogo(null)} />
  else tela = <Home onJogar={setJogo} />

  return (
    <Suspense fallback={<p className="carregando">Carregando…</p>}>{tela}</Suspense>
  )
}

function Home({ onJogar }: { onJogar: (id: string) => void }) {
  const [stats] = useState(lerStats)

  return (
    <main className="home">
      <header className="topo">
        <Mascote pose="boas-vindas" tamanho={120} className="mascote-home" />
        <div>
          <p className="balao">Bora jogar?</p>
          <h1 className="logo">Jogaí</h1>
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
          <button className="cartao-jogo destaque adivinhai" onClick={() => onJogar('adivinhai')}>
            <span className="emoji">🕵️</span>
            <span className="textos">
              <strong>Adivinhaí</strong>
              <small>Descubra a resposta com o mínimo de pistas. Contra bots ou online com amigos</small>
            </span>
            <span className="jogar">Jogar ▶</span>
          </button>
        </li>
        <li>
          <button className="cartao-jogo destaque perguntai" onClick={() => onJogar('perguntai')}>
            <span className="emoji">🎡</span>
            <span className="textos">
              <strong>Perguntaí</strong>
              <small>Gire a roleta, responda e junte as fichas</small>
            </span>
            <span className="jogar">Jogar ▶</span>
          </button>
        </li>
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
