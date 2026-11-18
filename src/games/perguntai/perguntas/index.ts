import type { Categoria, Pergunta, PerguntaBase } from '../types'
import { arte } from './arte'
import { arte2 } from './arte2'
import { ciencia } from './ciencia'
import { ciencia2 } from './ciencia2'
import { entretenimento } from './entretenimento'
import { entretenimento2 } from './entretenimento2'
import { esporte } from './esporte'
import { esporte2 } from './esporte2'
import { geografia } from './geografia'
import { geografia2 } from './geografia2'
import { historia } from './historia'
import { historia2 } from './historia2'

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
  ...montar('ciencia', [...ciencia, ...ciencia2]),
  ...montar('arte', [...arte, ...arte2]),
  ...montar('esporte', [...esporte, ...esporte2]),
  ...montar('entretenimento', [...entretenimento, ...entretenimento2]),
  ...montar('geografia', [...geografia, ...geografia2]),
  ...montar('historia', [...historia, ...historia2]),
]
