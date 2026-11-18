import { describe, expect, it } from 'vitest'
import { criarRng } from '../../plataforma/rng'
import { jogadaBot } from './bots'
import { aplicar, categoriasLivres, criarPartida, desafiosPossiveis, quemAge } from './motor'
import { perguntasDeTeste } from './perguntas-teste'
import type { Acao, Categoria, Estado } from './types'
import { visaoDe } from './visao'

const PERGUNTAS = perguntasDeTeste()
const rng = criarRng(11)

const humanos = (n: number) => Array.from({ length: n }, (_, i) => ({ nome: `J${i}`, bot: null }))
const nova = (n = 3, semente = 1, opcoes = {}) => criarPartida(humanos(n), criarRng(semente), opcoes)
const agir = (e: Estado, a: Acao) => aplicar(e, a, PERGUNTAS, rng)

/** Leva a partida até uma pergunta em jogo, de uma categoria e com o valor desejado, para o jogador da vez. */
function comPergunta(e: Estado, categoria: Categoria, valor: 'trilha' | 'ficha-trilha' | 'ficha-roleta' = 'trilha'): Estado {
  const antes = structuredClone(e)
  antes.fase = 'categoria'
  antes.valorPendente = valor === 'trilha' ? 'ficha-trilha' : valor
  const j = antes.jogadores[antes.vez]
  j.fichas = j.fichas.filter((c) => c !== categoria)
  const depois = agir(antes, { tipo: 'escolherCategoria', jogador: antes.vez, categoria })
  // para valor 'trilha' (pergunta comum), só troca o valor da pergunta já sorteada
  if (valor === 'trilha') depois.pergunta!.valor = 'trilha'
  return depois
}
const certa = (e: Estado) => e.pergunta!.correta
const errada = (e: Estado) => e.pergunta!.opcoes.findIndex((_, k) => k !== e.pergunta!.correta && !e.pergunta!.eliminadas.includes(k) && !e.pergunta!.erradas.includes(k))

describe('começo da partida', () => {
  it('cada jogador começa com 1 de cada curinga, sem fichas e no início da trilha', () => {
    const e = nova(4)
    for (const j of e.jogadores) {
      expect(j.especiais).toEqual({ bomba: 1, chanceDupla: 1, tiroExtra: 1, passar: 1 })
      expect(j.fichas).toEqual([])
      expect(j.trilha).toBe(0)
    }
    expect(e.fase).toBe('girar')
    expect(quemAge(e)).toEqual([e.vez])
  })

  it('o jogador inicial varia entre partidas', () => {
    const inicios = new Set(Array.from({ length: 30 }, (_, s) => nova(4, s + 1).vez))
    expect(inicios.size).toBeGreaterThan(1)
  })
})

describe('roleta', () => {
  it('gira e sorteia uma pergunta da categoria, ou a Coroa', () => {
    const visto = new Set<string>()
    for (let s = 1; s <= 80; s++) {
      const e = nova(3, s)
      const g = aplicar(e, { tipo: 'girar', jogador: e.vez }, PERGUNTAS, criarRng(s * 31))
      visto.add(String(g.giro))
      if (g.giro === 'coroa') {
        expect(g.fase).toBe('categoria')
        expect(g.valorPendente).toBe('ficha-roleta')
      } else {
        expect(g.fase).toBe('responder')
        expect(g.pergunta!.categoria).toBe(g.giro)
        expect(g.pergunta!.opcoes).toHaveLength(4)
        expect(g.pergunta!.opcoes[g.pergunta!.correta]).toContain('certa')
      }
    }
    expect(visto.has('coroa')).toBe(true)
    expect(visto.size).toBe(7)
  })

  it('ignora ação de quem não é o da vez', () => {
    const e = nova(3)
    const outro = (e.vez + 1) % 3
    expect(agir(e, { tipo: 'girar', jogador: outro })).toBe(e)
  })
})

