import { useEffect, useMemo, useRef, useState } from 'react'
import { Mascote } from '../../components/Mascote'
import { normalizar } from './normalizar'
import { registrarAcerto } from './progresso'
import type { Colocada, Direcao, Tabuleiro } from './types'

interface Props {
  tabuleiro: Tabuleiro
  onNovo: () => void
  onConfig: () => void
}

const SENTINELA = '·'
const chave = (l: number, c: number) => `${l},${c}`

function celulasDe(p: Colocada): [number, number][] {
  return Array.from({ length: p.palavra.chave.length }, (_, i) => [
    p.linha + (p.direcao === 'V' ? i : 0),
    p.coluna + (p.direcao === 'H' ? i : 0),
  ])
}

export function Jogo({ tabuleiro, onNovo, onConfig }: Props) {
  const { tamanho, palavras } = tabuleiro
  const [letras, setLetras] = useState<Record<string, string>>({})
  const [sel, setSelState] = useState<{ l: number; c: number; d: Direcao }>(() => {
    const p = palavras[0]
    return { l: p.linha, c: p.coluna, d: p.direcao }
  })
  // espelho síncrono: vários eventos de digitação podem chegar antes do re-render
  const selRef = useRef(sel)
  const setSel = (n: { l: number; c: number; d: Direcao }) => {
    selRef.current = n
    setSelState(n)
  }
  const inputRef = useRef<HTMLInputElement>(null)

  const palavraEm = (l: number, c: number, d: Direcao) =>
    palavras.find((p) => p.direcao === d && celulasDe(p).some(([a, b]) => a === l && b === c))

  const mapa = useMemo(() => {
    const m = new Map<string, { letra: string; numero?: number }>()
    for (const p of palavras) {
      celulasDe(p).forEach(([l, c], i) => {
        const atual = m.get(chave(l, c))
        m.set(chave(l, c), {
          letra: p.palavra.chave[i],
          numero: i === 0 ? p.numero : atual?.numero,
        })
      })
    }
    return m
  }, [palavras])

  const resolvidas = useMemo(() => {
    const s = new Set<Colocada>()
    for (const p of palavras) {
      if (celulasDe(p).every(([l, c], i) => letras[chave(l, c)] === p.palavra.chave[i])) s.add(p)
    }
    return s
  }, [palavras, letras])

  const travadas = useMemo(() => {
    const s = new Set<string>()
    resolvidas.forEach((p) => celulasDe(p).forEach(([l, c]) => s.add(chave(l, c))))
    return s
  }, [resolvidas])

  const ativa = palavraEm(sel.l, sel.c, sel.d)
  const celulasAtiva = new Set(ativa ? celulasDe(ativa).map(([l, c]) => chave(l, c)) : [])
  const venceu = resolvidas.size === palavras.length

  const [festa, setFesta] = useState(false)
  const anteriores = useRef(0)
  useEffect(() => {
    const novas = resolvidas.size - anteriores.current
    anteriores.current = resolvidas.size
    if (novas <= 0) return
    for (let i = 0; i < novas; i++) registrarAcerto()
    setFesta(true)
    const t = setTimeout(() => setFesta(false), 1800)
    return () => clearTimeout(t)
  }, [resolvidas])

  function selecionar(l: number, c: number) {
    if (!mapa.has(chave(l, c))) return
    let d = sel.d
    if (sel.l === l && sel.c === c) {
      const outra: Direcao = d === 'H' ? 'V' : 'H'
      if (palavraEm(l, c, outra)) d = outra
    } else if (!palavraEm(l, c, d)) {
      d = d === 'H' ? 'V' : 'H'
    }
    setSel({ l, c, d })
    inputRef.current?.focus()
  }

  function selecionarPalavra(p: Colocada) {
    const livre = celulasDe(p).find(([l, c]) => !letras[chave(l, c)]) ?? [p.linha, p.coluna]
    setSel({ l: livre[0], c: livre[1], d: p.direcao })
    inputRef.current?.focus()
  }

  function mover(delta: number) {
    const atual = selRef.current
    const p = palavraEm(atual.l, atual.c, atual.d)
    if (!p) return
    const cels = celulasDe(p)
    const i = cels.findIndex(([l, c]) => l === atual.l && c === atual.c)
    const prox = cels[Math.max(0, Math.min(cels.length - 1, i + delta))]
    setSel({ l: prox[0], c: prox[1], d: atual.d })
  }

  function digitar(ch: string) {
    const atual = selRef.current
    const k = chave(atual.l, atual.c)
    if (!travadas.has(k)) setLetras((x) => ({ ...x, [k]: ch }))
    mover(1)
  }

  function apagar() {
    const atual = selRef.current
    const k = chave(atual.l, atual.c)
    if (letras[k] && !travadas.has(k)) {
      setLetras((x) => {
        const { [k]: _, ...resto } = x
        return resto
      })
    } else {
      mover(-1)
    }
  }

  function aoMudar(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    if (v === '') return apagar()
    for (const ch of normalizar(v.replace(SENTINELA, ''))) digitar(ch)
  }

  function aoTecla(e: React.KeyboardEvent) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      apagar()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') mover(1)
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') mover(-1)
  }

  function revelar() {
    const k = chave(sel.l, sel.c)
    const certa = mapa.get(k)?.letra
    if (certa && !travadas.has(k)) setLetras((x) => ({ ...x, [k]: certa }))
  }

  const lista = (d: Direcao) =>
    palavras.filter((p) => p.direcao === d).sort((a, b) => a.numero - b.numero)

  return (
    <main className="jogo">
      <header className="barra">
        <button className="voltar" onClick={onConfig}>← Matérias</button>
        <span className="placar">
          {resolvidas.size}/{palavras.length}
          <Mascote pose={festa || venceu ? 'comemorando' : 'boas-vindas'} tamanho={44} className="mascote-mini" />
        </span>
      </header>

      <div className="dica-ativa" aria-live="polite">
        {ativa ? (
          <>
            <strong>{ativa.numero}{ativa.direcao === 'H' ? '→' : '↓'}</strong> {ativa.palavra.dica}
            <small> ({ativa.palavra.chave.length} letras)</small>
          </>
        ) : (
          'Toque em uma casa'
        )}
      </div>

      <div
        className="grade"
        style={{ gridTemplateColumns: `repeat(${tamanho}, 1fr)` }}
        role="grid"
      >
        {Array.from({ length: tamanho * tamanho }, (_, i) => {
          const l = Math.floor(i / tamanho)
          const c = i % tamanho
          const k = chave(l, c)
          const info = mapa.get(k)
          if (!info) return <div key={k} className="vazia" />
          const cls = [
            'casa',
            celulasAtiva.has(k) ? 'na-palavra' : '',
            sel.l === l && sel.c === c ? 'foco' : '',
            travadas.has(k) ? 'certa' : '',
          ].join(' ')
          return (
            <button key={k} className={cls} onClick={() => selecionar(l, c)} aria-label={`linha ${l + 1} coluna ${c + 1}`}>
              {info.numero && <span className="num">{info.numero}</span>}
              <span className="letra">{letras[k] ?? ''}</span>
            </button>
          )
        })}
      </div>

      <input
        ref={inputRef}
        className="entrada-oculta"
        value={SENTINELA}
        onChange={aoMudar}
        onKeyDown={aoTecla}
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label="Digite a letra"
      />

      <div className="acoes">
        <button onClick={revelar}>💡 Revelar letra</button>
        <button onClick={onNovo}>🔄 Novo jogo</button>
      </div>

      {venceu && (
        <div className="vitoria" role="status">
          <Mascote pose="comemorando" tamanho={130} />
          Parabéns! Você completou a cruzadinha.
          <button className="primario" onClick={onNovo}>Jogar de novo</button>
        </div>
      )}

      <section className="dicas">
        {(['H', 'V'] as Direcao[]).map((d) => (
          <div key={d}>
            <h2>{d === 'H' ? 'Horizontais →' : 'Verticais ↓'}</h2>
            <ol>
              {lista(d).map((p) => (
                <li key={p.palavra.id + d} className={resolvidas.has(p) ? 'ok' : ''}>
                  <button onClick={() => selecionarPalavra(p)}>
                    <b>{p.numero}</b> {resolvidas.has(p) ? `✓ ${p.palavra.resposta}` : p.palavra.dica}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </section>
    </main>
  )
}
