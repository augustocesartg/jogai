import { useCallback, useEffect, useRef, useState } from 'react'
import type { Cliente, ErroSala, Servidor } from './protocolo'

export type Sala = Extract<Servidor, { t: 'sala' }>
export type Conexao = 'conectando' | 'conectado' | 'reconectando'

const CHAVE_ID = 'jogai:adivinhai:id'

export function meuId() {
  try {
    const salvo = localStorage.getItem(CHAVE_ID)
    if (salvo) return salvo
  } catch {
    // sem armazenamento: o id vale só nesta sessão
  }
  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  try {
    localStorage.setItem(CHAVE_ID, id)
  } catch {
    // ignorado
  }
  return id
}

export async function criarSala(): Promise<string> {
  const r = await fetch('/api/sala', { method: 'POST' })
  if (!r.ok) throw new Error('falha ao criar sala')
  return ((await r.json()) as { codigo: string }).codigo
}

// Mantém a conexão com a sala e reconecta sozinho se cair (ex.: celular bloqueou a tela).
export function useSala(codigo: string, nome: string) {
  const [sala, setSala] = useState<Sala | null>(null)
  const [conexao, setConexao] = useState<Conexao>('conectando')
  const [erro, setErro] = useState<ErroSala | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const nomeRef = useRef(nome)
  useEffect(() => {
    nomeRef.current = nome
  }, [nome])
  const encerrado = useRef(false)

  useEffect(() => {
    encerrado.current = false
    let tentativa = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let ping: ReturnType<typeof setInterval> | undefined

    const conectar = () => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws'
      const ws = new WebSocket(`${proto}://${location.host}/api/sala/${codigo}/ws`)
      wsRef.current = ws
      ws.onopen = () => {
        tentativa = 0
        const msg: Cliente = { t: 'entrar', id: meuId(), nome: nomeRef.current }
        ws.send(JSON.stringify(msg))
        clearInterval(ping)
        ping = setInterval(() => ws.readyState === 1 && ws.send(JSON.stringify({ t: 'ping' } satisfies Cliente)), 25000)
      }
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data as string) as Servidor
        if (msg.t === 'sala') {
          setSala(msg)
          setConexao('conectado')
        } else if (msg.t === 'erro') {
          encerrado.current = true
          setErro(msg.erro)
        }
      }
      ws.onclose = (e) => {
        clearInterval(ping)
        if (encerrado.current || wsRef.current !== ws) return
        // 4001: outra aba assumiu o lugar; não disputar a conexão
        if (e.code === 4001) {
          encerrado.current = true
          setErro('invalido')
          return
        }
        setConexao('reconectando')
        timer = setTimeout(conectar, Math.min(8000, 800 * 2 ** tentativa++))
      }
    }
    conectar()

    return () => {
      encerrado.current = true
      clearTimeout(timer)
      clearInterval(ping)
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [codigo])

  const sair = useCallback(() => {
    encerrado.current = true
    const ws = wsRef.current
    if (ws && ws.readyState === 1) ws.send(JSON.stringify({ t: 'sair' } satisfies Cliente))
    else ws?.close()
  }, [])

  const enviar = useCallback((msg: Cliente) => {
    const ws = wsRef.current
    if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg))
  }, [])

  return { sala, conexao, erro, sair, enviar }
}