describe('perguntas comuns e trilha', () => {
  it('acertar avança uma casa e mantém a vez; 3 acertos levam à Coroa', () => {
    let e = nova(3)
    const vez = e.vez
    for (let k = 1; k <= 3; k++) {
      e = comPergunta(e, 'ciencia')
      e = agir(e, { tipo: 'responder', jogador: vez, opcao: certa(e) })
      expect(e.fase).toBe('resultado')
      expect(e.jogadores[vez].trilha).toBe(k)
      e = agir(e, { tipo: 'seguir', jogador: vez })
      expect(e.vez).toBe(vez)
    }
    // na Coroa da trilha: vai direto escolher a categoria da ficha
    expect(e.fase).toBe('categoria')
    expect(e.valorPendente).toBe('ficha-trilha')
  })

  it('errar passa a vez e mantém a trilha', () => {
    let e = comPergunta(nova(3), 'arte')
    const vez = e.vez
    e.jogadores[vez].trilha = 2
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: errada(e) })
    expect(e.resultado).toMatchObject({ tipo: 'erro' })
    e = agir(e, { tipo: 'seguir', jogador: vez })
    expect(e.vez).toBe((vez + 1) % 3)
    expect(e.jogadores[vez].trilha).toBe(2)
    expect(e.fase).toBe('girar')
  })

  it('sem resposta (tempo esgotado) conta como erro', () => {
    let e = comPergunta(nova(3), 'arte')
    e = agir(e, { tipo: 'responder', jogador: e.vez, opcao: -1 })
    expect(e.resultado).toMatchObject({ tipo: 'erro', semResposta: true })
  })

  it('não aceita alternativa repetida ou fora do intervalo', () => {
    let e = comPergunta(nova(3), 'arte')
    const antes = e
    expect(agir(e, { tipo: 'responder', jogador: e.vez, opcao: 9 }).fase).toBe('responder')
    e = agir(e, { tipo: 'usarEspecial', jogador: e.vez, especial: 'chanceDupla' })
    e = agir(e, { tipo: 'responder', jogador: e.vez, opcao: errada(e) })
    const repetida = e.pergunta!.erradas[0]
    const depois = agir(e, { tipo: 'responder', jogador: e.vez, opcao: repetida })
    expect(depois.pergunta!.erradas).toEqual(e.pergunta!.erradas)
    expect(antes.fase).toBe('responder')
  })
})

describe('Coroa e fichas', () => {
  it('acertar na Coroa da trilha dá a ficha, zera a trilha e mantém a vez', () => {
    let e = nova(3)
    const vez = e.vez
    e.jogadores[vez].trilha = 3
    e = comPergunta(e, 'historia', 'ficha-trilha')
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: certa(e) })
    expect(e.jogadores[vez].fichas).toEqual(['historia'])
    expect(e.jogadores[vez].trilha).toBe(0)
    e = agir(e, { tipo: 'seguir', jogador: vez })
    expect(e.vez).toBe(vez)
    expect(e.fase).toBe('girar')
  })

  it('errar na Coroa da trilha volta ao início e passa a vez', () => {
    let e = nova(3)
    const vez = e.vez
    e.jogadores[vez].trilha = 3
    e = comPergunta(e, 'historia', 'ficha-trilha')
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: errada(e) })
    expect(e.jogadores[vez].trilha).toBe(0)
    e = agir(e, { tipo: 'seguir', jogador: vez })
    expect(e.vez).toBe((vez + 1) % 3)
  })

  it('errar com a Coroa da roleta só passa a vez (a trilha fica como estava)', () => {
    let e = nova(3)
    const vez = e.vez
    e.jogadores[vez].trilha = 2
    e = comPergunta(e, 'esporte', 'ficha-roleta')
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: errada(e) })
    expect(e.jogadores[vez].trilha).toBe(2)
    e = agir(e, { tipo: 'seguir', jogador: vez })
    expect(e.vez).toBe((vez + 1) % 3)
  })

  it('só dá para escolher categorias das quais ainda não tem a ficha', () => {
    const e = nova(3)
    e.jogadores[e.vez].fichas = ['arte', 'historia']
    e.fase = 'categoria'
    e.valorPendente = 'ficha-trilha'
    expect(categoriasLivres(e)).toHaveLength(4)
    expect(agir(e, { tipo: 'escolherCategoria', jogador: e.vez, categoria: 'arte' }).fase).toBe('categoria')
    expect(agir(e, { tipo: 'escolherCategoria', jogador: e.vez, categoria: 'ciencia' }).fase).toBe('responder')
  })

  it('a última ficha encerra a partida', () => {
    let e = nova(3, 2, { fichasParaVencer: 2 })
    const vez = e.vez
    e.jogadores[vez].fichas = ['arte']
    e.jogadores[vez].trilha = 3
    e = comPergunta(e, 'ciencia', 'ficha-trilha')
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: certa(e) })
    expect(e.vencedor).toBe(vez)
    expect(e.fase).toBe('fim')
    expect(quemAge(e)).toEqual([])
  })
})

