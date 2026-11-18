/** Fundo low poly: polígonos grandes nas bordas da tela, atrás de todo o conteúdo. Puramente decorativo. */
export function FundoPoly() {
  return (
    <svg className="fundo-poly" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {/* esquerda */}
      <polygon points="0,150 70,210 0,330" className="p-rosa" />
      <polygon points="0,150 70,210 0,60" className="p-rosa-2" />
      <polygon points="0,330 70,210 40,420 0,420" className="p-verde" />
      <polygon points="0,420 40,420 0,520" className="p-verde-2" />
      {/* direita */}
      <polygon points="400,90 330,150 400,230" className="p-verde" />
      <polygon points="400,230 330,150 360,300 400,300" className="p-verde-2" />
      <polygon points="400,520 350,600 400,700" className="p-rosa" />
      <polygon points="400,520 350,600 370,480 400,440" className="p-rosa-2" />
      {/* embaixo */}
      <polygon points="0,700 90,800 0,800" className="p-laranja" />
      <polygon points="90,800 160,740 220,800" className="p-violeta" />
      <polygon points="260,800 330,730 400,800" className="p-laranja-2" />
      {/* em cima */}
      <polygon points="120,0 190,0 150,50" className="p-violeta" />
      <polygon points="260,0 340,0 310,40" className="p-laranja-2" />
      <polygon points="40,120 60,90 85,130" className="p-laranja" />
    </svg>
  )
}
