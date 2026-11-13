export type Pose = 'boas-vindas' | 'escritor' | 'comemorando' | 'detetive'

interface Props {
  pose?: Pose
  tamanho?: number
  className?: string
}

const ROTULO: Record<Pose, string> = {
  'boas-vindas': 'Mascote do Jogaí acenando',
  escritor: 'Mascote do Jogaí com um lápis',
  comemorando: 'Mascote do Jogaí comemorando',
  detetive: 'Mascote do Jogaí vestido de detetive, com uma lupa',
}

const VIEWBOX: Record<Pose, string> = {
  'boas-vindas': '20 54 200 164',
  escritor: '255 56 190 176',
  comemorando: '465 28 190 200',
  detetive: '24 34 230 184',
}

const J = {
  fill: 'none',
  stroke: '#4F46E5',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function BoasVindas() {
  return (
    <>
      <ellipse cx="120" cy="214" rx="50" ry="7" fill="#9CA3AF" opacity="0.35" />
      <rect x="88" y="190" width="20" height="16" rx="7" fill="#3730A3" />
      <rect x="132" y="190" width="20" height="16" rx="7" fill="#3730A3" />
      <path d="M65 130 Q40 128 36 100" fill="none" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" />
      <path d="M175 130 Q200 128 204 100" fill="none" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" />
      <circle cx="36" cy="97" r="8" fill="#4F46E5" />
      <circle cx="204" cy="97" r="8" fill="#4F46E5" />
      <rect x="65" y="86" width="110" height="110" rx="26" fill="#3730A3" />
      <rect x="65" y="80" width="110" height="110" rx="26" fill="#4F46E5" />
      <circle cx="97" cy="124" r="15" fill="#FFFFFF" />
      <circle cx="143" cy="124" r="15" fill="#FFFFFF" />
      <circle cx="99" cy="126" r="7.5" fill="#1F2430" />
      <circle cx="145" cy="126" r="7.5" fill="#1F2430" />
      <circle cx="102" cy="122" r="2.6" fill="#FFFFFF" />
      <circle cx="148" cy="122" r="2.6" fill="#FFFFFF" />
      <circle cx="80" cy="152" r="6.5" fill="#F9A8D4" />
      <circle cx="160" cy="152" r="6.5" fill="#F9A8D4" />
      <path d="M100 150 Q120 178 140 150 Z" fill="#1F2430" />
      <path d="M110 163 Q120 171 130 163 Q120 157 110 163 Z" fill="#F472B6" />
      <g transform="rotate(12 160 78)">
        <rect x="146" y="64" width="28" height="28" rx="7" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M153 72 H167 M160 72 V84 Q160 88 156 88 Q153 88 152 85" strokeWidth="4.5" {...J} />
      </g>
    </>
  )
}

function Escritor() {
  return (
    <>
      <ellipse cx="340" cy="222" rx="50" ry="7" fill="#9CA3AF" opacity="0.35" />
      <rect x="308" y="206" width="20" height="16" rx="7" fill="#3730A3" />
      <rect x="352" y="206" width="20" height="16" rx="7" fill="#3730A3" />
      <path d="M285 152 Q268 162 270 180" fill="none" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" />
      <circle cx="270" cy="182" r="8" fill="#4F46E5" />
      <rect x="285" y="104" width="110" height="110" rx="26" fill="#3730A3" />
      <rect x="285" y="98" width="110" height="110" rx="26" fill="#4F46E5" />
      <rect x="290" y="64" width="30" height="30" rx="7" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="3" />
      <rect x="325" y="64" width="30" height="30" rx="7" fill="#FBBF24" stroke="#4F46E5" strokeWidth="3" />
      <rect x="360" y="64" width="30" height="30" rx="7" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="3" />
      <path d="M333 72 H347 M340 72 V84 Q340 88 336 88 Q333 88 332 85" strokeWidth="4.5" {...J} />
      <circle cx="318" cy="142" r="14" fill="#FFFFFF" />
      <circle cx="362" cy="142" r="14" fill="#FFFFFF" />
      <circle cx="321" cy="139" r="7" fill="#1F2430" />
      <circle cx="365" cy="139" r="7" fill="#1F2430" />
      <circle cx="323" cy="136" r="2.4" fill="#FFFFFF" />
      <circle cx="367" cy="136" r="2.4" fill="#FFFFFF" />
      <circle cx="302" cy="168" r="6" fill="#F9A8D4" />
      <circle cx="378" cy="168" r="6" fill="#F9A8D4" />
      <path d="M322 172 Q340 188 358 172" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M395 152 Q412 148 416 130" fill="none" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" />
      <g transform="rotate(20 416 128)">
        <rect x="410" y="92" width="12" height="44" fill="#FBBF24" />
        <polygon points="410,92 422,92 416,80" fill="#FCD9A8" />
        <polygon points="413.5,84 418.5,84 416,80" fill="#374151" />
        <rect x="410" y="134" width="12" height="9" rx="3" fill="#F472B6" />
      </g>
      <circle cx="416" cy="128" r="8" fill="#4F46E5" />
    </>
  )
}

function Comemorando() {
  return (
    <>
      <rect x="490" y="56" width="8" height="8" fill="#FBBF24" transform="rotate(20 494 60)" />
      <circle cx="526" cy="52" r="4" fill="#F472B6" />
      <rect x="590" y="50" width="8" height="8" fill="#34D399" transform="rotate(-25 594 54)" />
      <circle cx="632" cy="68" r="4.5" fill="#60A5FA" />
      <polygon points="478,176 486,176 482,168" fill="#F472B6" />
      <circle cx="646" cy="176" r="4" fill="#FBBF24" />
      <rect x="548" y="36" width="7" height="7" fill="#60A5FA" transform="rotate(35 551 40)" />
      <polygon points="612,40 620,40 616,32" fill="#FBBF24" />
      <ellipse cx="560" cy="222" rx="50" ry="7" fill="#9CA3AF" opacity="0.35" />
      <g transform="rotate(-6 560 150)">
        <rect x="528" y="190" width="20" height="16" rx="7" fill="#3730A3" />
        <rect x="572" y="190" width="20" height="16" rx="7" fill="#3730A3" />
        <path d="M505 138 Q480 128 478 100" fill="none" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" />
        <path d="M615 138 Q640 128 642 100" fill="none" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" />
        <circle cx="478" cy="97" r="8" fill="#4F46E5" />
        <circle cx="642" cy="97" r="8" fill="#4F46E5" />
        <rect x="505" y="96" width="110" height="110" rx="26" fill="#3730A3" />
        <rect x="505" y="90" width="110" height="110" rx="26" fill="#4F46E5" />
        <path d="M528 132 Q538 116 548 132" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        <path d="M572 132 Q582 116 592 132" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
        <circle cx="526" cy="152" r="6.5" fill="#F9A8D4" />
        <circle cx="594" cy="152" r="6.5" fill="#F9A8D4" />
        <path d="M530 150 Q560 196 590 150 Z" fill="#1F2430" />
        <path d="M544 173 Q560 187 576 173 Q560 165 544 173 Z" fill="#F472B6" />
        <g transform="rotate(10 604 190)">
          <rect x="590" y="176" width="28" height="28" rx="7" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M597 184 H611 M604 184 V196 Q604 200 600 200 Q597 200 596 197" strokeWidth="4.5" {...J} />
        </g>
      </g>
    </>
  )
}

function Detetive() {
  return (
    <>
      <ellipse cx="120" cy="214" rx="50" ry="7" fill="#9CA3AF" opacity="0.35" />
      <rect x="88" y="190" width="20" height="16" rx="7" fill="#3730A3" />
      <rect x="132" y="190" width="20" height="16" rx="7" fill="#3730A3" />
      <path d="M65 134 Q46 142 44 162" fill="none" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" />
      <circle cx="44" cy="164" r="8" fill="#4F46E5" />
      <rect x="65" y="86" width="110" height="110" rx="26" fill="#3730A3" />
      <rect x="65" y="80" width="110" height="110" rx="26" fill="#4F46E5" />
      <path d="M99 62 Q99 44 120 44 Q141 44 141 62 L143 84 L97 84 Z" fill="#92400E" />
      <rect x="98" y="72" width="44" height="8" fill="#1F2937" />
      <ellipse cx="120" cy="86" rx="46" ry="9" fill="#78350F" />
      <circle cx="97" cy="126" r="15" fill="#FFFFFF" />
      <circle cx="143" cy="126" r="15" fill="#FFFFFF" />
      <circle cx="101" cy="128" r="7.5" fill="#1F2430" />
      <circle cx="147" cy="128" r="7.5" fill="#1F2430" />
      <circle cx="104" cy="124" r="2.6" fill="#FFFFFF" />
      <circle cx="150" cy="124" r="2.6" fill="#FFFFFF" />
      <path d="M82 110 Q97 103 112 110" fill="none" stroke="#1F2430" strokeWidth="4" strokeLinecap="round" />
      <path d="M128 110 Q143 103 158 110" fill="none" stroke="#1F2430" strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="154" r="6.5" fill="#F9A8D4" />
      <circle cx="160" cy="154" r="6.5" fill="#F9A8D4" />
      <path d="M108 154 Q120 164 132 154" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
      <g transform="rotate(-10 156 174)">
        <rect x="142" y="160" width="28" height="28" rx="7" fill="#FBBF24" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M149 168 H163 M156 168 V180 Q156 184 152 184 Q149 184 148 181" strokeWidth="4.5" {...J} />
      </g>
      <path d="M175 138 Q196 138 202 112" fill="none" stroke="#4F46E5" strokeWidth="9" strokeLinecap="round" />
      <path d="M204 104 L214 84" stroke="#78350F" strokeWidth="7" strokeLinecap="round" />
      <circle cx="226" cy="62" r="19" fill="#E0F2FE" stroke="#FBBF24" strokeWidth="5" />
      <path d="M217 56 Q222 50 229 52" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
      <circle cx="203" cy="108" r="8" fill="#4F46E5" />
    </>
  )
}

export function Mascote({ pose = 'boas-vindas', tamanho = 160, className }: Props) {
  const [, , w, h] = VIEWBOX[pose].split(' ').map(Number)
  return (
    <svg
      className={className}
      viewBox={VIEWBOX[pose]}
      width={tamanho}
      height={(tamanho * h) / w}
      role="img"
      aria-label={ROTULO[pose]}
    >
      {pose === 'boas-vindas' && <BoasVindas />}
      {pose === 'escritor' && <Escritor />}
      {pose === 'comemorando' && <Comemorando />}
      {pose === 'detetive' && <Detetive />}
    </svg>
  )
}
