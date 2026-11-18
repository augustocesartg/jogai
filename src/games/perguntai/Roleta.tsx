import { CATEGORIAS, type Categoria } from './types'

type Lado = Categoria | 'coroa'
const LADOS: Lado[] = [...CATEGORIAS.map((c) => c.id), 'coroa']
const PASSO = 360 / LADOS.length

const rotulo = (l: Lado) => (l === 'coroa' ? '👑' : CATEGORIAS.find((c) => c.id === l)!.emoji)
const cor = (l: Lado) => (l === 'coroa' ? '#FBBF24' : CATEGORIAS.find((c) => c.id === l)!.cor)

function ponto(raio: number, graus: number): [number, number] {
  const rad = ((graus - 90) * Math.PI) / 180
  return [100 + raio * Math.cos(rad), 100 + raio * Math.sin(rad)]
}

interface Props {
  /** resultado do giro; null = roleta parada */
  resultado: Lado | null
  tamanho?: number
}

/** Roleta de 7 lados. Cada giro precisa de uma `key` nova (o pai usa o `seq`) para repetir a animação. */
export function Roleta({ resultado, tamanho = 220 }: Props) {
  // o centro do lado sorteado termina sob o ponteiro, no alto
  const alvo = resultado === null ? 0 : 360 * 4 + (360 - (LADOS.indexOf(resultado) * PASSO + PASSO / 2))
  return (
    <div className="pg-roleta" style={{ width: tamanho, height: tamanho }}>
      <span className="pg-ponteiro" aria-hidden="true" />
      <svg
        viewBox="0 0 200 200"
        className={resultado === null ? '' : 'pg-roleta-gira'}
        style={{ ['--alvo' as string]: `${alvo}deg` }}
        role="img"
        aria-label="Roleta de categorias"
      >
        {LADOS.map((l, i) => {
          const [x1, y1] = ponto(96, i * PASSO)
          const [x2, y2] = ponto(96, (i + 1) * PASSO)
          const [tx, ty] = ponto(66, i * PASSO + PASSO / 2)
          return (
            <g key={l}>
              <path d={`M100 100 L${x1} ${y1} A96 96 0 0 1 ${x2} ${y2} Z`} fill={cor(l)} stroke="#fff" strokeWidth="2" />
              <text x={tx} y={ty} fontSize="22" textAnchor="middle" dominantBaseline="central">{rotulo(l)}</text>
            </g>
          )
        })}
        <circle cx="100" cy="100" r="14" fill="#fff" stroke="#1f2430" strokeWidth="3" />
      </svg>
    </div>
  )
}
