import { useState } from 'react'
import { Mascote } from '../../../components/Mascote'
import { TelaPartida } from '../TelaPartida'
import type { NivelBot } from '../types'
import { ALFABETO_CODIGO, MAX_JOGADORES, MIN_JOGADORES, TAMANHO_CODIGO, codigoValido, type ErroSala } from './protocolo'
import { criarSala, useSala } from './useSala'

interface Props {
  nome: string
  codigoInicial?: string
  onSair: () => void
}

const MENSAGEM_ERRO: Record<ErroSala, string> = {
  cheia: `Essa sala já tem ${MAX_JOGADORES} jogadores.`,
  inexistente: 'Sala não encontrada. Confira o código ou peça um novo link.',
  invalido: 'Você entrou nessa sala em outra aba ou aparelho.',
  iniciada: 'Essa partida já começou. Só quem já estava na sala pode voltar.',
}

function irParaSala(codigo: string | null) {
  try {
    history.replaceState(null, '', codigo ? `/sala/${codigo}` : '/')
  } catch {
    // ambiente sem history: o link só não aparece na barra
  }
}

export function Online({ nome: nomeInicial, codigoInicial, onSair }: Props) {
  const [nome, setNome] = useState(nomeInicial)
  // quem chega por um link confirma o nome antes de entrar
  const [confirmado, setConfirmado] = useState(!codigoInicial)
  const [codigo, setCodigo] = useState<string | null>(codigoInicial && codigoValido(codigoInicial) ? codigoInicial : null)

  function entrar(c: string) {
    irParaSala(c)
    setCodigo(c)
  }
  function voltar() {
    irParaSala(null)
    setCodigo(null)
  }

  if (codigo && !confirmado) {
    return (
      <main className="config adv-config">
        <button className="voltar" onClick={onSair}>← Adivinhaí</button>
        <div className="config-topo">
          <Mascote pose="detetive" tamanho={120} />
          <div>
            <h1>Sala {codigo}</h1>
            <p className="sub">Você foi convidado</p>
          </div>
        </div>
        <label className="adv-campo">
          <span>Seu nome</span>
          <input value={nome} maxLength={16} placeholder="Você" onChange={(e) => setNome(e.target.value)} />
        </label>
        <button
          className="primario adv-jogar"
          onClick={() => {
            setNome((n) => n.trim() || 'Você')
            setConfirmado(true)
          }}
        >
          Entrar na sala
        </button>
      </main>
    )
  }

  if (!codigo) {
    return (
      <Entrada
        onEntrar={entrar}
        onSair={() => {
          irParaSala(null)
          onSair()
        }}
      />
    )
  }
  return <Espera key={codigo} codigo={codigo} nome={nome} onSair={voltar} />
}

function Entrada({ onEntrar, onSair }: { onEntrar: (c: string) => void; onSair: () => void }) {
  const [texto, setTexto] = useState('')
  const [criando, setCriando] = useState(false)
  const [falha, setFalha] = useState('')
  const valido = codigoValido(texto)

  async function criar() {
    setCriando(true)
    setFalha('')
    try {
      onEntrar(await criarSala())
    } catch {
      setFalha('Não foi possível criar a sala. Verifique a conexão e tente de novo.')
      setCriando(false)
    }
  }

  return (
    <main className="config adv-config">
      <button className="voltar" onClick={onSair}>← Adivinhaí</button>
      <div className="config-topo">
        <Mascote pose="detetive" tamanho={120} />
        <div>
          <h1>Jogar online</h1>
          <p className="sub">Com amigos, por link</p>
        </div>
      </div>

      <button className="primario adv-jogar" onClick={criar} disabled={criando}>
        {criando ? 'Criando...' : 'Criar sala'}
      </button>
      {falha && <p className="adv-erro" role="alert">{falha}</p>}

      <div className="adv-campo">
        <span>Ou entre com um código</span>
        <form
          className="adv-codigo"
          onSubmit={(e) => {
            e.preventDefault()
            if (valido) onEntrar(texto)
          }}
        >
          <input
            value={texto}
            maxLength={TAMANHO_CODIGO}
            placeholder="ABCD"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Código da sala"
            onChange={(e) =>
              setTexto([...e.target.value.toUpperCase()].filter((c) => ALFABETO_CODIGO.includes(c)).join(''))
            }
          />
          <button className="secundario" type="submit" disabled={!valido}>Entrar</button>
        </form>
      </div>
    </main>
  )
}