describe('curingas', () => {
  it('Bomba elimina duas erradas e preserva a certa; só uma vez', () => {
    let e = comPergunta(nova(3), 'geografia')
    const vez = e.vez
    e = agir(e, { tipo: 'usarEspecial', jogador: vez, especial: 'bomba' })
    const p = e.pergunta!
    expect(p.eliminadas).toHaveLength(2)
    expect(p.eliminadas).not.toContain(p.correta)
    expect(e.jogadores[vez].especiais.bomba).toBe(0)
    const de_novo = agir(e, { tipo: 'usarEspecial', jogador: vez, especial: 'bomba' })
    expect(de_novo.pergunta!.eliminadas).toEqual(p.eliminadas)
    expect(agir(e, { tipo: 'responder', jogador: vez, opcao: p.eliminadas[0] }).fase).toBe('responder')
  })

  it('Chance dupla permite uma segunda tentativa', () => {
    let e = comPergunta(nova(3), 'arte')
    const vez = e.vez
    e = agir(e, { tipo: 'usarEspecial', jogador: vez, especial: 'chanceDupla' })
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: errada(e) })
    expect(e.fase).toBe('responder')
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: certa(e) })
    expect(e.resultado).toMatchObject({ tipo: 'acerto' })
  })

  it('Chance dupla: errar as duas tentativas encerra a pergunta', () => {
    let e = comPergunta(nova(3), 'arte')
    const vez = e.vez
    e = agir(e, { tipo: 'usarEspecial', jogador: vez, especial: 'chanceDupla' })
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: errada(e) })
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: errada(e) })
    expect(e.resultado).toMatchObject({ tipo: 'erro' })
  })

  it('Passar troca por outra pergunta da mesma categoria sem perder a vez', () => {
    let e = comPergunta(nova(3), 'esporte')
    const vez = e.vez
    const antes = e.pergunta!
    e = agir(e, { tipo: 'usarEspecial', jogador: vez, especial: 'passar' })
    expect(e.pergunta!.id).not.toBe(antes.id)
    expect(e.pergunta!.categoria).toBe('esporte')
    expect(e.vez).toBe(vez)
    expect(e.fase).toBe('responder')
  })

  it('Tiro extra antes de responder gira de novo; não vale numa pergunta de ficha', () => {
    const vez = nova(3).vez
    let e = comPergunta(nova(3), 'esporte')
    e = agir(e, { tipo: 'usarEspecial', jogador: vez, especial: 'tiroExtra' })
    expect(e.fase).toBe('girar')
    expect(e.vez).toBe(vez)

    let f = nova(3)
    f.jogadores[f.vez].trilha = 3
    f = comPergunta(f, 'esporte', 'ficha-trilha')
    f = agir(f, { tipo: 'usarEspecial', jogador: vez, especial: 'tiroExtra' })
    expect(f.fase).toBe('responder')
    expect(f.jogadores[vez].especiais.tiroExtra).toBe(1)
  })

  it('Tiro extra depois de errar mantém a vez em vez de passá-la', () => {
    let e = comPergunta(nova(3), 'esporte')
    const vez = e.vez
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: errada(e) })
    e = agir(e, { tipo: 'usarEspecial', jogador: vez, especial: 'tiroExtra' })
    expect(e.vez).toBe(vez)
    expect(e.fase).toBe('girar')
    expect(e.jogadores[vez].especiais.tiroExtra).toBe(0)
  })

  it('não dá para usar curinga depois de ter errado uma tentativa', () => {
    let e = comPergunta(nova(3), 'arte')
    const vez = e.vez
    e = agir(e, { tipo: 'usarEspecial', jogador: vez, especial: 'chanceDupla' })
    e = agir(e, { tipo: 'responder', jogador: vez, opcao: errada(e) })
    const depois = agir(e, { tipo: 'usarEspecial', jogador: vez, especial: 'bomba' })
    expect(depois.pergunta!.eliminadas).toEqual([])
  })
})

