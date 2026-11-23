# Jogaí

Site de jogos para o navegador, pensado para o celular. Jogos:

- **Palavras Cruzadas**: palavras de história, artes, ciência e geografia.
- **Adivinhaí**: 20 pistas, 1 resposta. Jogo de cartas e tabuleiro, solo contra bots (funciona offline) ou online com amigos.
- **Perguntaí**: roleta de categorias, perguntas de múltipla escolha, curingas e duelos. Solo contra bots (offline) ou online com amigos.

**Online:** https://jogai.augustocesartg.workers.dev

Funciona como app instalável (PWA) e abre offline depois da primeira visita.

## Recursos
**Palavras Cruzadas**
- Tabuleiro denso no modelo das cruzadinhas de jornal, gerado a cada partida (grade 11×11 com blocos pretos, de 10 a 20 palavras, todas com dica de verdade), sorteando das matérias escolhidas. A palavra ativa fica em azul e a célula atual em amarelo.
- Banco com 1.200 palavras (300 por matéria), cada uma com dica. Palavras já vistas só voltam quando as inéditas acabam.
- Matérias configuráveis (todas por padrão); a escolha fica salva no navegador.
- Palavra certa fica verde e trava; botão para revelar letra.
- Estatísticas leves na home (palavras acertadas e dias seguidos), salvas só no navegador, sem login.
- Tela de vitória com resumo de tempo, acertos e ajudas.

**Adivinhaí**
- Tabuleiro de 50 casas, 5 categorias (pessoa, lugar, coisa, ano e mundo digital) e 100 cartas (20 por categoria) com 18 pistas cada.
- 20 números por rodada: pistas e comandos (perca a vez, avance 2, volte 1, escolha outro número).
- Quem acerta avança `20 − números usados`. O Mediador (peão do sistema) avança 1 casa por pista sem acerto; com 3 ou mais jogadores ele anda mais devagar (`taxaMediador` em `motor.ts`), para não vencer demais.
- Cartas com nível de dificuldade (1 a 3). A dificuldade escolhida (fácil, médio ou difícil) define a força dos bots e quais cartas saem mais: no difícil, predominam as menos conhecidas.
- O app lembra as cartas já usadas entre partidas (solo e online compartilham a mesma memória do aparelho) e só repete quando todas saíram. Quando o ciclo recomeça, as 20% mais recentes continuam de fora e voltam primeiro as mais antigas.
- Bots em três níveis, de 0 a 5 por partida. O difícil sempre arrisca um palpite e acerta com cerca de 3 pistas, o médio com 6 a 7 e o fácil com 9 (medido por simulação).
- Mascote detetive no jogo (comemora quando você acerta).
- Efeitos sonoros suaves (ondas senoidais com filtro, sem arquivos, funcionam offline) com botão para silenciar, preferência salva no aparelho.
- Avisos animados que saltam na tela ("Avance 2 casas!", "Volte 1 casa", acerto, erro...), peões que quicam ao chegar e vibração no celular nos seus lances.

**Geral**
- Mascote (Bloco J) com três poses, em SVG.
- PWA: instalável e offline.

## Tecnologias
React 19, Vite, TypeScript, Vitest e oxlint. Os jogos rodam no navegador. O modo online do Adivinhaí usa um Worker do Cloudflare com Durable Objects (uma sala por código) e WebSocket; o resto é publicado como arquivos estáticos.

## Desenvolvimento
```bash
npm install
npm run dev      # servidor local (o modo online precisa também de `npm run dev:api`)
npm run dev:api  # Worker das salas em http://localhost:8787 (rode `npm run build` antes)
npm test         # testes (vitest)
npm run lint     # oxlint
npm run build    # gera dist/
npm run preview  # serve o build (útil para testar o PWA)
```

