import { DurableObject } from 'cloudflare:workers'
import { CARTAS } from '../src/games/adivinhai/cartas'
import { aplicar, criarPartida } from '../src/games/adivinhai/motor'
import { criarRng } from '../src/games/adivinhai/rng'
import type { Acao, Estado, NivelBot } from '../src/games/adivinhai/types'
import { visaoDe } from '../src/games/adivinhai/visao'
import {
  ALFABETO_CODIGO,
  MAX_JOGADORES,
  MIN_JOGADORES,
  TAMANHO_CODIGO,
  codigoValido,
  type Cliente,
  type JogadorSala,
  type Servidor,
} from '../src/games/adivinhai/online/protocolo'

interface Env {
  SALA: DurableObjectNamespace<Sala>
}

interface Dados {
  jogadores: { id: string; nome: string }[]
  anfitriao: string
  /** partida em andamento: `slots[i]` é o id do jogador que joga como `estado.jogadores[i]` */
  partida: { estado: Estado; slots: string[] } | null
}

interface Anexo {
  id?: string
}

// sala sem ninguém conectado por tanto tempo é apagada
const VALIDADE_MS = 6 * 60 * 60 * 1000

function codigoAleatorio() {
  const b = crypto.getRandomValues(new Uint8Array(TAMANHO_CODIGO))
  return [...b].map((n) => ALFABETO_CODIGO[n % ALFABETO_CODIGO.length]).join('')
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)

    if (url.pathname === '/api/sala' && req.method === 'POST') {
      for (let i = 0; i < 8; i++) {
        const codigo = codigoAleatorio()
        const r = await env.SALA.get(env.SALA.idFromName(codigo)).fetch('https://sala/criar')
        if (r.status === 201) return Response.json({ codigo })
      }
      return new Response('Não foi possível criar a sala', { status: 503 })
    }

    const m = url.pathname.match(/^\/api\/sala\/([A-Z0-9]+)\/ws$/)
    if (m) {
      if (!codigoValido(m[1])) return new Response('Código inválido', { status: 400 })
      return env.SALA.get(env.SALA.idFromName(m[1])).fetch(req)
    }

    return new Response('Não encontrado', { status: 404 })
  },
} satisfies ExportedHandler<Env>

function acaoValida(a: unknown): Acao | null {
  if (typeof a !== 'object' || a === null) return null
  const x = a as Record<string, unknown>
  if (x.tipo === 'escolher' && typeof x.numero === 'number') return { tipo: 'escolher', numero: x.numero }
  if (x.tipo === 'palpitar' && typeof x.texto === 'string') return { tipo: 'palpitar', texto: x.texto.slice(0, 80) }
  if (x.tipo === 'passar') return { tipo: 'passar' }
  if (x.tipo === 'proxima') return { tipo: 'proxima' }
  return null
}

export class Sala extends DurableObject<Env> {
  private async dados() {
    return this.ctx.storage.get<Dados>('sala')
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    if (url.pathname === '/criar') {
      if (await this.dados()) return new Response(null, { status: 409 })
      await this.ctx.storage.put('sala', { jogadores: [], anfitriao: '', partida: null } satisfies Dados)
      await this.ctx.storage.setAlarm(Date.now() + VALIDADE_MS)
      return new Response(null, { status: 201 })
    }

    if (req.headers.get('Upgrade') !== 'websocket') {
      return new Response('Esperava WebSocket', { status: 426 })
    }
    const par = new WebSocketPair()
    this.ctx.acceptWebSocket(par[1])
    return new Response(null, { status: 101, webSocket: par[0] })
  }

  private enviar(ws: WebSocket, msg: Servidor) {
    try {
      ws.send(JSON.stringify(msg))
    } catch {
      // conexão já caiu; o evento de fechamento cuida do resto
    }
  }

  private conectados(ignorar?: WebSocket) {
    const ids = new Set<string>()
    for (const w of this.ctx.getWebSockets()) {
      if (w === ignorar) continue
      const id = (w.deserializeAttachment() as Anexo | null)?.id
      if (id) ids.add(id)
    }
    return ids
  }

  private async transmitir(ignorar?: WebSocket) {
    const d = await this.dados()
    if (!d) return
    const on = this.conectados(ignorar)
    const jogadores: JogadorSala[] = d.jogadores.map((j) => ({ ...j, conectado: on.has(j.id) }))
    const codigo = this.ctx.id.name ?? ''
    const visao = d.partida ? visaoDe(d.partida.estado) : null
    for (const w of this.ctx.getWebSockets()) {
      if (w === ignorar) continue
      const id = (w.deserializeAttachment() as Anexo | null)?.id
      if (!id) continue
      const eu = d.partida ? d.partida.slots.indexOf(id) : -1
      this.enviar(w, { t: 'sala', codigo, voce: id, anfitriao: d.anfitriao, jogadores, visao, eu })
    }
  }

