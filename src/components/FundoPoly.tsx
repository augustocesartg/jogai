/** Triângulos grandes, de tons próximos, que cobrem a tela inteira (dão a textura low poly sem atrapalhar a leitura). */
const FACETAS: [string, 1 | 2 | 3][] = [
  ['0,0 200,0 160,200', 1], ['0,0 160,200 0,260', 2], ['200,0 400,0 400,240', 3], ['200,0 400,240 160,200', 2],
  ['0,260 160,200 110,380', 3], ['160,200 300,330 110,380', 1], ['160,200 400,240 300,330', 3], ['400,240 400,560 300,330', 2],
  ['0,260 110,380 0,520', 1], ['110,380 300,330 250,470', 2], ['300,330 400,560 250,470', 1], ['0,520 110,380 250,470', 3],
  ['0,520 250,470 120,650', 2], ['250,470 400,560 310,690', 3], ['250,470 310,690 120,650', 1], ['0,520 120,650 0,800', 3],
  ['120,650 180,800 0,800', 1], ['120,650 310,690 180,800', 2], ['310,690 400,560 400,800', 2], ['310,690 400,800 180,800', 3],
]

/** Cacos coloridos só nos cantos e nas bordas, longe do texto. */
const CACOS: [string, string][] = [
  ['0,0 80,0 0,70', 'p-rosa'], ['80,0 130,0 95,28', 'p-violeta'],
  ['400,40 400,150 350,95', 'p-verde'], ['400,150 350,95 372,175', 'p-verde-2'],
  ['0,330 28,380 0,440', 'p-laranja'],
  ['400,470 368,520 400,590', 'p-rosa'], ['400,590 368,520 384,610', 'p-rosa-2'],
  ['0,740 60,800 0,800', 'p-laranja-2'], ['330,800 400,740 400,800', 'p-violeta'], ['190,800 215,775 240,800', 'p-verde'],
]

/** Fundo low poly, atrás de todo o conteúdo. Puramente decorativo. */
export function FundoPoly() {
  return (
    <svg className="fundo-poly" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {FACETAS.map(([pontos, tom]) => (
        <polygon key={pontos} points={pontos} className={`f${tom}`} />
      ))}
      {CACOS.map(([pontos, cls]) => (
        <polygon key={pontos} points={pontos} className={cls} />
      ))}
    </svg>
  )
}