function Espera({ codigo, nome, onSair }: { codigo: string; nome: string; onSair: () => void }) {
  const { sala, conexao, erro, sair, enviar } = useSala(codigo, nome)
  const [copiado, setCopiado] = useState(false)
  const [nivel, setNivel] = useState<NivelBot>('medio')
  const link = `${location.origin}/sala/${codigo}`

  async function compartilhar() {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Adivinhaí', text: 'Bora jogar Adivinhaí comigo?', url: link })
        return
      }
      await navigator.clipboard.writeText(link)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // compartilhamento cancelado
    }
  }

  function voltar() {
    sair()
    onSair()
  }

  if (erro) {
    return (
      <main className="config adv-config">
        <button className="voltar" onClick={onSair}>← Voltar</button>
        <p className="adv-erro" role="alert">{MENSAGEM_ERRO[erro]}</p>
      </main>
    )
  }

  const souAnfitriao = sala?.anfitriao === sala?.voce

  if (sala?.visao) {
    return (
      <TelaPartida
        visao={sala.visao}
        eu={sala.eu}
        agir={(acao) => enviar({ t: 'agir', acao })}
        onNova={souAnfitriao ? () => enviar({ t: 'revanche' }) : null}
        esperaNova="Aguardando o anfitrião começar outra partida."
        onSair={voltar}
        rotuloSair="← Sair da sala"
        extra={conexao !== 'conectado' ? <p className="adv-espera">Reconectando...</p> : null}
      />
    )
  }
  const podeIniciar = souAnfitriao && (sala?.jogadores.filter((j) => j.conectado).length ?? 0) >= MIN_JOGADORES

  return (
    <main className="config adv-config">
      <button className="voltar" onClick={voltar}>← Sair da sala</button>
      <div className="config-topo">
        <Mascote pose="detetive" tamanho={100} />
        <div>
          <h1>Sala {codigo}</h1>
          <p className="sub">
            {conexao === 'conectado' ? 'Aguardando jogadores' : conexao === 'conectando' ? 'Conectando...' : 'Reconectando...'}
          </p>
        </div>
      </div>

      <button className="primario adv-jogar" onClick={compartilhar}>
        {copiado ? 'Link copiado!' : '🔗 Convidar amigos'}
      </button>

      <div className="adv-campo">
        <span>Jogadores ({sala?.jogadores.length ?? 0}/{MAX_JOGADORES})</span>
        <ul className="adv-lista-sala">
          {sala?.jogadores.map((j) => (
            <li key={j.id} className={j.conectado ? '' : 'off'}>
              <span className="ponto" aria-hidden="true" />
              <b>{j.nome}</b>
              {j.id === sala.voce && <small> (você)</small>}
              {j.id === sala.anfitriao && <small> 👑 anfitrião</small>}
              {!j.conectado && <small> offline</small>}
            </li>
          ))}
        </ul>
      </div>

      {souAnfitriao ? (
        <>
          <div className="adv-campo">
            <span>Dificuldade das cartas</span>
            <div className="chips">
              {(['facil', 'medio', 'dificil'] as const).map((n) => (
                <button key={n} className={'chip' + (nivel === n ? ' ativo' : '')} aria-pressed={nivel === n} onClick={() => setNivel(n)}>
                  {n === 'facil' ? 'Fácil' : n === 'medio' ? 'Médio' : 'Difícil'}
                </button>
              ))}
            </div>
          </div>
          <button className="primario adv-jogar" disabled={!podeIniciar} onClick={() => enviar({ t: 'iniciar', nivel })}>
            Iniciar partida
          </button>
          {!podeIniciar && <small>Precisa de pelo menos {MIN_JOGADORES} jogadores conectados.</small>}
        </>
      ) : (
        <small>O anfitrião inicia a partida quando todos entrarem.</small>
      )}
    </main>
  )
}
