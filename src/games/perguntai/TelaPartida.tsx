import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Mascote } from '../../components/Mascote'
import { categoriasLivres, desafiosPossiveis } from './motor'
import { Roleta } from './Roleta'
import { definirSom, somLigado, tocar, type Som } from './sons'
import {
  CASAS_TRILHA,
  CATEGORIAS,
  ESPECIAIS,
  TEXTO_ESPECIAL,
  type Acao,
  type Categoria,
  type Especial,
} from './types'
import type { Visao, VisaoPergunta } from './visao'

type SemJogador<T> = T extends unknown ? Omit<T, 'jogador'> : never
/** Ação que a tela envia: quem age é decidido por quem a recebe (o jogo solo ou o servidor). */
export type AcaoUI = SemJogador<Acao>

interface Aviso {
  id: number
  icone: string
  texto: string
  detalhe?: string
  tom: 'ok' | 'ruim' | 'info' | 'comando'
  ms: number
}

const cat = (id: Categoria) => CATEGORIAS.find((c) => c.id === id)!
/** Duração da animação da roleta; o jogo solo espera esse tempo antes de os bots jogarem. */
export const MS_GIRO = 1800

function sonsDe(antes: Visao, depois: Visao, eu: number): Som[] {
  const lista: Som[] = []
  if (depois.seq !== antes.seq) {
    const evs = depois.eventos
    const ficha = evs.some((x) => x.tipo === 'ficha')
    for (const ev of evs) {
      if (ev.tipo === 'giro') lista.push('giro')
      else if (ev.tipo === 'acerto' && !ficha) lista.push('acerto')
      else if (ev.tipo === 'erro') lista.push('erro')
      else if (ev.tipo === 'ficha') lista.push('ficha')
      else if (ev.tipo === 'duelo') lista.push('duelo')
      else if (ev.tipo === 'especial') lista.push('especial')
      else if (ev.tipo === 'vez' && ev.jogador === eu) lista.push('vez')
    }
  }
  if (depois.vencedor !== null && antes.vencedor === null) lista.push(depois.vencedor === eu ? 'vitoria' : 'derrota')
  return lista
}

function avisosDe(e: Visao, eu: number, proximoId: () => number): Aviso[] {
  const quem = (i: number) => (i === eu ? 'Você' : e.jogadores[i].nome)
  const temFicha = (i: number) => e.eventos.some((x) => x.tipo === 'ficha' && x.jogador === i)
  const lista: Omit<Aviso, 'id'>[] = []
  for (const ev of e.eventos) {
    if (ev.tipo === 'giro') {
      lista.push(
        ev.resultado === 'coroa'
          ? { icone: '👑', texto: `${quem(ev.jogador)} tirou a Coroa!`, detalhe: 'Escolhe a categoria da ficha', tom: 'comando', ms: 1900 }
          : { icone: cat(ev.resultado).emoji, texto: `${quem(ev.jogador)} tirou ${cat(ev.resultado).nome}`, tom: 'info', ms: 1700 },
      )
    } else if (ev.tipo === 'acerto') {
      if (!temFicha(ev.jogador)) lista.push({ icone: '✅', texto: `${quem(ev.jogador)} acertou!`, tom: 'ok', ms: 1500 })
    } else if (ev.tipo === 'erro') {
      lista.push({ icone: '❌', texto: `${quem(ev.jogador)} errou`, detalhe: ev.segundaChance ? 'Ainda tem outra chance' : undefined, tom: 'ruim', ms: 1500 })
    } else if (ev.tipo === 'ficha') {
      lista.push({ icone: cat(ev.categoria).emoji, texto: `${quem(ev.jogador)} ganhou a ficha de ${cat(ev.categoria).nome}!`, tom: 'ok', ms: 2300 })
    } else if (ev.tipo === 'duelo') {
      lista.push({ icone: '⚔️', texto: `Duelo! ${quem(ev.desafiante)} x ${quem(ev.alvo)}`, tom: 'comando', ms: 2000 })
    } else if (ev.tipo === 'especial') {
      lista.push({ icone: '✨', texto: `${quem(ev.jogador)} usou ${TEXTO_ESPECIAL[ev.especial]}`, tom: 'info', ms: 1500 })
    }
  }
  return lista.map((a) => ({ ...a, id: proximoId() }))
}

const ICONE_ESPECIAL: Record<Especial, string> = { bomba: '💣', chanceDupla: '✌️', tiroExtra: '🎡', passar: '⏭️' }

