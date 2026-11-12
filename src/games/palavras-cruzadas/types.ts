export type Materia = 'historia' | 'artes' | 'ciencia' | 'geografia'

/** [resposta, dica] como escrita nos arquivos de dados */
export type Entrada = [string, string]

export interface Palavra {
  id: string
  materia: Materia
  /** resposta para exibição (com acentos), sem espaços */
  resposta: string
  /** resposta normalizada: maiúsculas, sem acentos */
  chave: string
  dica: string
}

export type Direcao = 'H' | 'V'

export interface Colocada {
  palavra: Palavra
  linha: number
  coluna: number
  direcao: Direcao
  numero: number
}

export interface Tabuleiro {
  tamanho: number
  palavras: Colocada[]
}

export const MATERIAS: { id: Materia; nome: string; emoji: string }[] = [
  { id: 'historia', nome: 'História', emoji: '🏛️' },
  { id: 'artes', nome: 'Artes', emoji: '🎨' },
  { id: 'ciencia', nome: 'Ciência', emoji: '🔬' },
  { id: 'geografia', nome: 'Geografia', emoji: '🌎' },
]
