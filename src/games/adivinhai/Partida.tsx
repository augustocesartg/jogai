import { useCallback, useEffect, useRef, useState } from 'react'
import { Mascote } from '../../components/Mascote'
import { jogadaBot } from './bots'
import { CARTAS } from './cartas'
import { aplicar, criarPartida, TEXTO_COMANDO, type ConfigJogador } from './motor'
import { gravarCartasUsadas, lerCartasUsadas, type ConfigAdivinhai } from './progresso'
import { definirSom, somLigado, tocar, type Som } from './sons'
import { criarRng } from './rng'
import { Tabuleiro, type Peao } from './Tabuleiro'
import { CATEGORIAS, CASAS, TOTAL_ITENS, type Acao, type Estado } from './types'

interface Aviso {
  id: number
  icone: string
  texto: string
  detalhe?: string
  tom: 'ok' | 'ruim' | 'comando' | 'info'
  ms: number
}

/** Sons correspondentes à transição de estado (eventos, pista revelada e fim de partida). */
function sonsDe(antes: Estado, depois: Estado): Som[] {
  const lista: Som[] = []
  if (depois.seq === antes.seq) {
    if (antes.rodada.fase === 'escolher' && depois.rodada.fase === 'palpitar') lista.push('pista')
  } else {
    for (const ev of depois.eventos) {
      if (ev.tipo === 'comando') lista.push(ev.comando)
      else if (ev.tipo === 'erro') lista.push(ev.passou ? 'passou' : 'erro')
      else if (ev.tipo === 'acerto') lista.push('acerto')
      else if (ev.tipo === 'esgotou') lista.push('esgotou')
      else lista.push('rodada')
    }
  }
  if (depois.vencedor !== null && antes.vencedor === null) lista.push(depois.vencedor === 0 ? 'vitoria' : 'derrota')
  return lista
}

/** Transforma os eventos da última ação em avisos que saltam na tela. */
function avisosDe(e: Estado, proximoId: () => number): Aviso[] {
  const quem = (i: number) => (i === 0 ? 'Você' : e.jogadores[i].nome)
  const lista: Omit<Aviso, 'id'>[] = e.eventos.map((ev) => {
    if (ev.tipo === 'comando') {
      const n = quem(ev.jogador)
      if (ev.comando === 'perca') return { icone: '⏸️', texto: `${n} perde a vez!`, detalhe: 'Mediador +1', tom: 'ruim', ms: 1800 }
      if (ev.comando === 'avance2') return { icone: '⏩', texto: `${n} avança 2 casas!`, detalhe: 'Mediador +1', tom: 'ok', ms: 1800 }
      if (ev.comando === 'volte1') return { icone: '⏪', texto: `${n} volta 1 casa!`, detalhe: 'Mediador +1', tom: 'ruim', ms: 1800 }
      return { icone: '🔁', texto: `${n} escolhe outro número!`, detalhe: 'Mediador +1', tom: 'comando', ms: 1800 }
    }
    if (ev.tipo === 'acerto') return { icone: '🎉', texto: `${quem(ev.jogador)} acertou!`, detalhe: `+${ev.casas} casas`, tom: 'ok', ms: 2300 }
    if (ev.tipo === 'erro') {
      return { icone: ev.passou ? '🙈' : '❌', texto: `${quem(ev.jogador)} ${ev.passou ? 'passou' : 'errou'}`, detalhe: 'Mediador +1', tom: 'ruim', ms: 1500 }
    }
    if (ev.tipo === 'esgotou') return { icone: '⏰', texto: 'As 20 pistas acabaram!', detalhe: 'Ninguém acertou', tom: 'ruim', ms: 2100 }
    const cat = CATEGORIAS.find((c) => c.id === e.rodada.carta.categoria)!
    return { icone: '🃏', texto: `Rodada ${ev.numero}`, detalhe: `${cat.emoji} ${cat.nome}`, tom: 'info', ms: 1700 }
  })
  return lista.map((a) => ({ ...a, id: proximoId() }))
}