## Estrutura
```
src/
  App.tsx                         home e navegação entre jogos (cada jogo é carregado sob demanda)
  plataforma/                     o que serve a qualquer jogo
    jogo.ts                       contrato que um jogo implementa para rodar na sala online
    jogos.ts                      jogos com modo online, no navegador
    rng.ts, sons.ts, vistas.ts    sorteio com semente, motor de sons e memória do que já saiu
    online/                       protocolo, conexão (`useSala`) e telas de sala (criar, convite, espera)
  components/Mascote.tsx          mascote em SVG (boas-vindas, escritor, comemorando, detetive)
  games/adivinhai/
    motor.ts                      regras do jogo (função pura, usada no navegador e no servidor)
    visao.ts                      o que o jogador pode ver (sem a resposta), usado no online
    servidor.ts                   o jogo no contrato da sala online (roda no Durable Object)
    online.ts, ComponentesOnline.tsx   o jogo no navegador: opções do anfitrião e tela da partida online
    TelaPartida.tsx               tela da partida (local e online)
    bots.ts                       decisões dos bots (calibradas por simulação)
    sons.ts                       efeitos sonoros com WebAudio
    palpite.ts                    conferência de palpites (sem acento, tolerante a erros)
    cartas/                       cartas por categoria (pessoa.ts, lugar.ts, ...)
    Partida.tsx, Tabuleiro.tsx    telas do jogo
    simulacao.test.ts             simulação de equilíbrio com bots (opcional)
  games/perguntai/
    motor.ts, visao.ts, bots.ts    regras puras, o que o jogador vê e decisões dos bots
    servidor.ts                   o jogo no contrato da sala online
    perguntas/                    banco de perguntas por categoria (+ testes de qualidade)
    Roleta.tsx, TelaPartida.tsx   roleta e tela da partida (solo e online)
    Partida.tsx, Configuracao.tsx solo contra bots
  games/palavras-cruzadas/
    PalavrasCruzadas.tsx          configuração de matérias e início da partida
    Jogo.tsx                      tabuleiro, digitação, dicas e tela de vitória
    gerador.ts                    gera a grade (densa; cai para a esparsa se o banco for pequeno) e escolhe as palavras
    denso.ts                      máscaras (treliça, retangular ou redonda) e preenchimento por busca com retrocesso
    banco.ts, data/               banco de palavras
    progresso.ts                  preferências, histórico e estatísticas (localStorage)
    gerador.test.ts               testes do gerador e do banco
worker/index.ts                   Worker + Durable Object das salas online (genérico)
worker/jogos.ts                   jogos disponíveis nas salas, pelo id
public/                           manifesto, service worker, favicon e ícones
design/                           fontes do ícone e script que gera os PNGs
```

## Banco de palavras
Fica em `src/games/palavras-cruzadas/data/`, com três arquivos por matéria (por exemplo `historia.ts`, `historia2.ts` e `historia3.ts`), no formato `['Resposta', 'dica']`.

O gerador denso (`denso.ts`) sorteia uma máscara de blocos pretos sem áreas brancas de 2x2, extrai as vagas de 3 ou mais letras e as preenche com palavras do banco por busca com retrocesso, preferindo as inéditas. Os testes conferem que toda sequência de 2 ou mais letras é exatamente uma palavra colocada. Medições: `VITE_SIMULAR=1 npx vitest run src/games/palavras-cruzadas/densidade.test.ts`.

Regras, validadas por testes:
- de 3 a 12 letras (espaços, hífens e acentos não contam);
- sem respostas repetidas, nem entre matérias diferentes;
- dica preenchida;
- exatamente 300 palavras por matéria. Ao aumentar o banco, atualize esse número em `gerador.test.ts`.

A digitação ignora acentos e cedilha, mas a exibição mantém a grafia original.

## Adivinhaí: cartas e equilíbrio
O tabuleiro tem 50 casas (`CASAS` em `types.ts`). Cada carta (`src/games/adivinhai/cartas/`, arquivos `*.ts` e `*2.ts` por categoria) tem a resposta, o `nivel` (1 = muito conhecida, 2 = intermediária, 3 = difícil), variações aceitas, chutes errados para os bots e **exatamente 18 pistas** com dificuldade (`f`, `m` ou `d`). A cada rodada, 2 ou 3 comandos entram nos 20 números, em posições sorteadas. Os testes garantem 20 cartas por categoria, 18 pistas e que nenhuma pista contém a resposta.

O motor (`motor.ts`) é puro e não depende de React, para poder rodar também no servidor no modo online.

Para medir o equilíbrio com partidas só de bots:
```bash
VITE_SIMULAR=1 npx vitest run src/games/adivinhai/simulacao.test.ts --reporter=verbose
```

## Dados no navegador
Guardados em `localStorage`, só no aparelho do jogador:
- `jogai:cruzadas:materias`: matérias escolhidas.
- `jogai:cruzadas:vistas`: palavras já usadas, para evitar repetição.
- `jogai:stats`: palavras acertadas e sequência de dias.
- `jogai:adivinhai:config`: nome, número e nível dos bots do Adivinhaí.
- `jogai:som`: som ligado (`1`) ou desligado (`0`) (antes era `jogai:adivinhai:som`, ainda lida).
- `jogai:id`: identificador do jogador nas salas online (antes `jogai:adivinhai:id`, ainda lido).
- `jogai:adivinhai:cartas`: cartas do Adivinhaí já usadas, para não repetir.
- `jogai:perguntai:config` e `jogai:perguntai:perguntas`: configuração e perguntas já vistas do Perguntaí.

