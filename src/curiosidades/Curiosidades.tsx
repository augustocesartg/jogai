import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Curiosidade } from './banco'
import { chaveDoDia, curiosidadeDoDia, dataCurta } from './dia'
import { linkChatGPT } from './ia'
import { buscarNesteDia, indiceDoDestaque, type FatoDoDia } from './nesteDia'

function Janela({ onFechar, children }: { onFechar: () => void; children: ReactNode }) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onFechar()
    addEventListener('keydown', tecla)
    return () => removeEventListener('keydown', tecla)
  }, [onFechar])

  return (
    <div className="janela-fundo" onClick={onFechar}>
      <div className="janela" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="janela-alca" aria-hidden="true" />
        {children}
        <button className="janela-fechar" onClick={onFechar}>Fechar</button>
      </div>
    </div>
  )
}

function SaberMais({ assunto }: { assunto: string }) {
  return (
    <a className="janela-ia" href={linkChatGPT(assunto)} target="_blank" rel="noopener noreferrer">
      Saber mais no ChatGPT ↗
    </a>
  )
}

export function Curiosidades() {
  const dia = useMemo(() => chaveDoDia(), [])
  const [curiosidade, setCuriosidade] = useState<Curiosidade | null>(null)
  const [fatos, setFatos] = useState<FatoDoDia[] | null>(null)
  const [aberta, setAberta] = useState<'curiosidade' | 'neste-dia' | null>(null)
  const [escolhido, setEscolhido] = useState(0)

  // o banco (centenas de textos) é um pedaço à parte, para a home abrir leve
  useEffect(() => {
    let vivo = true
    import('./banco').then((m) => vivo && setCuriosidade(curiosidadeDoDia(dia, m.CURIOSIDADES)))
    buscarNesteDia(dia).then((f) => {
      if (!vivo || !f) return
      setFatos(f)
      setEscolhido(indiceDoDestaque(dia, f.length))
    })
    return () => {
      vivo = false
    }
  }, [dia])

  const fato = fatos?.[escolhido]
  const fechar = () => setAberta(null)

  return (
    <>
      <section className="curiosidades" aria-label="Curiosidades">
        {curiosidade && (
          <button className="cartao-curio curiosidade" onClick={() => setAberta('curiosidade')}>
            <span className="curio-linha">
              <span className="curio-rotulo">Curiosidade do dia</span>
              <span className="curio-tag">{curiosidade.categoria}</span>
            </span>
            <strong>{curiosidade.titulo}</strong>
            <small>{curiosidade.resumo}</small>
          </button>
        )}

        {fato && (
          <button className="cartao-curio neste-dia" onClick={() => setAberta('neste-dia')}>
            <span className="curio-linha">
              <span className="curio-rotulo">Neste dia · {dataCurta(dia)}</span>
              <span className="curio-tag rosa">{fato.ano}</span>
            </span>
            <small>{fato.texto}</small>
          </button>
        )}
      </section>

      {aberta === 'curiosidade' && curiosidade && (
        <Janela onFechar={fechar}>
          <span className="curio-tag">{curiosidade.categoria}</span>
          <h2>{curiosidade.titulo}</h2>
          <p>{curiosidade.texto}</p>
          <p className="janela-fonte">Fonte: {curiosidade.fonte}</p>
          <SaberMais assunto={`${curiosidade.titulo}. ${curiosidade.resumo}`} />
        </Janela>
      )}

      {aberta === 'neste-dia' && fato && fatos && (
        <Janela onFechar={fechar}>
          <span className="curio-tag rosa">{fato.ano}</span>
          <h2>Neste dia, {dataCurta(dia)}</h2>
          {fato.artigo?.imagem && <img className="janela-imagem" src={fato.artigo.imagem} alt="" />}
          <p>{fato.texto}</p>
          {fato.artigo?.resumo && <p className="janela-resumo">{fato.artigo.resumo}</p>}
          <p className="janela-fonte">
            Fonte: Wikipédia
            {fato.artigo && (
              <>
                {' · '}
                <a href={fato.artigo.url} target="_blank" rel="noopener noreferrer">{fato.artigo.titulo}</a>
              </>
            )}
          </p>
          <SaberMais assunto={`${fato.texto} (${fato.ano})`} />
          {fatos.length > 1 && (
            <div className="janela-outros">
              <p className="janela-fonte">Outros fatos deste dia</p>
              {fatos.map((f, i) =>
                i === escolhido ? null : (
                  <button key={i} className="janela-outro" onClick={() => setEscolhido(i)}>
                    <b>{f.ano}</b> {f.texto}
                  </button>
                ),
              )}
            </div>
          )}
        </Janela>
      )}
    </>
  )
}
