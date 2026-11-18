import { DurableObject } from 'cloudflare:workers'
import { criarRng } from '../src/plataforma/rng'
import { unirVistas } from '../src/plataforma/vistas'
import {
  ALFABETO_CODIGO,
  MAX_JOGADORES,
  TAMANHO_CODIGO,
  codigoValido,
  type Cliente,
  type JogadorSala,
  type Servidor,
} from '../src/plataforma/online/protocolo'
import { JOGOS } from './jogos'

interface Env {
  SALA: DurableObjectNamespace<Sala>
}

interface Dados {
  /** id do jogo que roda nesta sala (chave de `JOGOS`) */
  jogo: string
  jogadores: { id: string; nome: string }[]
  anfitriao: string
  /** partida em andamento: `slots[i]` é o id do jogador que joga como jogador `i` do jogo ('' = bot) */
  partida: { estado: unknown; slots: string[]; prazo: number | null } | null
  /** ids já vistos por cada jogador (enviados pelo aparelho dele), do mais antigo ao mais recente */
  vistas: Record<string, string[]>
  /** quando a sala é apagada se ninguém estiver conectado */
  expira: number
}

interface Anexo {
  id?: string
}

// sala sem ninguém conectado por tanto tempo é apagada
const VALIDADE_MS = 6 * 60 * 60 * 1000
const TEMPO_VEZ_MS = 30_000
/** jogador desconectado na vez joga sozinho depois desta pausa curta */
const TEMPO_OFFLINE_MS = 5_000
/** depois de uma rodada, a próxima começa sozinha se ninguém tocar */
const TEMPO_PROXIMA_MS = 20_000

