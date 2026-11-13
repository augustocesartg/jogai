import { CASAS } from './types'

export interface Peao {
  id: string
  rotulo: string
  cor: string
  pos: number
  nome: string
}

function PeaoMarca({ p }: { p: Peao }) {
  return (
    <span className="adv-peao" style={{ background: p.cor }} title={`${p.nome}: casa ${p.pos}`}>
      {p.rotulo}
    </span>
  )
}

export function Tabuleiro({ peoes }: { peoes: Peao[] }) {
  const porCasa = (n: number) => peoes.filter((p) => Math.min(p.pos, CASAS) === n)

  return (
    <div className="adv-tab" role="img" aria-label={peoes.map((p) => `${p.nome} na casa ${p.pos}`).join(', ')}>
      <div className="adv-inicio">
        <span>Início</span>
        {porCasa(0).map((p) => (
          <PeaoMarca key={p.id} p={p} />
        ))}
      </div>
      <div className="adv-casas">
        {Array.from({ length: CASAS }, (_, i) => i + 1).map((n) => (
          <div key={n} className={'adv-casa' + (n === CASAS ? ' meta' : '') + (n % 5 === 0 ? ' marco' : '')}>
            <span className="adv-num">{n === CASAS ? '🏁' : n}</span>
            <div className="adv-peoes">
              {porCasa(n).map((p) => (
                <PeaoMarca key={p.id} p={p} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
