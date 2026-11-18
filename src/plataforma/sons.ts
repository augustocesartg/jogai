/** Motor de efeitos sonoros sintetizados com WebAudio: sem arquivos, funcionam offline. Cada jogo traz a sua tabela de notas. */

/** [frequência em Hz, duração em s, volume] — só ondas senoidais, curtas e com volume baixo */
export type Nota = [number, number, number?]

const CHAVE = 'jogai:som'
const CHAVE_ANTIGA = 'jogai:adivinhai:som'

function lerPreferencia(): boolean {
  try {
    const v = localStorage.getItem(CHAVE) ?? localStorage.getItem(CHAVE_ANTIGA)
    return v !== '0'
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

/** Cria a função `tocar` de um jogo a partir da tabela de sons dele. Seguro de chamar sem áudio disponível. */
export function criarSons<S extends string>(tabela: Record<S, Nota[]>) {
  return function tocar(sons: S | S[]) {
    if (!ligado) return
    const c = contexto()
    if (!c) return
    if (c.state === 'suspended') void c.resume()
    let t = c.currentTime + 0.02
    for (const som of Array.isArray(sons) ? sons : [sons]) {
      for (const [freq, dur, volume = 0.09] of tabela[som]) {
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
}