describe('duelo', () => {
  /** Partida de 3 com Ana (vez) e Beto: cada um com uma ficha que o outro não tem, Ana na Coroa. */
  function cenario() {
    const e = nova(3)
    const a = e.vez
    const b = (a + 1) % 3
    e.jogadores[a].fichas = ['arte']
    e.jogadores[b].fichas = ['historia']
    e.jogadores[a].trilha = 3
    e.fase = 'categoria'
    e.valorPendente = 'ficha-trilha'
    return { e, a, b }
  }
  const desafio = (a: number, b: number): Acao => ({ tipo: 'desafiar', jogador: a, alvo: b, aposta: 'arte', premio: 'historia' })

  it('não existe com menos de 3 jogadores', () => {
    const e = nova(2)
    e.jogadores[0].fichas = ['arte']
    e.jogadores[1].fichas = ['historia']
    expect(desafiosPossiveis(e, 0)).toEqual([])
  })

  it('só desafia quem tem uma ficha que o desafiante não tem, e apostando uma ficha própria', () => {
    const { e, a, b } = cenario()
    expect(desafiosPossiveis(e, a)).toEqual([{ alvo: b, aposta: 'arte', premio: 'historia' }])
    e.jogadores[b].fichas = ['arte']
    expect(desafiosPossiveis(e, a)).toEqual([])
    const sem = nova(3)
    sem.vez = 0
    expect(desafiosPossiveis(sem, 0)).toEqual([])
  })

  it('desafiante acerta primeiro: rouba a ficha, mantém a sua, zera a trilha e continua', () => {
    const { e, a, b } = cenario()
    let d = agir(e, desafio(a, b))
    expect(d.fase).toBe('duelo')
    expect(d.pergunta!.categoria).toBe('historia')
    expect(quemAge(d).sort()).toEqual([a, b].sort())
    d = agir(d, { tipo: 'responder', jogador: a, opcao: certa(d) })
    expect(d.fase).toBe('resultado')
    expect(d.jogadores[a].fichas.sort()).toEqual(['arte', 'historia'])
    expect(d.jogadores[b].fichas).toEqual([])
    expect(d.jogadores[a].trilha).toBe(0)
    const seguinte = agir(d, { tipo: 'seguir', jogador: a })
    expect(seguinte.vez).toBe(a)
  })

  it('o alvo acerta primeiro: leva a ficha apostada e o desafiante passa a vez', () => {
    const { e, a, b } = cenario()
    let d = agir(e, desafio(a, b))
    d = agir(d, { tipo: 'responder', jogador: b, opcao: certa(d) })
    expect(d.jogadores[a].fichas).toEqual([])
    expect(d.jogadores[b].fichas.sort()).toEqual(['arte', 'historia'])
    expect(d.jogadores[a].trilha).toBe(0)
    d = agir(d, { tipo: 'seguir', jogador: a })
    expect(d.vez).toBe((a + 1) % 3)
  })

  it('se os dois erram, ninguém muda de fichas, a trilha volta e passa a vez', () => {
    const { e, a, b } = cenario()
    let d = agir(e, desafio(a, b))
    d = agir(d, { tipo: 'responder', jogador: a, opcao: errada(d) })
    expect(d.fase).toBe('duelo')
    expect(quemAge(d)).toEqual([b])
    d = agir(d, { tipo: 'responder', jogador: b, opcao: errada(d) })
    expect(d.resultado).toMatchObject({ tipo: 'duelo', vencedor: null })
    expect(d.jogadores[a].fichas).toEqual(['arte'])
    expect(d.jogadores[b].fichas).toEqual(['historia'])
    expect(d.jogadores[a].trilha).toBe(0)
    d = agir(d, { tipo: 'seguir', jogador: a })
    expect(d.vez).toBe((a + 1) % 3)
  })

  it('quem erra primeiro não impede o outro de acertar; acertar encerra na hora', () => {
    const { e, a, b } = cenario()
    let d = agir(e, desafio(a, b))
    d = agir(d, { tipo: 'responder', jogador: a, opcao: -1 })
    d = agir(d, { tipo: 'responder', jogador: b, opcao: certa(d) })
    expect(d.resultado).toMatchObject({ tipo: 'duelo', vencedor: b })
    // depois de decidido, nova resposta é ignorada
    expect(agir(d, { tipo: 'responder', jogador: a, opcao: certa(d) })).toEqual(d)
  })

  it('não permite curingas durante o duelo e vencer por duelo encerra a partida', () => {
    const { e, a, b } = cenario()
    e.fichasParaVencer = 2
    let d = agir(e, desafio(a, b))
    expect(agir(d, { tipo: 'usarEspecial', jogador: a, especial: 'bomba' })).toEqual(d)
    d = agir(d, { tipo: 'responder', jogador: a, opcao: certa(d) })
    expect(d.vencedor).toBe(a)
    expect(d.fase).toBe('fim')
  })
})

