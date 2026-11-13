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

/** [frequência em Hz, duração em s, volume] — só ondas senoidais, curtas e com volume baixo */
type Nota = [number, number, number?]

const SONS: Record<Som, Nota[]> = {
  pista: [[587, 0.12, 0.07]],
  acerto: [[523, 0.12], [659, 0.12], [784, 0.12], [1047, 0.3]],
  erro: [[294, 0.16, 0.07], [247, 0.3, 0.07]],
  passou: [[392, 0.18, 0.05]],
  perca: [[392, 0.14, 0.06], [330, 0.3, 0.06]],
  avance2: [[440, 0.12], [587, 0.12], [740, 0.22]],
  volte1: [[740, 0.12], [587, 0.12], [440, 0.22]],
  outro: [[523, 0.1], [523, 0.1], [698, 0.24]],
  rodada: [[587, 0.14], [784, 0.26]],
  esgotou: [[392, 0.18, 0.06], [330, 0.18, 0.06], [262, 0.38, 0.06]],
  vitoria: [[523, 0.14], [659, 0.14], [784, 0.14], [1047, 0.2], [988, 0.12], [1047, 0.5]],
  derrota: [[392, 0.24, 0.06], [349, 0.24, 0.06], [330, 0.24, 0.06], [294, 0.5, 0.06]],
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

let mestre: GainNode | null = null

/** Saída comum com filtro passa-baixa, para tirar qualquer aspereza dos tons. */
function saida(c: AudioContext): AudioNode {
  if (!mestre) {
    const filtro = c.createBiquadFilter()
    filtro.type = 'lowpass'
    filtro.frequency.value = 1800
    mestre = c.createGain()
    mestre.gain.value = 0.8
    mestre.connect(filtro).connect(c.destination)
  }
  return mestre
}

/** Toca um ou vários sons em sequência. Seguro de chamar sem áudio disponível. */
export function tocar(sons: Som | Som[]) {
  if (!ligado) return
  const c = contexto()
  if (!c) return
  if (c.state === 'suspended') void c.resume()
  let t = c.currentTime + 0.02
  for (const som of Array.isArray(sons) ? sons : [sons]) {
    for (const [freq, dur, volume = 0.09] of SONS[som]) {
      const osc = c.createOscillator()
      const ganho = c.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      ganho.gain.setValueAtTime(0.0001, t)
      ganho.gain.exponentialRampToValueAtTime(volume, t + 0.03)
      ganho.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08)
      osc.connect(ganho).connect(saida(c))
      osc.start(t)
      osc.stop(t + dur + 0.12)
      t += dur
    }
    t += 0.06
  }
}
