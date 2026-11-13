import { describe, expect, it } from 'vitest'
import { jogadaBot } from './bots'
import { aplicar, criarPartida, montarItens } from './motor'
import { conferirPalpite } from './palpite'
import { criarRng } from './rng'
import type { Carta, Estado, Item } from './types'

function carta(id: string, resposta: string, extra: Partial<Carta> = {}): Carta {
  return {
    id,
    categoria: 'pessoa',
    resposta,
    chutes: ['Fulano', 'Beltrano'],
    pistas: Array.from({ length: 18 }, (_, i) => ['m', `Pista ${i + 1} sobre a carta`] as [ 'm', string ]),
    ...extra,
  }
}

const CARTAS = [carta('a', 'Santos Dumont', { aceitas: ['Alberto Santos Dumont'] }), carta('b', 'Pelé'), carta('c', 'Einstein')]

/** estado com itens conhecidos: 1-4 pistas, 5 perca, 6 avance2, 7 volte1, 8 outro, resto pistas */
function estadoFixo(nJogadores = 2): Estado {
  const rng = criarRng(1)
  const e = criarPartida(
    Array.from({ length: nJogadores }, (_, i) => ({ nome: `J${i}`, bot: null })),
    CARTAS,
    rng,
  )
  const itens: Item[] = Array.from({ length: 20 }, (_, i) => ({ tipo: 'pista', dif: 'm', texto: `dica ${i + 1}` }))
  itens[4] = { tipo: 'comando', comando: 'perca' }
  itens[5] = { tipo: 'comando', comando: 'avance2' }
  itens[6] = { tipo: 'comando', comando: 'volte1' }
  itens[7] = { tipo: 'comando', comando: 'outro' }
  e.rodada.itens = itens
  e.rodada.carta = CARTAS[0]
  return e
}

const rng = criarRng(99)
const passo = (e: Estado, a: Parameters<typeof aplicar>[1]) => aplicar(e, a, CARTAS, rng)

describe('conferirPalpite', () => {
  const c = CARTAS[0]
  it('ignora acentos, caixa, artigos e pontuação', () => {
    expect(conferirPalpite(carta('x', 'A Torre Eiffel'), 'torre   EIFFEL!')).toBe(true)
    expect(conferirPalpite(carta('x', 'Pelé'), 'PELE')).toBe(true)
  })
  it('aceita variações listadas e pequenos erros', () => {
    expect(conferirPalpite(c, 'alberto santos dumont')).toBe(true)
    expect(conferirPalpite(c, 'Santos Dumon')).toBe(true)
    expect(conferirPalpite(c, 'Dom Pedro')).toBe(false)
  })
  it('anos exigem número exato', () => {
    const ano = carta('y', '1500', { categoria: 'ano' })
    expect(conferirPalpite(ano, '1500')).toBe(true)
    expect(conferirPalpite(ano, '1501')).toBe(false)
  })
  it('texto vazio nunca acerta', () => {
    expect(conferirPalpite(CARTAS[1], '   ')).toBe(false)
  })
})

describe('montarItens', () => {
  it('gera 20 itens com 2 ou 3 comandos distintos', () => {
    for (let s = 0; s < 30; s++) {
      const itens = montarItens(CARTAS[0], criarRng(s))
      expect(itens).toHaveLength(20)
      const cmds = itens.flatMap((i) => (i.tipo === 'comando' ? [i.comando] : []))
      expect([2, 3]).toContain(cmds.length)
      expect(new Set(cmds).size).toBe(cmds.length)
    }
  })
})