  async webSocketMessage(ws: WebSocket, dado: string | ArrayBuffer) {
    if (typeof dado !== 'string') return
    let msg: Cliente
    try {
      msg = JSON.parse(dado) as Cliente
    } catch {
      return
    }
    await this.ctx.storage.setAlarm(Date.now() + VALIDADE_MS)

    if (msg.t === 'ping') return this.enviar(ws, { t: 'pong' })

    const d = await this.dados()
    if (!d) {
      this.enviar(ws, { t: 'erro', erro: 'inexistente' })
      return ws.close(4004, 'inexistente')
    }

    if (msg.t === 'entrar') {
      if (typeof msg.id !== 'string' || msg.id.length < 8 || msg.id.length > 64) {
        this.enviar(ws, { t: 'erro', erro: 'invalido' })
        return ws.close(4000, 'invalido')
      }
      const nome = String(msg.nome ?? '').trim().slice(0, 16) || 'Jogador'
      const existente = d.jogadores.find((j) => j.id === msg.id)
      if (existente) {
        existente.nome = nome
      } else {
        if (d.partida) {
          this.enviar(ws, { t: 'erro', erro: 'iniciada' })
          return ws.close(4003, 'iniciada')
        }
        if (d.jogadores.length >= MAX_JOGADORES) {
          this.enviar(ws, { t: 'erro', erro: 'cheia' })
          return ws.close(4003, 'cheia')
        }
        d.jogadores.push({ id: msg.id, nome })
        if (!d.anfitriao) d.anfitriao = msg.id
      }
      // uma única conexão por jogador: a mais antiga (aba antiga) é encerrada
      for (const w of this.ctx.getWebSockets()) {
        if (w !== ws && (w.deserializeAttachment() as Anexo | null)?.id === msg.id) w.close(4001, 'substituida')
      }
      ws.serializeAttachment({ id: msg.id } satisfies Anexo)
      await this.ctx.storage.put('sala', d)
      return this.transmitir()
    }

    const id = (ws.deserializeAttachment() as Anexo | null)?.id
    if (!id) return

    if (msg.t === 'iniciar') {
      if (d.partida || id !== d.anfitriao || d.jogadores.length < MIN_JOGADORES) return
      const nivel: NivelBot = msg.nivel === 'facil' || msg.nivel === 'dificil' ? msg.nivel : 'medio'
      const rng = criarRng(crypto.getRandomValues(new Uint32Array(1))[0])
      const usadas = (await this.ctx.storage.get<string[]>('cartas')) ?? []
      const estado = criarPartida(d.jogadores.map((j) => ({ nome: j.nome, bot: null })), CARTAS, rng, { nivel, usadas })
      d.partida = { estado, slots: d.jogadores.map((j) => j.id) }
      await this.ctx.storage.put('cartas', estado.cartasUsadas)
      await this.ctx.storage.put('sala', d)
      return this.transmitir()
    }

    if (msg.t === 'agir') {
      if (!d.partida) return
      const acao = acaoValida(msg.acao)
      const { estado, slots } = d.partida
      const eu = slots.indexOf(id)
      if (!acao || eu < 0) return
      // jogar só na própria vez; avançar a rodada vale para qualquer um
      if (acao.tipo !== 'proxima' && estado.rodada.vez !== eu) return
      const rng = criarRng(crypto.getRandomValues(new Uint32Array(1))[0])
      d.partida.estado = aplicar(estado, acao, CARTAS, rng)
      if (d.partida.estado.cartasUsadas !== estado.cartasUsadas) {
        await this.ctx.storage.put('cartas', d.partida.estado.cartasUsadas)
      }
      await this.ctx.storage.put('sala', d)
      return this.transmitir()
    }

    if (msg.t === 'revanche') {
      if (!d.partida || id !== d.anfitriao || d.partida.estado.vencedor === null) return
      d.partida = null
      await this.ctx.storage.put('sala', d)
      return this.transmitir()
    }

    if (msg.t === 'sair') {
      // no meio da partida, sair só desconecta: o lugar continua guardado para voltar
      if (d.partida) {
        ws.close(1000, 'saiu')
        return
      }
      d.jogadores = d.jogadores.filter((j) => j.id !== id)
      if (d.anfitriao === id) d.anfitriao = d.jogadores[0]?.id ?? ''
      ws.serializeAttachment({} satisfies Anexo)
      await this.ctx.storage.put('sala', d)
      ws.close(1000, 'saiu')
      return this.transmitir(ws)
    }
  }

  async webSocketClose(ws: WebSocket) {
    await this.transmitir(ws)
  }

  async webSocketError(ws: WebSocket) {
    await this.transmitir(ws)
  }

  async alarm() {
    if (this.conectados().size > 0) {
      await this.ctx.storage.setAlarm(Date.now() + VALIDADE_MS)
      return
    }
    await this.ctx.storage.deleteAll()
  }
}
