/** Efeitos sonoros sintetizados com WebAudio: sem arquivos, funcionam offline. */
export type Som =
  | 'pista'
  | 'acerto'
  | 'erro'
  | 'passou'
  | 'perca'
  | 'avance2'
  | 'volte1'
  | 'outro'
  | 'rodada'
  | 'esgotou'
  | 'vitoria'
  | 'derrota'

/** [frequência em Hz, duração em s, onda, volume] */
type Nota = [number, number, OscillatorType?, number?]

const SONS: Record<Som, Nota[]> = {
  pista: [[660, 0.09, 'triangle']],
  acerto: [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.26]],
  erro: [[220, 0.14, 'sawtooth', 0.12], [165, 0.26, 'sawtooth', 0.12]],
  passou: [[330, 0.16, 'sine']],
  perca: [[392, 0.12, 'square', 0.1], [262, 0.28, 'square', 0.1]],
  avance2: [[440, 0.1], [587, 0.1], [740, 0.18]],
  volte1: [[740, 0.1], [587, 0.1], [440, 0.18]],
  outro: [[523, 0.08], [523, 0.08], [784, 0.2]],
  rodada: [[587, 0.12], [880, 0.2]],
  esgotou: [[330, 0.16, 'sawtooth', 0.12], [262, 0.16, 'sawtooth', 0.12], [196, 0.34, 'sawtooth', 0.12]],
  vitoria: [[523, 0.12], [523, 0.12], [523, 0.12], [698, 0.3], [587, 0.12], [698, 0.12], [880, 0.5]],
  derrota: [[392, 0.2, 'sine'], [349, 0.2, 'sine'], [330, 0.2, 'sine'], [262, 0.5, 'sine']],
}

const CHAVE = 'jogai:adivinhai:som'

function lerPreferencia(): boolean {
  try {
    return localStorage.getItem(CHAVE) !== '0'
  } catch {
    return true
  }
}

let ligado = lerPreferencia()
let ctx: AudioContext | null = null

export const somLigado = () => ligado

export function definirSom(valor: boolean) {
  ligado = valor
  try {
    localStorage.setItem(CHAVE, valor ? '1' : '0')
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
}

function contexto(): AudioContext | null {
  if (ctx) return ctx
  if (typeof window === 'undefined') return null
  const Construtor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Construtor) return null
  try {
    ctx = new Construtor()
  } catch {
    ctx = null
  }
  return ctx
}

/** Toca um ou vários sons em sequência. Seguro de chamar sem áudio disponível. */
export function tocar(sons: Som | Som[]) {
  if (!ligado) return
  const c = contexto()
  if (!c) return
  if (c.state === 'suspended') void c.resume()
  let t = c.currentTime + 0.02
  for (const som of Array.isArray(sons) ? sons : [sons]) {
    for (const [freq, dur, onda = 'triangle', volume = 0.16] of SONS[som]) {
      const osc = c.createOscillator()
      const ganho = c.createGain()
      osc.type = onda
      osc.frequency.value = freq
      ganho.gain.setValueAtTime(0.0001, t)
      ganho.gain.exponentialRampToValueAtTime(volume, t + 0.012)
      ganho.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      osc.connect(ganho).connect(c.destination)
      osc.start(t)
      osc.stop(t + dur + 0.03)
      t += dur
    }
    t += 0.06
  }
}