const NOMES_BOTS = ['Ana', 'Beto', 'Carla', 'Davi', 'Eva']
const COR_MEDIADOR = '#374151'

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
  const [resumoFechado, setResumoFechado] = useState(false)

  const estadoRef = useRef<Estado>(inicial)
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [festa, setFesta] = useState(false)
  const [som, setSom] = useState(somLigado)
  const contadorAviso = useRef(0)

  const executar = useCallback(
    (a: Acao) => {
      const antes = estadoRef.current
      const depois = aplicar(antes, a, CARTAS, rng)
      estadoRef.current = depois
      setEstado(depois)
      const sons = sonsDe(antes, depois)
      if (sons.length > 0) tocar(sons)
      if (depois.eventos.some((ev) => ev.tipo === 'acerto' && ev.jogador === 0) && depois.seq !== antes.seq) {
        setFesta(true)
        setTimeout(() => setFesta(false), 2400)
      }
      if (depois.seq === antes.seq) return
      const novos = avisosDe(depois, () => ++contadorAviso.current)
      setAvisos((atual) => [...atual, ...novos].slice(-3))
      for (const n of novos) setTimeout(() => setAvisos((atual) => atual.filter((x) => x.id !== n.id)), n.ms)
      const meu = depois.eventos.some((ev) => 'jogador' in ev && ev.jogador === 0 && (ev.tipo === 'acerto' || ev.tipo === 'comando'))
      if (meu && typeof navigator.vibrate === 'function') navigator.vibrate(70)
    },
    [rng],
  )
  const agir = executar

  const cartasUsadas = estado.cartasUsadas.join('|')
  useEffect(() => {
    gravarCartasUsadas(cartasUsadas ? cartasUsadas.split('|') : [])
  }, [cartasUsadas])

  const r = estado.rodada
  const jogador = estado.jogadores[r.vez]
  const minhaVez = jogador.bot === null && estado.vencedor === null

  // jogada automática dos bots, com uma pausa para dar para acompanhar
  useEffect(() => {
    if (estado.vencedor !== null || r.fase === 'fim' || jogador.bot === null) return
    const t = setTimeout(() => executar(jogadaBot(estadoRef.current, rng)), 1000 + rng() * 700)
    return () => clearTimeout(t)
  }, [estado, r.fase, jogador.bot, rng, executar])

  const categoria = CATEGORIAS.find((c) => c.id === r.carta.categoria)!
  const peoes: Peao[] = [
    ...estado.jogadores.map((j) => ({ id: j.id, rotulo: j.nome[0].toUpperCase(), cor: j.cor, pos: j.pos, nome: j.nome })),
    { id: 'mediador', rotulo: 'M', cor: COR_MEDIADOR, pos: estado.mediador, nome: 'Mediador' },
  ]

  const pistaAtual = r.atual !== null ? r.itens[r.atual - 1] : null
  const nomeVencedor =
    estado.vencedor === null ? '' : estado.vencedor === 'mediador' ? 'O Mediador' : estado.jogadores[estado.vencedor].nome
  const euVenci = estado.vencedor === 0

  return (
    <main className="jogo adv-jogo">
      <header className="barra">
        <button className="voltar" onClick={onConfig}>← Sair</button>
        <span className="adv-rodada">Rodada {estado.rodadaNum}</span>
        <button
          className="adv-som"
          aria-label={som ? 'Desligar o som' : 'Ligar o som'}
          aria-pressed={som}
          onClick={() => {
            definirSom(!som)
            setSom(!som)
          }}
        >
          {som ? '🔊' : '🔇'}
        </button>
        <span className="adv-categoria">{categoria.emoji} {categoria.nome}</span>
      </header>

      <Tabuleiro peoes={peoes} />

      <div className="adv-avisos" role="status" aria-live="assertive">
        {avisos.map((a) => (
          <div key={a.id} className={`adv-aviso tom-${a.tom}`} style={{ animationDuration: `${a.ms}ms` }}>
            <span className="adv-aviso-icone" aria-hidden="true">{a.icone}</span>
            <span>
              <strong>{a.texto}</strong>
              {a.detalhe && <small>{a.detalhe}</small>}
            </span>
          </div>
        ))}
      </div>

      <ul className="adv-placar" aria-label="Placar">
        {estado.jogadores.map((j, i) => (
          <li key={`${j.id}:${j.pos}`} className={(r.vez === i && r.fase !== 'fim' ? 'vez' : '') + (j.pos > 0 ? ' pulso' : '')}>
            <span className="adv-ponto" style={{ background: j.cor }} />
            {j.nome}{j.bot ? ' 🤖' : ''} <b>{Math.min(j.pos, CASAS)}</b>
          </li>
        ))}
        <li key={`mediador:${estado.mediador}`} className={estado.mediador > 0 ? 'pulso' : ''}>
          <span className="adv-ponto" style={{ background: COR_MEDIADOR }} />
          Mediador <b>{Math.min(estado.mediador, CASAS)}</b>
        </li>
      </ul>

      <section className="adv-painel" aria-live="polite">
        <Mascote className="adv-mascote" pose={festa ? 'comemorando' : 'detetive'} tamanho={66} />
        {r.fase === 'escolher' && (
          <>
            <h2>{minhaVez ? 'Sua vez! Escolha um número' : `${jogador.nome} está escolhendo…`}</h2>
            <div className="adv-numeros">
              {Array.from({ length: TOTAL_ITENS }, (_, i) => i + 1).map((n) => {
                const usado = r.usados.includes(n)
                return (
                  <button
                    key={n}
                    className={usado ? 'usado' : ''}
                    disabled={usado || !minhaVez}
                    onClick={() => agir({ tipo: 'escolher', numero: n })}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
          </>
        )}

        {r.fase === 'palpitar' && pistaAtual?.tipo === 'pista' && (
          <>
            <h2>Pista {r.atual}</h2>
            <p className="adv-pista" key={`pista-${estado.rodadaNum}-${r.atual}`}>{pistaAtual.texto}</p>
            {minhaVez ? (
              <FormPalpite
                key={`palpite-${estado.rodadaNum}-${r.usados.length}`}
                numerico={r.carta.categoria === 'ano'}
                onPalpite={(texto) => agir({ tipo: 'palpitar', texto })}
                onPassar={() => agir({ tipo: 'passar' })}
              />
            ) : (
              <p className="adv-espera">{jogador.nome} está pensando…</p>
            )}
          </>
        )}

        {r.fase === 'fim' && (
          <>
            <p className="adv-resposta-rotulo">A resposta era</p>
            <p className="adv-resposta">{r.carta.resposta}</p>
            {r.resultado?.tipo === 'acerto' && (
              <p className="adv-resultado ok">
                {estado.jogadores[r.resultado.jogador].nome} acertou e avança {r.resultado.casas} casas!
              </p>
            )}
            {r.resultado?.tipo === 'esgotou' && (
              <p className="adv-resultado">As 20 pistas acabaram e ninguém acertou. O Mediador agradece!</p>
            )}
            {estado.vencedor === null && (
              <button className="primario" onClick={() => agir({ tipo: 'proxima' })}>Próxima rodada</button>
            )}
          </>
        )}
      </section>

      {r.usados.length > 0 && r.fase !== 'fim' && (
        <section className="adv-reveladas">
          <h3>Pistas reveladas</h3>
          <ol>
            {[...r.usados].reverse().map((n) => {
              const item = r.itens[n - 1]
              return (
                <li key={n} className={item.tipo === 'comando' ? 'comando' : ''}>
                  <b>{n}</b>{' '}
                  {item.tipo === 'pista' ? item.texto : `🎲 ${TEXTO_COMANDO[item.comando]}`}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      <section className="adv-historico">
        <h3>Últimas jogadas</h3>
        <ul>
          {[...estado.historico].reverse().slice(0, 5).map((h, i) => (
            <li key={`${estado.historico.length - i}`}>{h}</li>
          ))}
          {estado.historico.length === 0 && <li>A partida começou. Boa sorte!</li>}
        </ul>
      </section>

      {estado.vencedor !== null && !resumoFechado && (
        <div className="vitoria-fundo" role="dialog" aria-modal="true" aria-label="Fim da partida">
          <div className="vitoria-tela">
            <Mascote pose={euVenci ? 'comemorando' : 'detetive'} tamanho={150} />
            <h2>{euVenci ? 'Você venceu!' : `${nomeVencedor} venceu!`}</h2>
            <p>{euVenci ? 'Mandou bem nas pistas.' : estado.vencedor === 'mediador' ? 'Dessa vez o Mediador levou.' : 'Boa partida!'}</p>
            <ul className="adv-final">
              {[
                ...estado.jogadores.map((j) => ({ nome: j.nome, pos: j.pos, cor: j.cor })),
                { nome: 'Mediador', pos: estado.mediador, cor: COR_MEDIADOR },
              ]
                .sort((a, b) => b.pos - a.pos)
                .map((p) => (
                  <li key={p.nome}>
                    <span className="adv-ponto" style={{ background: p.cor }} />
                    {p.nome} <b>{Math.min(p.pos, CASAS)}</b>
                  </li>
                ))}
            </ul>
            <button className="primario" onClick={onNova}>Jogar de novo</button>
            <button className="secundario" onClick={() => setResumoFechado(true)}>Ver tabuleiro</button>
            <button className="voltar" onClick={onConfig}>Mudar configurações</button>
          </div>
        </div>
      )}
    </main>
  )
}

function FormPalpite({
  numerico,
  onPalpite,
  onPassar,
}: {
  numerico: boolean
  onPalpite: (texto: string) => void
  onPassar: () => void
}) {
  const [texto, setTexto] = useState('')
  return (
    <form
      className="adv-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (texto.trim()) onPalpite(texto)
      }}
    >
      <input
        autoFocus
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder={numerico ? 'Qual é o ano?' : 'Qual é o seu palpite?'}
        inputMode={numerico ? 'numeric' : 'text'}
        autoComplete="off"
        autoCapitalize="sentences"
        aria-label="Seu palpite"
      />
      <div className="adv-form-botoes">
        <button type="submit" className="primario" disabled={!texto.trim()}>Palpitar</button>
        <button type="button" className="secundario" onClick={onPassar}>Passar</button>
      </div>
    </form>
  )
}
