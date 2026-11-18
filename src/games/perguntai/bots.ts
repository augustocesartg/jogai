import type { Rng } from '../../plataforma/rng'
import { categoriasLivres, desafiosPossiveis } from './motor'
import type { Acao, Estado, NivelBot, NivelPergunta } from './types'

/** Chance de o bot saber a resposta, pelo nível do bot e a dificuldade da pergunta. Calibrado por simulação. */
const CHANCE: Record<NivelBot, Record<NivelPergunta, number>> = {
  facil: { 1: 0.7, 2: 0.5, 3: 0.3 },
  medio: { 1: 0.85, 2: 0.65, 3: 0.45 },
  dificil: { 1: 0.97, 2: 0.88, 3: 0.72 },
}

/** Chance de um bot aceitar o desafio de duelo quando pode. */
const OUSADIA_DUELO: Record<NivelBot, number> = { facil: 0.15, medio: 0.3, dificil: 0.5 }

const sortear = <T>(lista: T[], rng: Rng): T => lista[Math.floor(rng() * lista.length)]

/** Escolhe uma alternativa: a certa se "souber", senão um chute entre as que restam. */
function escolherOpcao(e: Estado, i: number, rng: Rng): number {
  const p = e.pergunta!
  const nivel = e.jogadores[i].bot ?? 'medio'
  const restantes = p.opcoes.map((_, k) => k).filter((k) => !p.eliminadas.includes(k) && !p.erradas.includes(k))
  if (rng() < CHANCE[nivel][p.nivel] && restantes.includes(p.correta)) return p.correta
  // não sabe: chuta entre as que sobraram (a Bomba melhora a chance de acertar no chute)
  return sortear(restantes, rng)
}

/** Decide a próxima ação do bot `i` (a vez dele ou a resposta dele no duelo). */
export function jogadaBot(e: Estado, i: number, rng: Rng): Acao {
  const eu = e.jogadores[i]
  const nivel = eu.bot ?? 'medio'
  const p = e.pergunta

  if (e.fase === 'girar') return { tipo: 'girar', jogador: i }

  if (e.fase === 'categoria') {
    const desafios = desafiosPossiveis(e, i)
    if (desafios.length > 0 && rng() < OUSADIA_DUELO[nivel]) return { tipo: 'desafiar', jogador: i, ...sortear(desafios, rng) }
    return { tipo: 'escolherCategoria', jogador: i, categoria: sortear(categoriasLivres(e, i), rng) }
  }

  if (e.fase === 'duelo') return { tipo: 'responder', jogador: i, opcao: escolherOpcao(e, i, rng) }

  if (e.fase === 'responder' && p) {
    const novaPergunta = p.erradas.length === 0
    // curingas: só no começo da pergunta, e mais quando ela é difícil
    if (novaPergunta) {
      const dificil = p.nivel >= 2
      if (eu.especiais.bomba > 0 && p.eliminadas.length === 0 && dificil && rng() < 0.4) return { tipo: 'usarEspecial', jogador: i, especial: 'bomba' }
      if (eu.especiais.chanceDupla > 0 && p.tentativas === 1 && p.nivel === 3 && rng() < 0.4) return { tipo: 'usarEspecial', jogador: i, especial: 'chanceDupla' }
      if (eu.especiais.passar > 0 && p.nivel === 3 && nivel !== 'facil' && rng() < 0.3) return { tipo: 'usarEspecial', jogador: i, especial: 'passar' }
    }
    return { tipo: 'responder', jogador: i, opcao: escolherOpcao(e, i, rng) }
  }

  // resultado: depois de errar, às vezes gasta o Tiro extra para jogar de novo
  if (e.fase === 'resultado' && e.resultado?.tipo === 'erro' && eu.especiais.tiroExtra > 0 && rng() < 0.5) {
    return { tipo: 'usarEspecial', jogador: i, especial: 'tiroExtra' }
  }
  return { tipo: 'seguir', jogador: i }
}
