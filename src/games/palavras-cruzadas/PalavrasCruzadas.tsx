import { useState } from 'react'
import { Mascote } from '../../components/Mascote'
import { BANCO } from './banco'
import { Jogo } from './Jogo'
import { gerarTabuleiro } from './gerador'
import { gravarMaterias, gravarVistas, lerMaterias, lerVistas } from './progresso'
import { MATERIAS, type Materia, type Tabuleiro } from './types'

const TODAS = MATERIAS.map((m) => m.id)

export function PalavrasCruzadas({ onSair }: { onSair: () => void }) {
  const [materias, setMaterias] = useState<Materia[]>(() => {
    const salvas = lerMaterias(TODAS).filter((m) => TODAS.includes(m))
    return salvas.length ? salvas : TODAS
  })
  const [tabuleiro, setTabuleiro] = useState<Tabuleiro | null>(null)
  const [rodada, setRodada] = useState(0)

  function alternar(m: Materia) {
    setMaterias((atual) => {
      const novo = atual.includes(m) ? atual.filter((x) => x !== m) : [...atual, m]
      if (novo.length === 0) return atual
      gravarMaterias(novo)
      return novo
    })
  }

  function iniciar() {
    const pool = materias.flatMap((m) => BANCO[m])
    let vistas = lerVistas()
    const naoVistas = pool.filter((p) => !vistas.has(p.id))
    if (naoVistas.length < 40) {
      // ciclo reinicia para estas matérias
      const ids = new Set(pool.map((p) => p.id))
      vistas = new Set([...vistas].filter((id) => !ids.has(id)))
    }
    const t = gerarTabuleiro(pool, vistas, { tamanho: 11, alvo: 10 })
    t.palavras.forEach((c) => vistas.add(c.palavra.id))
    gravarVistas(vistas)
    setTabuleiro(t)
    setRodada((r) => r + 1)
  }

  if (tabuleiro) {
    return (
      <Jogo
        key={rodada}
        tabuleiro={tabuleiro}
        onNovo={iniciar}
        onConfig={() => setTabuleiro(null)}
      />
    )
  }

  return (
    <main className="config">
      <button className="voltar" onClick={onSair}>← Jogos</button>
      <div className="config-topo">
        <Mascote pose="escritor" tamanho={120} />
        <div>
          <h1>Palavras Cruzadas</h1>
          <p className="sub">Escolha as matérias</p>
        </div>
      </div>
      <div className="chips">
        {MATERIAS.map((m) => (
          <button
            key={m.id}
            className={'chip' + (materias.includes(m.id) ? ' ativo' : '')}
            onClick={() => alternar(m.id)}
            aria-pressed={materias.includes(m.id)}
          >
            {m.emoji} {m.nome}
          </button>
        ))}
      </div>
      <button className="primario" onClick={iniciar}>Jogar</button>
    </main>
  )
}
