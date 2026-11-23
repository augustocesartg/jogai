import { describe, expect, it } from 'vitest'
import { CURIOSIDADES } from './banco'
import { chaveDoDia, curiosidadeDoDia, dataCurta, numeroDoDia } from './dia'
import { linkChatGPT } from './ia'
import { converter } from './nesteDia'

describe('banco de curiosidades', () => {
  it('tem todos os campos, títulos únicos e resumo curto', () => {
    const titulos = new Set<string>()
    for (const c of CURIOSIDADES) {
      expect(c.titulo.length).toBeGreaterThan(3)
      expect(c.resumo.length).toBeGreaterThan(10)
      expect(c.resumo.length).toBeLessThanOrEqual(110)
      expect(c.texto.length).toBeGreaterThan(c.resumo.length)
      expect(c.fonte).toBeTruthy()
      expect(titulos.has(c.titulo)).toBe(false)
      titulos.add(c.titulo)
    }
  })

  it('cobre o ano todo, com o mesmo número de itens por categoria', () => {
    expect(CURIOSIDADES.length).toBeGreaterThanOrEqual(366)
    const porCategoria = new Map<string, number>()
    for (const c of CURIOSIDADES) porCategoria.set(c.categoria, (porCategoria.get(c.categoria) ?? 0) + 1)
    expect(new Set(porCategoria.values()).size).toBe(1)
  })

  it('dias seguidos trazem categorias diferentes, inclusive na volta ao começo', () => {
    CURIOSIDADES.forEach((c, i) => {
      expect(c.categoria).not.toBe(CURIOSIDADES[(i + 1) % CURIOSIDADES.length].categoria)
    })
  })

  it('não repete o resumo nem o texto', () => {
    expect(new Set(CURIOSIDADES.map((c) => c.resumo)).size).toBe(CURIOSIDADES.length)
    expect(new Set(CURIOSIDADES.map((c) => c.texto)).size).toBe(CURIOSIDADES.length)
  })
})

describe('curiosidade do dia', () => {
  it('é a mesma no mesmo dia e muda no dia seguinte', () => {
    expect(curiosidadeDoDia('2026-11-23', CURIOSIDADES)).toBe(curiosidadeDoDia('2026-11-23', CURIOSIDADES))
    expect(curiosidadeDoDia('2026-11-23', CURIOSIDADES)).not.toBe(curiosidadeDoDia('2026-11-24', CURIOSIDADES))
  })

  it('percorre o banco todo antes de repetir', () => {
    const n = CURIOSIDADES.length
    const base = numeroDoDia('2026-01-01')
    expect(numeroDoDia('2026-01-02') - base).toBe(1)
    const todas = new Set(Array.from({ length: n }, (_, i) => CURIOSIDADES[(base + i) % n].titulo))
    expect(todas.size).toBe(n)
  })

  it('usa o dia de Brasília: 01h UTC ainda é o dia anterior', () => {
    expect(chaveDoDia(new Date('2026-11-24T01:00:00Z'))).toBe('2026-11-23')
    expect(chaveDoDia(new Date('2026-11-24T04:00:00Z'))).toBe('2026-11-24')
  })

  it('formata a data curta', () => {
    expect(dataCurta('2026-11-23')).toBe('23 nov')
    expect(dataCurta('2026-03-05')).toBe('5 mar')
  })
})

describe('saber mais e neste dia', () => {
  it('monta o link do ChatGPT com a pergunta codificada', () => {
    const url = new URL(linkChatGPT('O mel não estraga'))
    expect(url.origin).toBe('https://chatgpt.com')
    expect(url.searchParams.get('q')).toContain('O mel não estraga')
  })

  it('converte a resposta da Wikipédia e ignora itens sem ano ou texto', () => {
    const fatos = converter({
      selected: [
        {
          year: 1963,
          text: 'Estreia Doctor Who.',
          pages: [
            { titles: { normalized: 'An Unearthly Child' }, extract: 'Resumo', thumbnail: { source: 'https://x/y.jpg' }, content_urls: { mobile: { page: 'https://pt.m.wikipedia.org/wiki/X' } } },
          ],
        },
        { year: 1900, text: '' },
        { text: 'sem ano' } as never,
      ],
    })
    expect(fatos).toHaveLength(1)
    expect(fatos[0].artigo?.titulo).toBe('An Unearthly Child')
    expect(fatos[0].artigo?.imagem).toBe('https://x/y.jpg')
    expect(converter({})).toEqual([])
  })
})