## Deploy (Cloudflare)
O site é publicado como Worker com arquivos estáticos (`wrangler.jsonc` aponta para `./dist`, com rotas desconhecidas tratadas como página única).

O repositório está conectado ao Cloudflare: um push na branch `main` dispara o build e publica. Configuração do projeto no Cloudflare:
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

## PWA
- `public/manifest.webmanifest`: nome, cores e ícones.
- `public/sw.js`: service worker. Na instalação guarda a página e todos os arquivos do build (lista `precache.json`, gerada pelo plugin em `vite.config.ts`), inclusive os pedaços de cada jogo carregados sob demanda; depois responde do cache e atualiza em segundo plano (stale-while-revalidate). Os scripts de módulo exigem `ignoreVary` na busca no cache, não remova.
- Se uma atualização não aparecer nos aparelhos, incremente `CACHE` em `public/sw.js`.
- Para regenerar os ícones PNG: `python3 design/gerar-icones.py public`.

## Perguntaí
Segundo jogo, adaptação própria das regras de um jogo de tabuleiro de perguntas (nome, perguntas e visual próprios). Dá para jogar sozinho contra 1 a 5 bots (offline) ou online com amigos, em salas por link com bots completando a sala.

Telas (`src/games/perguntai/`): configuração (nome, bots, dificuldade e duração: curta com 3 fichas, média com 4 ou completa com 6), roleta animada, carta de pergunta com 4 alternativas, placar com trilha e fichas de cada jogador, curingas, escolha de categoria na Coroa, desafio de duelo e tela de fim de partida. A `TelaPartida` só mostra a `Visao` e envia ações, para ser reaproveitada no online. Os bots esperam a roleta parar e "pensam" um pouco antes de agir (mais no duelo, para dar tempo de responder). As perguntas vistas ficam em `jogai:perguntai:perguntas`, e a configuração em `jogai:perguntai:config`. No solo não há tempo limite por pergunta.

**Online:** o `servidor.ts` põe as regras do `motor.ts` no contrato da sala (`JogoServidor`). A sala valida quem pode agir (nunca confia no jogador informado pelo cliente) e recusa ação que não muda nada, para não reiniciar o relógio. Tempos: 15 s para girar, 20 s para escolher a categoria e para responder (inclusive no duelo), 8 s no resultado e bots em 1 a 3,5 s (esperam a roleta). Tempo esgotado: gira, escolhe uma categoria livre ou conta como erro. O duelo é simultâneo: o primeiro a acertar leva a ficha, na ordem em que o servidor recebe as respostas. A `Visao` esconde a alternativa certa até o resultado e a resposta do outro duelista até o fim do duelo; o id da pergunta só vai junto com o resultado, e o aparelho o grava na memória de perguntas vistas.

Motor, visão e bots ficam em `motor.ts`, `visao.ts` e `bots.ts`, e o banco de 600 perguntas em `perguntas/`.

Regras implementadas:
- Roleta com 6 categorias (Ciências, Arte, Esportes, Entretenimento, Geografia e História) e a Coroa. Cada jogador tem uma trilha de 4 casas: 3 de avanço e a Coroa.
- Pergunta com 4 alternativas. Acertar avança uma casa e mantém a vez; errar passa a vez (tempo esgotado conta como erro).
- Na Coroa da trilha, escolhe uma categoria que ainda não tem e responde valendo a ficha: acertando, leva a ficha, a trilha volta a zero e continua jogando; errando, volta ao início da trilha. Tirar a Coroa na roleta vale o mesmo, mas errar só passa a vez.
- Curingas, 1 de cada por jogador e uso único: Bomba (elimina 2 erradas), Chance dupla (segunda tentativa), Tiro extra (gira de novo, antes de responder ou depois de errar) e Passar (troca a pergunta). Um por pergunta, e não valem no duelo.
- Duelo (3 ou mais jogadores): na Coroa, desafia alguém que tenha uma ficha que ele não tem, apostando uma ficha sua que o outro não tem. Os dois respondem à mesma pergunta e quem acertar primeiro leva a ficha; se os dois errarem, nada muda. Em qualquer caso a trilha do desafiante volta a zero.
- Vence quem reunir as 6 fichas (configurável: `fichasParaVencer`, útil para partidas curtas).

