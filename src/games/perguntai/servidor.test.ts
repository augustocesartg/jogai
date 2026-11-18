import { describe, expect, it } from 'vitest'
import { criarRng } from '../../plataforma/rng'
import { perguntaiServidor as j } from './servidor'

const rng = criarRng(21)
const criar = (humanos: string[], opcoes: unknown = { bots: 1 }) => j.criar(humanos, opcoes, [], rng)!

describe('perguntaiServidor (contrato da sala online)', () => {
  it('cria com humanos e bots, sem repetir nome de humano, e respeita as opções', () => {
    const e = criar(['Ana', 'Beto'], { bots: 2, nivel: 'dificil', fichas: 3 })
    const nomes = j.jogadores(e).map((x) => x.nome)
    expect(nomes.slice(0, 2)).toEqual(['Ana', 'Beto'])
    expect(new Set(nomes).size).toBe(4)
    expect(e.fichasParaVencer).toBe(3)
    expect(e.nivelPerguntas).toBe('dificil')
  })

  it('recusa partida com menos de 2 jogadores e limita o total a 6', () => {
    expect(j.criar(['Ana'], { bots: 0 }, [], rng)).toBeNull()
    expect(j.jogadores(criar(['Ana'], { bots: 99 }))).toHaveLength(6)
    expect(criar(['Ana', 'Beto'], { fichas: 99 }).fichasParaVencer).toBe(4)
  })

  it('só aceita ação de quem pode agir, ignora lixo e não confia no jogador que o cliente informa', () => {
    const e = criar(['Ana', 'Beto'], { bots: 0 })
    const outro = (e.vez + 1) % 2
    expect(j.aplicar(e, { tipo: 'girar' }, outro, rng)).toBeNull()
    expect(j.aplicar(e, { tipo: 'bobagem' }, e.vez, rng)).toBeNull()
    expect(j.aplicar(e, null, e.vez, rng)).toBeNull()
    // o cliente tenta agir como se fosse o outro jogador
    expect(j.aplicar(e, { tipo: 'girar', jogador: outro }, outro, rng)).toBeNull()
    const girou = j.aplicar(e, { tipo: 'girar', jogador: outro }, e.vez, rng)
    expect(girou).not.toBeNull()
    expect(girou!.fase).not.toBe('girar')
  })

  it('ação que não muda nada é recusada (não reinicia o relógio da sala)', () => {
    const e = criar(['Ana', 'Beto'], { bots: 0 })
    // responder sem pergunta em jogo
    expect(j.aplicar(e, { tipo: 'responder', opcao: 0 }, e.vez, rng)).toBeNull()
    expect(j.aplicar(e, { tipo: 'usarEspecial', especial: 'bomba' }, e.vez, rng)).toBeNull()
  })

  it('a visão esconde a alternativa certa durante a pergunta', () => {
    let e = criar(['Ana', 'Beto'], { bots: 0 })
    for (let k = 0; k < 20 && e.fase === 'girar'; k++) e = j.aplicar(e, { tipo: 'girar' }, e.vez, criarRng(k + 1))!
    if (e.fase === 'responder') {
      const v = j.visao(e, e.vez) as { pergunta: { correta: number | null } }
      expect(v.pergunta.correta).toBeNull()
    }
  })

  it('agenda: humano com prazo, bot rápido, resultado e duelo', () => {
    const e = criar(['Ana'], { bots: 1 })
    expect(j.agenda({ ...e, vez: 0 })).toMatchObject({ jogador: 0, tipo: 'humano' })
    expect(j.agenda({ ...e, vez: 1 })).toMatchObject({ jogador: 1, tipo: 'bot' })
    expect(j.agenda({ ...e, vez: 0, fase: 'resultado' })).toMatchObject({ jogador: null, tipo: 'proxima' })
    expect(j.agenda({ ...e, vez: 1, fase: 'resultado' })).toMatchObject({ tipo: 'bot' })
    expect(j.agenda({ ...e, vencedor: 0, fase: 'fim' })).toBeNull()
  })

  it('o duelo espera primeiro o bot e depois o humano', () => {
    const e = criar(['Ana', 'Beto'], { bots: 1 })
    e.vez = 0
    e.jogadores[0].fichas = ['arte']
    e.jogadores[1].fichas = ['historia']
    e.jogadores[0].trilha = 3
    e.fase = 'categoria'
    e.valorPendente = 'ficha-trilha'
    const d = j.aplicar(e, { tipo: 'desafiar', alvo: 1, aposta: 'arte', premio: 'historia' }, 0, rng)!
    expect(d.fase).toBe('duelo')
    expect(j.agenda(d)).toMatchObject({ jogador: 0, tipo: 'humano' })
    const depois = j.aplicar(d, { tipo: 'responder', opcao: -1 }, 0, rng)!
    expect(j.agenda(depois)).toMatchObject({ jogador: 1, tipo: 'humano' })
  })

  it('uma partida inteira só com jogadas automáticas (bots e tempo esgotado) sempre avança e termina', () => {
    for (const humanos of [['Ana'], ['Ana', 'Beto']]) {
      let e = j.criar(humanos, { bots: 3 - (humanos.length - 1), nivel: 'dificil', fichas: 3 }, [], criarRng(5))!
      const r = criarRng(9)
      let passos = 0
      while (!j.terminou(e) && passos++ < 5000) {
        const ag = j.agenda(e)!
        const acao = j.automatico(e, ag, r)
        const depois = j.aplicar(e, acao, ag.jogador ?? -1, r)
        expect(depois, `travou na fase ${e.fase}`).not.toBeNull()
        e = depois!
      }
      expect(j.terminou(e)).toBe(true)
    }
  })
})
