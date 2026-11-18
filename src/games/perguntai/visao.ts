import type { Duelo, Estado, PerguntaAtual, Resultado } from './types'

/** O que um jogador pode ver da pergunta: a alternativa certa só aparece depois do resultado. */
export interface VisaoPergunta extends Omit<PerguntaAtual, 'correta' | 'id'> {
  /** só preenchidos quando a pergunta já foi respondida */
  correta: number | null
  id: string | null
}

export interface VisaoDuelo extends Omit<Duelo, 'respostas'> {
  /** quem já respondeu (a escolha do outro duelista não é revelada) */
  respondeu: number[]
  /** a própria resposta, quando já enviada */
  minhaResposta: number | null
}

export interface Visao extends Omit<Estado, 'pergunta' | 'duelo' | 'usadas' | 'resultado'> {
  pergunta: VisaoPergunta | null
  duelo: VisaoDuelo | null
  resultado: Resultado | null
}

/** Versão do estado segura para enviar ao jogador `eu`: nunca expõe a resposta certa antes da hora. */
export function visaoDe(e: Estado, eu: number): Visao {
  const { pergunta, duelo, usadas: _usadas, ...resto } = e
  const revelar = e.fase === 'resultado' || e.fase === 'fim'
  return {
    ...resto,
    pergunta: pergunta
      ? {
          ...pergunta,
          id: revelar ? pergunta.id : null,
          correta: revelar ? pergunta.correta : null,
        }
      : null,
    duelo: duelo
      ? {
          desafiante: duelo.desafiante,
          alvo: duelo.alvo,
          aposta: duelo.aposta,
          premio: duelo.premio,
          respondeu: Object.keys(duelo.respostas).map(Number),
          minhaResposta: duelo.respostas[eu] ?? null,
        }
      : null,
  }
}