describe('visão do jogador', () => {
  it('não revela a alternativa certa antes do resultado', () => {
    const e = comPergunta(nova(3), 'ciencia')
    const v = visaoDe(e, e.vez)
    expect(v.pergunta!.correta).toBeNull()
    expect(v.pergunta!.id).toBeNull()
    expect(JSON.stringify(v)).not.toContain('"usadas"')
    const r = agir(e, { tipo: 'responder', jogador: e.vez, opcao: certa(e) })
    expect(visaoDe(r, r.vez).pergunta!.correta).toBe(certa(e))
  })

  it('no duelo, esconde a resposta do outro duelista', () => {
    const e = nova(3)
    const a = e.vez
    const b = (a + 1) % 3
    e.jogadores[a].fichas = ['arte']
    e.jogadores[b].fichas = ['historia']
    e.jogadores[a].trilha = 3
    e.fase = 'categoria'
    e.valorPendente = 'ficha-trilha'
    let d = agir(e, { tipo: 'desafiar', jogador: a, alvo: b, aposta: 'arte', premio: 'historia' })
    d = agir(d, { tipo: 'responder', jogador: a, opcao: errada(d) })
    expect(visaoDe(d, a).duelo!.minhaResposta).not.toBeNull()
    expect(visaoDe(d, b).duelo!.minhaResposta).toBeNull()
    expect(visaoDe(d, b).duelo!.respondeu).toEqual([a])
  })
})

describe('sorteio de perguntas', () => {
  it('não repete pergunta enquanto há inéditas e recomeça o ciclo mantendo as mais recentes de fora', () => {
    let e = nova(2, 4)
    const ids: string[] = []
    for (let k = 0; k < 12; k++) {
      e = comPergunta(e, 'arte')
      ids.push(e.pergunta!.id)
    }
    expect(new Set(ids).size).toBe(12)
    e = comPergunta(e, 'arte')
    const recentes = ids.slice(-Math.floor(12 * 0.2))
    expect(recentes).not.toContain(e.pergunta!.id)
  })
})

describe('bots', () => {
  it.each([2, 3, 4, 6])('partidas só de bots terminam (%i jogadores)', (n) => {
    for (let s = 1; s <= 15; s++) {
      const r = criarRng(s * 977)
      let e = criarPartida(Array.from({ length: n }, (_, i) => ({ nome: `B${i}`, bot: (['facil', 'medio', 'dificil'] as const)[i % 3] })), r, { fichasParaVencer: 3 })
      let passos = 0
      while (e.vencedor === null && passos++ < 20000) {
        const quem = quemAge(e)[0]
        e = aplicar(e, jogadaBot(e, quem, r), PERGUNTAS, r)
      }
      expect(e.vencedor).not.toBeNull()
      expect(e.jogadores[e.vencedor!].fichas.length).toBeGreaterThanOrEqual(3)
    }
  })
})
