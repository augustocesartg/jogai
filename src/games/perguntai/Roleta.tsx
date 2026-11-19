import { CATEGORIAS, type Categoria } from './types'

type Lado = Categoria | 'coroa'
const LADOS: Lado[] = [...CATEGORIAS.map((c) => c.id), 'coroa']
const PASSO = 360 / LADOS.length

const rotulo = (l: Lado) => (l === 'coroa' ? '👑' : CATEGORIAS.find((c) => c.id === l)!.emoji)
const COR_LADO: Record<Lado, string> = {
  ciencia: '#4FD8A6', arte: '#FF7AB6', esporte: '#FF9A4D', entretenimento: '#8B7BFF', geografia: '#5AA9FF', historia: '#E0A21B', coroa: '#FFC83D',
}
const cor = (l: Lado) => COR_LADO[l]

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
      <svg className="pg-ponteiro" viewBox="0 0 28 34" aria-hidden="true">
        <path d="M3 3 H25 L14 31 Z" fill="#FF5A5F" stroke="#1B1340" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <svg
        viewBox="0 0 200 200"
        className={resultado === null ? '' : 'pg-roleta-gira'}
        style={{ ['--alvo' as string]: `${alvo}deg` }}
        role="img"
        aria-label="Roleta de categorias"
      >
        <circle cx="100" cy="100" r="99" fill="#1B1340" />
        {LADOS.map((l, i) => {
          const [x1, y1] = ponto(94, i * PASSO)
          const [x2, y2] = ponto(94, (i + 1) * PASSO)
          const [tx, ty] = ponto(62, i * PASSO + PASSO / 2)
          return (
            <g key={l}>
              <path d={`M100 100 L${x1} ${y1} A94 94 0 0 1 ${x2} ${y2} Z`} fill={cor(l)} stroke="#1B1340" strokeWidth="3" strokeLinejoin="round" />
              <text x={tx} y={ty} fontSize="22" textAnchor="middle" dominantBaseline="central">{rotulo(l)}</text>
            </g>
          )
        })}
        <circle cx="100" cy="100" r="15" fill="#fff" stroke="#1B1340" strokeWidth="3.5" />
      </svg>
    </div>
  )
}