/** Quando cada curinga pode ser usado (o motor confere de novo; isto só habilita o botão). */
function podeEspecial(e: Visao, eu: number, esp: Especial): boolean {
  if (eu < 0 || e.vez !== eu || e.vencedor !== null) return false
  if (e.jogadores[eu].especiais[esp] <= 0) return false
  const p = e.pergunta
  if (esp === 'tiroExtra' && e.fase === 'resultado' && e.resultado?.tipo === 'erro') return true
  if (e.fase !== 'responder' || !p || p.erradas.length > 0) return false
  if (esp === 'bomba') return p.eliminadas.length === 0
  if (esp === 'chanceDupla') return p.tentativas === 1
  if (esp === 'tiroExtra') return p.valor === 'trilha'
  return true
}

function textoResultado(e: Visao, eu: number): { icone: string; texto: string; tom: 'ok' | 'ruim' | 'info' } {
  const r = e.resultado
  const quem = (i: number) => (i === eu ? 'Você' : e.jogadores[i].nome)
  if (!r) return { icone: '', texto: '', tom: 'info' }
  if (r.tipo === 'acerto') {
    return { icone: '✅', texto: `${quem(r.jogador)} acertou${r.chegouCoroa ? ' e chegou à Coroa!' : ' e avançou na trilha.'}`, tom: 'ok' }
  }
  if (r.tipo === 'ficha') return { icone: cat(r.categoria).emoji, texto: `${quem(r.jogador)} conquistou a ficha de ${cat(r.categoria).nome}!`, tom: 'ok' }
  if (r.tipo === 'erro') {
    const volta = r.valor === 'ficha-trilha' ? ' Volta ao início da trilha.' : ''
    return { icone: '❌', texto: `${quem(r.jogador)} ${r.semResposta ? 'ficou sem responder' : 'errou'}.${volta}`, tom: 'ruim' }
  }
  if (r.vencedor === null) return { icone: '🤝', texto: 'Ninguém acertou o duelo. Nada muda.', tom: 'info' }
  const perdedor = r.vencedor === r.desafiante ? r.alvo : r.desafiante
  const ficha = r.vencedor === r.desafiante ? r.premio : r.aposta
  return { icone: '⚔️', texto: `${quem(r.vencedor)} venceu o duelo e levou a ficha de ${cat(ficha).nome} de ${quem(perdedor)}.`, tom: 'ok' }
}

function Fichas({ fichas }: { fichas: Categoria[] }) {
  return (
    <span className="pg-fichas" aria-label={`${fichas.length} fichas`}>
      {CATEGORIAS.map((c) => (
        <i
          key={c.id}
          className={fichas.includes(c.id) ? 'tem' : ''}
          style={fichas.includes(c.id) ? { background: c.cor } : undefined}
          title={c.nome}
        />
      ))}
    </span>
  )
}

function Trilha({ posicao }: { posicao: number }) {
  return (
    <span className="pg-trilha" aria-label={posicao >= CASAS_TRILHA - 1 ? 'Na Coroa' : `Casa ${posicao + 1} de ${CASAS_TRILHA}`}>
      {Array.from({ length: CASAS_TRILHA }, (_, i) => (
        <i key={i} className={(i <= posicao ? 'feita ' : '') + (i === CASAS_TRILHA - 1 ? 'coroa' : '')}>
          {i === CASAS_TRILHA - 1 ? '👑' : ''}
        </i>
      ))}
    </span>
  )
}

const LETRAS = ['A', 'B', 'C', 'D']