Banco de perguntas: 100 por categoria, em `src/games/perguntai/perguntas/` (dois arquivos por categoria, `x.ts` e `x2.ts`, no formato `q(nivel, 'pergunta', 'certa', 'errada 1', 'errada 2', 'errada 3')`, nível 1 = fácil, 2 = média, 3 = difícil). As alternativas são embaralhadas a cada sorteio. O id é um hash do texto: ao editar o texto de uma pergunta, ela passa a contar como nova. Os testes garantem 100 por categoria, 4 alternativas diferentes, texto terminado em `?` sem a resposta dentro, alternativas curtas e uma mistura de níveis. As perguntas evitam fatos que mudam com o tempo.

Para medir duração e equilíbrio com bots (4 jogadores e 6 fichas: cerca de 65 perguntas por partida):
```bash
VITE_SIMULAR=1 npx vitest run src/games/perguntai/simulacao.test.ts --reporter=verbose
```

## Curiosidade do dia e Neste dia

Dois cartões no topo da home, em `src/curiosidades/`.

- **Curiosidade do dia**: banco próprio de 368 itens (categoria, título, resumo, texto, fonte), 92 por categoria, em `dados/<categoria>.ts` e `dados/<categoria>2.ts`, intercalados por `banco.ts` para que dias seguidos tragam assuntos diferentes. A do dia é `banco[dias desde 1970 % tamanho]`, com a data no horário de Brasília, então todo mundo vê a mesma. Para acrescentar, inclua itens mantendo o mesmo número em cada categoria (o teste confere campos, títulos únicos, tamanho do resumo e alternância de categorias).
- **Neste dia**: vem da API da Wikipédia em português (`feed/onthisday/selected/MM/DD`, aceita chamada direta do navegador). O resultado fica em `jogai:nesteDia` por dia; sem internet o cartão não aparece.
- **Saber mais**: abre o ChatGPT em nova aba com a pergunta já preenchida (`chatgpt.com/?q=`).

## Modo online
A sala é genérica: o Durable Object (`worker/index.ts`) cuida de jogadores, reconexão, anfitrião, tempo de vez e jogadas automáticas, e delega as regras ao jogo escolhido (`worker/jogos.ts`, contrato em `src/plataforma/jogo.ts`). Para ligar um jogo novo: implementar `JogoServidor` (puro) e `JogoCliente` (opções do anfitrião e tela da partida) e registrá-los nos dois `jogos.ts`.

Salas por link, para 2 a 6 jogadores (humanos e bots). Criar sala gera um código de 4 letras; o link `/sala/ABCD` leva direto à sala.
- **Sala:** lista de jogadores em tempo real, reconexão automática e anfitrião. O anfitrião escolhe a dificuldade e quantos bots completam a sala (mínimo de 2 jogadores no total) e inicia.
- **Partida:** roda no Durable Object com o mesmo `motor.ts`. O navegador só recebe a `Visao` (`visao.ts`): categoria, pistas já escolhidas e, no fim da rodada, a resposta. As jogadas são validadas no servidor (só joga quem está na vez).
- **Bots:** jogam no servidor, com a mesma lógica do modo solo (`bots.ts`).
- **Tempo de vez:** 30 s para escolher e 30 s para palpitar; esgotado, o servidor escolhe um número ao acaso ou passa. Quem caiu na própria vez joga sozinho depois de 5 s. A próxima rodada começa sozinha após 20 s. Se ninguém estiver conectado, a partida pausa até alguém voltar.
- **Entrada e saída:** quem sai no meio da partida volta pelo link e mantém o lugar; novos jogadores não entram depois do início. No fim, o anfitrião (ou qualquer jogador, se ele sumiu) volta todos à sala.
- **Cartas:** ao entrar, cada aparelho envia a lista de cartas que já viu; ao iniciar, o servidor une as listas de todos os jogadores (`vistas.ts`) e sorteia só entre as que ninguém viu. Ao fim de cada rodada o servidor envia o id da carta (junto com a resposta) e o aparelho a grava na mesma lista do modo solo.
- **Armazenamento:** salas ficam em Durable Objects (SQLite, plano gratuito) e somem após 6 h sem ninguém conectado.

## Ideias futuras
Mais cartas e perguntas (o Perguntaí chega a 150 por categoria), uma identidade visual própria para o Perguntaí (arcade/16 bits foi testada em mockups), teclado virtual nas palavras cruzadas, salvar partida em andamento, botão de compartilhar o resultado e novos jogos (caça-palavras e forca já têm cartão "Em breve" na home).