describe('regras do jogo', () => {
  it('acerto na 1ª dica avança 19 casas e encerra a rodada', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 1 })
    e = passo(e, { tipo: 'palpitar', texto: 'santos dumont' })
    expect(e.jogadores[0].pos).toBe(19)
    expect(e.mediador).toBe(0)
    expect(e.rodada.fase).toBe('fim')
    expect(e.rodada.resultado).toEqual({ tipo: 'acerto', jogador: 0, casas: 19 })
  })

  it('erro dá 1 casa ao mediador e passa a vez', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 1 })
    e = passo(e, { tipo: 'palpitar', texto: 'outra coisa' })
    expect(e.mediador).toBe(1)
    expect(e.rodada.vez).toBe(1)
    expect(e.rodada.fase).toBe('escolher')
  })

  it('passar também dá 1 casa ao mediador', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 2 })
    e = passo(e, { tipo: 'passar' })
    expect(e.mediador).toBe(1)
    expect(e.rodada.vez).toBe(1)
  })

  it('número já usado é ignorado', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 1 })
    e = passo(e, { tipo: 'passar' })
    const antes = e
    e = passo(e, { tipo: 'escolher', numero: 1 })
    expect(e).toEqual(antes)
  })

  it('"Perca a vez": sem palpite, mediador +1, vez passa', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 5 })
    expect(e.mediador).toBe(1)
    expect(e.rodada.vez).toBe(1)
    expect(e.rodada.fase).toBe('escolher')
  })

  it('"Avance 2 casas": move o peão e passa a vez', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 6 })
    expect(e.jogadores[0].pos).toBe(2)
    expect(e.mediador).toBe(1)
    expect(e.rodada.vez).toBe(1)
  })

  it('"Volte 1 casa": recua 1 e nunca fica abaixo de 0', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 7 })
    expect(e.jogadores[0].pos).toBe(0)
    let f = estadoFixo()
    f.jogadores[0].pos = 5
    f = passo(f, { tipo: 'escolher', numero: 7 })
    expect(f.jogadores[0].pos).toBe(4)
    expect(f.rodada.vez).toBe(1)
  })

  it('"Escolha outro número": mesmo jogador escolhe de novo', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 8 })
    expect(e.mediador).toBe(1)
    expect(e.rodada.vez).toBe(0)
    expect(e.rodada.fase).toBe('escolher')
    expect(e.rodada.usados).toEqual([8])
  })

  it('comandos contam como números usados na pontuação', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 8 })
    e = passo(e, { tipo: 'escolher', numero: 1 })
    e = passo(e, { tipo: 'palpitar', texto: 'Santos Dumont' })
    expect(e.jogadores[0].pos).toBe(18)
  })

  it('esgotar as 20 dicas revela a resposta e dá 20 casas ao mediador', () => {
    let e = estadoFixo(1)
    for (let n = 1; n <= 20; n++) {
      if (e.rodada.fase === 'fim') break
      e = passo(e, { tipo: 'escolher', numero: n })
      if (e.rodada.fase === 'palpitar') e = passo(e, { tipo: 'passar' })
    }
    expect(e.rodada.resultado).toEqual({ tipo: 'esgotou' })
    expect(e.mediador).toBe(20)
  })

  it('chegar à casa 30 vence na hora', () => {
    let e = estadoFixo()
    e.jogadores[0].pos = 28
    e = passo(e, { tipo: 'escolher', numero: 6 })
    expect(e.vencedor).toBe(0)
    expect(e.rodada.fase).toBe('fim')
  })

  it('mediador também pode vencer', () => {
    let e = estadoFixo()
    e.mediador = 29
    e = passo(e, { tipo: 'escolher', numero: 1 })
    e = passo(e, { tipo: 'passar' })
    expect(e.vencedor).toBe('mediador')
  })

  it('próxima rodada: nova carta e rodízio de quem começa', () => {
    let e = estadoFixo()
    e = passo(e, { tipo: 'escolher', numero: 1 })
    e = passo(e, { tipo: 'palpitar', texto: 'Santos Dumont' })
    const idAnterior = e.rodada.carta.id
    e = passo(e, { tipo: 'proxima' })
    expect(e.rodadaNum).toBe(2)
    expect(e.rodada.vez).toBe(1)
    expect(e.rodada.fase).toBe('escolher')
    expect(e.rodada.usados).toEqual([])
    expect(e.cartasUsadas).toContain(idAnterior)
  })

  it('não altera o estado recebido', () => {
    const e = estadoFixo()
    const copia = structuredClone(e)
    passo(e, { tipo: 'escolher', numero: 1 })
    expect(e).toEqual(copia)
  })
})

describe('bots', () => {
  it('partidas só de bots terminam sempre', () => {
    for (let s = 1; s <= 30; s++) {
      const r = criarRng(s)
      let e = criarPartida(
        [
          { nome: 'A', bot: 'medio' },
          { nome: 'B', bot: 'facil' },
          { nome: 'C', bot: 'dificil' },
        ],
        CARTAS,
        r,
      )
      let passos = 0
      while (e.vencedor === null && passos++ < 5000) {
        e = aplicar(e, e.rodada.fase === 'fim' ? { tipo: 'proxima' } : jogadaBot(e, r), CARTAS, r)
      }
      expect(e.vencedor).not.toBeNull()
    }
  })
})