function CartaPergunta({
  p,
  jogando,
  onResponder,
  minhaResposta,
}: {
  p: VisaoPergunta
  jogando: boolean
  onResponder: (opcao: number) => void
  minhaResposta?: number | null
}) {
  const c = cat(p.categoria)
  const revelada = p.correta !== null
  const valor =
    p.valor === 'trilha' ? 'Avança uma casa' : p.valor === 'duelo' ? 'Vale a ficha do duelo' : 'Vale a ficha'
  return (
    <div className="pg-carta" style={{ ['--cor' as string]: c.cor }}>
      <div className="pg-carta-topo">
        <span className="pg-categoria">{c.emoji} {c.nome}</span>
        <span className="pg-valor">{valor}</span>
      </div>
      <p className="pg-texto">{p.texto}</p>
      {p.tentativas === 2 && !revelada && <small className="pg-dica">Chance dupla ativa: você tem 2 tentativas.</small>}
      <div className="pg-opcoes">
        {p.opcoes.map((o, i) => {
          let estado = ''
          if (revelada) estado = i === p.correta ? 'certa' : p.erradas.includes(i) || minhaResposta === i ? 'errada' : 'neutra'
          else if (p.eliminadas.includes(i)) estado = 'eliminada'
          else if (p.erradas.includes(i) || minhaResposta === i) estado = 'errada'
          return (
            <button
              key={i}
              className={'pg-opcao ' + estado}
              disabled={!jogando || estado !== '' || (minhaResposta !== undefined && minhaResposta !== null)}
              onClick={() => onResponder(i)}
            >
              <b>{LETRAS[i]}</b>
              <span>{o}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  visao: Visao
  /** índice do jogador que está nesta tela */
  eu: number
  /** instante (relógio local) em que o servidor joga sozinho; só no online */
  fimEm?: number | null
  agir: (a: AcaoUI) => void
  /** botão do fim da partida; null = quem decide é outra pessoa (mostra `esperaNova`) */
  onNova: (() => void) | null
  esperaNova?: string
  onSair: () => void
  rotuloSair?: string
  extra?: ReactNode
}

export function TelaPartida({ visao: e, eu, fimEm, agir, onNova, esperaNova, onSair, rotuloSair = '← Sair', extra }: Props) {
  const [resumoFechado, setResumoFechado] = useState(false)
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [festa, setFesta] = useState(false)
  const [som, setSom] = useState(somLigado)
  const [girandoSeq, setGirandoSeq] = useState<number | null>(null)
  const contadorAviso = useRef(0)
  const anterior = useRef(e)

  // sons, avisos, roleta girando e vibração a cada mudança de estado, venha ela de um bot local ou do servidor
  useEffect(() => {
    const antes = anterior.current
    anterior.current = e
    if (antes === e) return
    const sons = sonsDe(antes, e, eu)
    if (sons.length > 0) tocar(sons)
    if (e.seq === antes.seq) return
    if (e.eventos.some((x) => x.tipo === 'giro')) {
      // oxlint-disable-next-line react/set-state-in-effect -- reação a um evento externo (jogada), não dá para derivar na renderização
      setGirandoSeq(e.seq)
      setTimeout(() => setGirandoSeq((s) => (s === e.seq ? null : s)), MS_GIRO)
    }
    if (e.eventos.some((x) => (x.tipo === 'ficha' || x.tipo === 'acerto') && x.jogador === eu)) {
      setFesta(true)
      setTimeout(() => setFesta(false), 2400)
    }
    const novos = avisosDe(e, eu, () => ++contadorAviso.current)
    setAvisos((atual) => [...atual, ...novos].slice(-3))
    for (const n of novos) setTimeout(() => setAvisos((atual) => atual.filter((x) => x.id !== n.id)), n.ms)
    if (e.eventos.some((x) => 'jogador' in x && x.jogador === eu && (x.tipo === 'ficha' || x.tipo === 'acerto')) && typeof navigator.vibrate === 'function') {
      navigator.vibrate(70)
    }
  }, [e, eu])

  const jogador = e.jogadores[e.vez]
  const minhaVez = e.vez === eu && e.vencedor === null
  const nomeVez = e.vez === eu ? 'Você' : jogador.nome
  const girando = girandoSeq !== null && e.giro !== null
  const p = e.pergunta
  const euNoDuelo = e.duelo !== null && (e.duelo.desafiante === eu || e.duelo.alvo === eu)
  const livres = categoriasLivres(e)
  const desafios = e.fase === 'categoria' && minhaVez ? desafiosPossiveis(e, e.vez) : []
  const res = e.fase === 'resultado' || e.fase === 'fim' ? textoResultado(e, eu) : null
  const venci = e.vencedor === eu
  // só mostra a contagem quando o servidor espera uma pessoa (a vez de um bot dura segundos)
  const esperando = e.fase === 'duelo' && e.duelo ? [e.duelo.desafiante, e.duelo.alvo].filter((i) => !e.duelo!.respondeu.includes(i)) : [e.vez]
  const esperaHumano = e.vencedor === null && e.fase !== 'fim' && (e.fase === 'resultado' || esperando.some((i) => !e.jogadores[i].bot))

  return (
    <main className="jogo pg-jogo">
      <header className="barra">
        <button className="voltar" onClick={onSair}>{rotuloSair}</button>
        <span className="adv-rodada">{e.vencedor === null ? `Vez de ${nomeVez}` : 'Fim de jogo'}</span>
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
      </header>

      <ul className="pg-placar" aria-label="Placar">
        {e.jogadores.map((j, i) => (
          <li key={j.id} className={(e.vez === i && e.vencedor === null ? 'vez' : '') + (i === eu ? ' eu' : '')}>
            <span className="adv-ponto" style={{ background: j.cor }} />
            <span className="pg-nome">{i === eu ? 'Você' : j.nome}{j.bot ? ' 🤖' : ''}</span>
            <Trilha posicao={j.trilha} />
            <Fichas fichas={j.fichas} />
          </li>
        ))}
      </ul>
      <small className="pg-meta">Vence quem reunir {e.fichasParaVencer} fichas</small>

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

      {fimEm != null && esperaHumano && <Contagem key={fimEm} fimEm={fimEm} fase={e.fase} />}

      <section className="pg-painel" aria-live="polite">
        <Mascote className="adv-mascote" pose={festa ? 'comemorando' : 'detetive'} tamanho={60} />

        {girando && (
          <div className="pg-centro">
            <Roleta key={girandoSeq} resultado={e.giro} />
            <p className="adv-espera">Girando…</p>
          </div>
        )}

        {!girando && e.fase === 'girar' && (
          <div className="pg-centro">
            <Roleta resultado={null} />
            {minhaVez ? (
              <button className="primario" onClick={() => agir({ tipo: 'girar' })}>Girar a roleta</button>
            ) : (
              <p className="adv-espera">{jogador.nome} vai girar…</p>
            )}
          </div>
        )}

        {!girando && e.fase === 'categoria' && (
          <div className="pg-centro">
            <h2>
              {minhaVez
                ? e.valorPendente === 'ficha-trilha'
                  ? 'Você está na Coroa! Escolha a categoria da ficha'
                  : 'Coroa! Escolha a categoria da ficha'
                : `${jogador.nome} está escolhendo a categoria…`}
            </h2>
            {minhaVez && (
              <>
                <div className="pg-categorias">
                  {CATEGORIAS.map((c) => {
                    const tem = !livres.includes(c.id)
                    return (
                      <button
                        key={c.id}
                        className="pg-cat"
                        style={{ ['--cor' as string]: c.cor }}
                        disabled={tem}
                        onClick={() => agir({ tipo: 'escolherCategoria', categoria: c.id })}
                      >
                        <span>{c.emoji}</span>
                        {c.nome}
                        {tem && <small>já tem</small>}
                      </button>
                    )
                  })}
                </div>
                {desafios.length > 0 && (
                  <div className="pg-desafios">
                    <h3>Ou desafie alguém para um duelo</h3>
                    {desafios.map((d) => (
                      <button
                        key={`${d.alvo}${d.aposta}${d.premio}`}
                        className="secundario"
                        onClick={() => agir({ tipo: 'desafiar', alvo: d.alvo, aposta: d.aposta, premio: d.premio })}
                      >
                        ⚔️ {e.jogadores[d.alvo].nome}: levo {cat(d.premio).emoji} {cat(d.premio).nome}, arrisco {cat(d.aposta).emoji} {cat(d.aposta).nome}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!girando && e.fase === 'responder' && p && (
          <>
            {!minhaVez && <p className="adv-espera">{jogador.nome} está respondendo…</p>}
            <CartaPergunta p={p} jogando={minhaVez} onResponder={(opcao) => agir({ tipo: 'responder', opcao })} />
          </>
        )}

        {e.fase === 'duelo' && p && e.duelo && (
          <>
            <h2>⚔️ Duelo: {e.duelo.desafiante === eu ? 'Você' : e.jogadores[e.duelo.desafiante].nome} x {e.duelo.alvo === eu ? 'Você' : e.jogadores[e.duelo.alvo].nome}</h2>
            <p className="pg-meta">Quem acertar primeiro leva a ficha de {cat(e.duelo.premio).emoji} {cat(e.duelo.premio).nome}.</p>
            <CartaPergunta
              p={p}
              jogando={euNoDuelo && e.duelo.minhaResposta === null}
              minhaResposta={e.duelo.minhaResposta}
              onResponder={(opcao) => agir({ tipo: 'responder', opcao })}
            />
            {euNoDuelo && e.duelo.minhaResposta !== null && <p className="adv-espera">Resposta enviada. Aguardando o outro duelista…</p>}
            {!euNoDuelo && <p className="adv-espera">Os duelistas estão respondendo…</p>}
          </>
        )}

        {(e.fase === 'resultado' || e.fase === 'fim') && p && (
          <>
            <CartaPergunta p={p} jogando={false} onResponder={() => {}} />
            {res && (
              <p className={'adv-resultado ' + (res.tom === 'ok' ? 'ok' : '')}>
                <span aria-hidden="true">{res.icone}</span> {res.texto}
              </p>
            )}
            {e.fase === 'resultado' && minhaVez && (
              <div className="pg-acoes">
                {podeEspecial(e, eu, 'tiroExtra') && (
                  <button className="secundario" onClick={() => agir({ tipo: 'usarEspecial', especial: 'tiroExtra' })}>
                    🎡 Tiro extra: jogar de novo
                  </button>
                )}
                <button className="primario" onClick={() => agir({ tipo: 'seguir' })}>Continuar</button>
              </div>
            )}
          </>
        )}
      </section>

      {eu >= 0 && (
        <section className="pg-curingas" aria-label="Seus curingas">
          {ESPECIAIS.map((esp) => (
            <button
              key={esp}
              className="pg-curinga"
              disabled={!podeEspecial(e, eu, esp)}
              onClick={() => agir({ tipo: 'usarEspecial', especial: esp })}
              title={TEXTO_ESPECIAL[esp]}
            >
              <span aria-hidden="true">{ICONE_ESPECIAL[esp]}</span>
              {TEXTO_ESPECIAL[esp]}
              <small>×{e.jogadores[eu].especiais[esp]}</small>
            </button>
          ))}
        </section>
      )}

      <section className="adv-historico">
        <h3>Últimas jogadas</h3>
        <ul>
          {[...e.historico].reverse().slice(0, 4).map((h, i) => (
            <li key={`${e.historico.length - i}`}>{h}</li>
          ))}
          {e.historico.length === 0 && <li>A partida começou. Boa sorte!</li>}
        </ul>
      </section>

      {e.vencedor !== null && !resumoFechado && (
        <div className="vitoria-fundo" role="dialog" aria-modal="true" aria-label="Fim da partida">
          <div className="vitoria-tela">
            <Mascote pose={venci ? 'comemorando' : 'detetive'} tamanho={150} />
            <h2>{venci ? 'Você venceu!' : `${e.jogadores[e.vencedor].nome} venceu!`}</h2>
            <p>{venci ? 'Mandou bem nas perguntas.' : 'Boa partida!'}</p>
            <ul className="adv-final">
              {e.jogadores
                .map((j, i) => ({ nome: i === eu ? 'Você' : j.nome, fichas: j.fichas, cor: j.cor }))
                .sort((a, b) => b.fichas.length - a.fichas.length)
                .map((j) => (
                  <li key={j.nome}>
                    <span className="adv-ponto" style={{ background: j.cor }} />
                    {j.nome} <Fichas fichas={j.fichas} />
                  </li>
                ))}
            </ul>
            {onNova ? <button className="primario" onClick={onNova}>Jogar de novo</button> : <p className="adv-espera">{esperaNova}</p>}
            <button className="secundario" onClick={() => setResumoFechado(true)}>Ver placar</button>
            <button className="voltar" onClick={onSair}>Sair</button>
          </div>
        </div>
      )}

      {e.vencedor !== null && resumoFechado && (
        <div className="adv-fimbarra">
          <strong>{venci ? 'Você venceu!' : `${e.jogadores[e.vencedor].nome} venceu!`}</strong>
          {onNova ? <button className="primario" onClick={onNova}>Jogar de novo</button> : <span className="adv-espera">{esperaNova}</span>}
        </div>
      )}
      {extra}
    </main>
  )
}

function Contagem({ fimEm, fase }: { fimEm: number; fase: string }) {
  const [agora, setAgora] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 500)
    return () => clearInterval(t)
  }, [])
  const s = Math.max(0, Math.ceil((fimEm - agora) / 1000))
  return (
    <p className={'adv-contagem' + (s <= 8 ? ' urgente' : '')} role="timer">
      {fase === 'resultado' ? `Continua sozinho em ${s}s` : `⏳ ${s}s`}
    </p>
  )
}
