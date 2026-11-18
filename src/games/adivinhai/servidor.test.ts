import { describe, expect, it } from 'vitest'
import { criarRng } from '../../plataforma/rng'
import { adivinhaiServidor as j } from './servidor'

describe('adivinhaiServidor (contrato da sala online)', () => {
  const rng = criarRng(5)
  const criar = (humanos: string[], opcoes: unknown = { bots: 1 }) => j.criar(humanos, opcoes, [], rng)

  it('cria com humanos e bots, sem repetir nome de humano', () => {
    const e = criar(['Ana', 'Beto'], { bots: 2, nivel: 'dificil' })!
    const nomes = j.jogadores(e).map((x) => x.nome)
    expect(nomes.slice(0, 2)).toEqual(['Ana', 'Beto'])
    expect(new Set(nomes).size).toBe(4)
    expect(j.jogadores(e).filter((x) => x.bot)).toHaveLength(2)
  })

  it('recusa partida com menos de 2 jogadores e limita o total a 6', () => {
    expect(criar(['Ana'], { bots: 0 })).toBeNull()
    expect(j.jogadores(criar(['Ana'], { bots: 99 })!)).toHaveLength(6)
  })

  it('só aceita jogada de quem está na vez, mas qualquer um avança a rodada', () => {
    const e = criar(['Ana', 'Beto'], { bots: 0 })!
    expect(j.aplicar(e, { tipo: 'escolher', numero: 1 }, 1, rng)).toBeNull()
    expect(j.aplicar(e, { tipo: 'escolher', numero: 1 }, 0, rng)).not.toBeNull()
    expect(j.aplicar(e, { tipo: 'bobagem' }, 0, rng)).toBeNull()
    expect(j.aplicar(e, { tipo: 'escolher', numero: 1 }, -1, rng)).not.toBeNull()
  })

  it('agenda: humano na vez, bot, e próxima rodada ao fim', () => {
    const e = criar(['Ana'], { bots: 1 })!
    expect(j.agenda(e)).toEqual({ jogador: 0, tipo: 'humano' })
    const fim = { ...e, rodada: { ...e.rodada, fase: 'fim' as const } }
    expect(j.agenda(fim)).toEqual({ jogador: null, tipo: 'proxima' })
    expect(j.automatico(fim, j.agenda(fim)!, rng)).toEqual({ tipo: 'proxima' })
  })

  it('a visão não expõe a resposta durante a rodada', () => {
    const e = criar(['Ana', 'Beto'], { bots: 0 })!
    expect(JSON.stringify(j.visao(e, 0))).not.toContain(e.rodada.carta.resposta)
  })
})
