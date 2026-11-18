import type { Categoria, Pergunta, PerguntaBase } from '../types'
import { arte } from './arte'
import { ciencia } from './ciencia'
import { entretenimento } from './entretenimento'
import { esporte } from './esporte'
import { geografia } from './geografia'
import { historia } from './historia'

/** Id curto e estável derivado do texto (hash FNV-1a): trocar o texto de uma pergunta cria uma pergunta nova. */
function hash(texto: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

function montar(categoria: Categoria, base: PerguntaBase[]): Pergunta[] {
  return base.map((p) => ({ ...p, categoria, id: `${categoria}:${hash(p.texto)}` }))
}

export const PERGUNTAS: Pergunta[] = [
  ...montar('ciencia', ciencia),
  ...montar('arte', arte),
  ...montar('esporte', esporte),
  ...montar('entretenimento', entretenimento),
  ...montar('geografia', geografia),
  ...montar('historia', historia),
]
