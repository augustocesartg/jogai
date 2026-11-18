import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { criarRng } from '../../plataforma/rng'
import { aplicar, criarPartida } from './motor'
import { perguntasDeTeste } from './perguntas-teste'
import { TelaPartida } from './TelaPartida'
import type { Estado } from './types'
import { visaoDe } from './visao'

const PERGUNTAS = perguntasDeTeste()
const html = (e: Estado, eu: number) =>
  renderToStaticMarkup(<TelaPartida visao={visaoDe(e, eu)} eu={eu} agir={() => {}} onNova={null} onSair={() => {}} />)

function naCoroa(): { e: Estado; a: number; b: number } {
  const e = criarPartida([{ nome: 'Ana', bot: null }, { nome: 'Beto', bot: null }, { nome: 'Carla', bot: null }], criarRng(3))
  const a = e.vez
  const b = (a + 1) % 3
  e.jogadores[a].fichas = ['arte']
  e.jogadores[b].fichas = ['historia']
  e.jogadores[a].trilha = 3
  e.fase = 'categoria'
  e.valorPendente = 'ficha-trilha'
  return { e, a, b }
}

describe('TelaPartida', () => {
  it('no começo da vez, mostra a roleta e o botão de girar só para quem joga', () => {
    const e = criarPartida([{ nome: 'Ana', bot: null }, { nome: 'Beto', bot: null }], criarRng(1))
    expect(html(e, e.vez)).toContain('Girar a roleta')
    expect(html(e, (e.vez + 1) % 2)).not.toContain('Girar a roleta')
  })

  it('na Coroa, lista as categorias (as que já tem ficam desabilitadas) e o duelo possível', () => {
    const { e, a, b } = naCoroa()
    const tela = html(e, a)
    expect(tela).toContain('Escolha a categoria da ficha')
    expect(tela).toContain('já tem')
    expect(tela).toContain('Ou desafie alguém para um duelo')
    expect(tela).toContain(e.jogadores[b].nome)
    expect(html(e, b)).not.toContain('Ou desafie')
  })

  it('mostra a pergunta com 4 alternativas e os curingas habilitados na vez', () => {
    const { e, a } = naCoroa()
    const p = aplicar(e, { tipo: 'escolherCategoria', jogador: a, categoria: 'ciencia' }, PERGUNTAS, criarRng(2))
    const tela = html(p, a)
    expect(tela.match(/pg-opcao/g)?.length).toBeGreaterThanOrEqual(4)
    expect(tela).toContain('Vale a ficha')
    // não revela a certa durante a pergunta
    expect(tela).not.toContain('pg-opcao certa')
  })

  it('no duelo, quem está no duelo responde e os outros só assistem', () => {
    const { e, a, b } = naCoroa()
    const d = aplicar(e, { tipo: 'desafiar', jogador: a, alvo: b, aposta: 'arte', premio: 'historia' }, PERGUNTAS, criarRng(4))
    const c = [0, 1, 2].find((i) => i !== a && i !== b)!
    expect(html(d, a)).not.toContain('Os duelistas estão respondendo')
    expect(html(d, c)).toContain('Os duelistas estão respondendo')
    expect(html(d, b)).toContain('Duelo')
  })

  it('depois do resultado, mostra a alternativa certa e o botão de continuar para quem joga', () => {
    const { e, a } = naCoroa()
    let p = aplicar(e, { tipo: 'escolherCategoria', jogador: a, categoria: 'ciencia' }, PERGUNTAS, criarRng(2))
    p = aplicar(p, { tipo: 'responder', jogador: a, opcao: p.pergunta!.correta }, PERGUNTAS, criarRng(2))
    const tela = html(p, a)
    expect(tela).toContain('pg-opcao certa')
    expect(tela).toContain('Continuar')
    expect(tela).toContain('conquistou a ficha')
  })
})