function codigoAleatorio() {
  const b = crypto.getRandomValues(new Uint8Array(TAMANHO_CODIGO))
  return [...b].map((n) => ALFABETO_CODIGO[n % ALFABETO_CODIGO.length]).join('')
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)

    if (url.pathname === '/api/sala' && req.method === 'POST') {
      const corpo = (await req.json().catch(() => ({}))) as { jogo?: unknown }
      const jogo = typeof corpo.jogo === 'string' && corpo.jogo in JOGOS ? corpo.jogo : null
      if (!jogo) return new Response('Jogo desconhecido', { status: 400 })
      for (let i = 0; i < 8; i++) {
        const codigo = codigoAleatorio()
        const r = await env.SALA.get(env.SALA.idFromName(codigo)).fetch(`https://sala/criar?jogo=${jogo}`)
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

export class Sala extends DurableObject<Env> {
  private async dados() {
    const d = await this.ctx.storage.get<Dados>('sala')
    // salas criadas antes de existir mais de um jogo
    if (d) {
      d.jogo ??= 'adivinhai'
      d.vistas ??= {}
      d.expira ??= Date.now() + VALIDADE_MS
    }
    return d
  }

  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    if (url.pathname === '/criar') {
      if (await this.dados()) return new Response(null, { status: 409 })
      const jogo = url.searchParams.get('jogo') ?? ''
      if (!(jogo in JOGOS)) return new Response(null, { status: 400 })
      const d: Dados = { jogo, jogadores: [], anfitriao: '', partida: null, vistas: {}, expira: Date.now() + VALIDADE_MS }
      await this.ctx.storage.put('sala', d)
      await this.ctx.storage.setAlarm(d.expira)
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

  private rng() {
    return criarRng(crypto.getRandomValues(new Uint32Array(1))[0])
  }

  /** Define quando a próxima jogada automática acontece (bot, tempo esgotado ou próxima etapa). */
  private definirPrazo(d: Dados, ignorar?: WebSocket) {
    const p = d.partida
    if (!p) return
    const jogo = JOGOS[d.jogo]
    const on = this.conectados(ignorar)
    const agenda = jogo.agenda(p.estado)
    // ninguém olhando: a partida fica parada até alguém voltar
    if (!agenda || !p.slots.some((id) => id && on.has(id))) {
      p.prazo = null
      return
    }
    let espera: number
    if (agenda.tipo === 'proxima') espera = agenda.ms ?? TEMPO_PROXIMA_MS
    else if (agenda.tipo === 'bot') espera = agenda.ms ?? 1000 + Math.random() * 700
    else if (agenda.jogador !== null && !on.has(p.slots[agenda.jogador])) espera = TEMPO_OFFLINE_MS
    else espera = agenda.ms ?? TEMPO_VEZ_MS
    p.prazo = Date.now() + espera
  }

  private async salvar(d: Dados) {
    await this.ctx.storage.put('sala', d)
    const proximo = Math.min(d.expira, d.partida?.prazo ?? Infinity)
    await this.ctx.storage.setAlarm(proximo)
  }

  private async transmitir(ignorar?: WebSocket) {
    const d = await this.dados()
    if (!d) return
    const jogo = JOGOS[d.jogo]
    const on = this.conectados(ignorar)
    const jogadores: JogadorSala[] = d.jogadores.map((j) => ({ ...j, conectado: on.has(j.id) }))
    const codigo = this.ctx.id.name ?? ''
    const prazo = d.partida?.prazo ?? null
    const restante = prazo === null ? null : Math.max(0, prazo - Date.now())
    for (const w of this.ctx.getWebSockets()) {
      if (w === ignorar) continue
      const id = (w.deserializeAttachment() as Anexo | null)?.id
      if (!id) continue
      const eu = d.partida ? d.partida.slots.indexOf(id) : -1
      const visao = d.partida ? jogo.visao(d.partida.estado, eu) : null
      this.enviar(w, { t: 'sala', codigo, jogo: d.jogo, voce: id, anfitriao: d.anfitriao, jogadores, visao, eu, restante })
    }
  }

  /** Aplica uma ação ao jogo, guarda o que já saiu e agenda a próxima jogada automática. Devolve false se a ação foi ignorada. */
  private async jogar(d: Dados, acao: unknown, eu: number, ignorar?: WebSocket) {
    const p = d.partida
    if (!p) return false
    const jogo = JOGOS[d.jogo]
    const depois = jogo.aplicar(p.estado, acao, eu, this.rng())
    if (depois === null) return false
    const antes = jogo.usadas(p.estado)
    p.estado = depois
    const agora = jogo.usadas(depois)
    if (agora !== antes) await this.ctx.storage.put('usadas', agora)
    this.definirPrazo(d, ignorar)
    return true
  }

  async webSocketMessage(ws: WebSocket, dado: string | ArrayBuffer) {
    if (typeof dado !== 'string') return
    let msg: Cliente
    try {
      msg = JSON.parse(dado) as Cliente
    } catch {
      return
    }

    if (msg.t === 'ping') return this.enviar(ws, { t: 'pong' })

    const d = await this.dados()
    if (!d) {
      this.enviar(ws, { t: 'erro', erro: 'inexistente' })
      return ws.close(4004, 'inexistente')
    }
    d.expira = Date.now() + VALIDADE_MS

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
      // quem volta na própria vez (ou com a partida parada) recomeça a contagem
      const p = d.partida
      if (p) {
        const agenda = JOGOS[d.jogo].agenda(p.estado)
        if (p.prazo === null || (agenda?.jogador != null && p.slots[agenda.jogador] === msg.id)) this.definirPrazo(d)
      }
      await this.salvar(d)
      return this.transmitir()
    }

    const id = (ws.deserializeAttachment() as Anexo | null)?.id
    if (!id) return

    if (msg.t === 'vistas') {
      if (Array.isArray(msg.lista)) {
        d.vistas[id] = msg.lista.filter((x) => typeof x === 'string' && x.length <= 80).slice(-200)
        await this.salvar(d)
      }
      return
    }

    if (msg.t === 'iniciar') {
      if (d.partida || id !== d.anfitriao) return
      const jogo = JOGOS[d.jogo]
      // o que qualquer jogador da sala já viu (nos aparelhos deles ou nesta sala) fica por último no sorteio
      const daSala = (await this.ctx.storage.get<string[]>('usadas')) ?? (await this.ctx.storage.get<string[]>('cartas')) ?? []
      const usadas = unirVistas([daSala, ...d.jogadores.map((j) => d.vistas[j.id] ?? [])])
      const estado = jogo.criar(d.jogadores.map((j) => j.nome), msg.opcoes, usadas, this.rng())
      if (estado === null) return
      const total = jogo.jogadores(estado).length
      d.partida = { estado, slots: Array.from({ length: total }, (_, i) => d.jogadores[i]?.id ?? ''), prazo: null }
      await this.ctx.storage.put('usadas', jogo.usadas(estado))
      this.definirPrazo(d)
      await this.salvar(d)
      return this.transmitir()
    }

    if (msg.t === 'agir') {
      if (!d.partida) return
      const eu = d.partida.slots.indexOf(id)
      if (eu < 0) return
      if (!(await this.jogar(d, msg.acao, eu))) return
      await this.salvar(d)
      return this.transmitir()
    }

    if (msg.t === 'revanche') {
      if (!d.partida || !JOGOS[d.jogo].terminou(d.partida.estado)) return
      // se o anfitrião sumiu, qualquer jogador pode reabrir a sala
      if (id !== d.anfitriao && this.conectados().has(d.anfitriao)) return
      d.partida = null
      await this.salvar(d)
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
      await this.salvar(d)
      ws.close(1000, 'saiu')
      return this.transmitir(ws)
    }
  }

  private async aoDesconectar(ws: WebSocket) {
    const d = await this.dados()
    const id = (ws.deserializeAttachment() as Anexo | null)?.id
    const p = d?.partida
    if (d && p && id) {
      const agenda = JOGOS[d.jogo].agenda(p.estado)
      if (agenda?.jogador != null && p.slots[agenda.jogador] === id) {
        // quem estava na vez caiu: a contagem passa a ser a curta
        this.definirPrazo(d, ws)
        await this.salvar(d)
      }
    }
    await this.transmitir(ws)
  }

  async webSocketClose(ws: WebSocket) {
    await this.aoDesconectar(ws)
  }

  async webSocketError(ws: WebSocket) {
    await this.aoDesconectar(ws)
  }

  async alarm() {
    const d = await this.dados()
    if (!d) return
    const agora = Date.now()
    const p = d.partida

    if (p && p.prazo !== null && agora >= p.prazo) {
      const jogo = JOGOS[d.jogo]
      const rng = this.rng()
      const agenda = jogo.agenda(p.estado)
      if (agenda) {
        const acao = jogo.automatico(p.estado, agenda, rng)
        const feito = await this.jogar(d, acao, agenda.jogador ?? -1)
        // ação recusada: tenta de novo mais tarde em vez de travar o alarme
        if (!feito) this.definirPrazo(d)
      } else p.prazo = null
      await this.salvar(d)
      await this.transmitir()
      return
    }

    if (agora >= d.expira) {
      if (this.conectados().size > 0) {
        d.expira = agora + VALIDADE_MS
        await this.salvar(d)
      } else {
        await this.ctx.storage.deleteAll()
      }
      return
    }
    await this.salvar(d)
  }
}
