# Jogaí

Site de jogos para o navegador, pensado para o celular. Jogos:

- **Palavras Cruzadas**: palavras de história, artes, ciência e geografia.
- **Adivinhaí**: 20 pistas, 1 resposta. Jogo de cartas e tabuleiro, solo contra bots (funciona offline).

**Online:** https://jogai.augustocesartg.workers.dev

Funciona como app instalável (PWA) e abre offline depois da primeira visita.

## Recursos
**Palavras Cruzadas**
- Tabuleiro gerado a cada partida (grade 11×11, cerca de 10 palavras), sorteando das matérias escolhidas.
- Banco com 1.200 palavras (300 por matéria), cada uma com dica. Palavras já vistas só voltam quando as inéditas acabam.
- Matérias configuráveis (todas por padrão); a escolha fica salva no navegador.
- Palavra certa fica verde e trava; botão para revelar letra.
- Estatísticas leves na home (palavras acertadas e dias seguidos), salvas só no navegador, sem login.
- Tela de vitória com resumo de tempo, acertos e ajudas.

**Adivinhaí**
- Tabuleiro de 40 casas, 5 categorias (pessoa, lugar, coisa, ano e mundo digital) e 100 cartas (20 por categoria) com 18 pistas cada.
- 20 números por rodada: pistas e comandos (perca a vez, avance 2, volte 1, escolha outro número).
- Quem acerta avança `20 − números usados`. O Mediador (peão do sistema) avança 1 casa por pista sem acerto.
- Cartas com nível de dificuldade (1 a 3). A dificuldade escolhida (fácil, médio ou difícil) define a força dos bots e quais cartas saem mais: no difícil, predominam as menos conhecidas.
- O app lembra as cartas já usadas entre partidas e só repete quando todas saíram.
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
  App.tsx                         home e navegação entre jogos
  components/Mascote.tsx          mascote em SVG (boas-vindas, escritor, comemorando, detetive)
  games/adivinhai/
    motor.ts                      regras do jogo (função pura, usada no navegador e no servidor)
    visao.ts                      o que o jogador pode ver (sem a resposta), usado no online
    TelaPartida.tsx               tela da partida (local e online)
    bots.ts                       decisões dos bots (calibradas por simulação)
    sons.ts                       efeitos sonoros com WebAudio
    palpite.ts                    conferência de palpites (sem acento, tolerante a erros)
    cartas/                       cartas por categoria (pessoa.ts, lugar.ts, ...)
    Partida.tsx, Tabuleiro.tsx    telas do jogo
    simulacao.test.ts             simulação de equilíbrio com bots (opcional)
  games/palavras-cruzadas/
    PalavrasCruzadas.tsx          configuração de matérias e início da partida
    Jogo.tsx                      tabuleiro, digitação, dicas e tela de vitória
    gerador.ts                    gera a grade e escolhe as palavras
    banco.ts, data/               banco de palavras
    progresso.ts                  preferências, histórico e estatísticas (localStorage)
    gerador.test.ts               testes do gerador e do banco
worker/index.ts                   Worker + Durable Object das salas online
  games/adivinhai/online/           protocolo (compartilhado), hook de conexão e telas da sala
public/                           manifesto, service worker, favicon e ícones
design/                           fontes do ícone e script que gera os PNGs
```

## Banco de palavras
Fica em `src/games/palavras-cruzadas/data/`, com três arquivos por matéria (por exemplo `historia.ts`, `historia2.ts` e `historia3.ts`), no formato `['Resposta', 'dica']`.

Regras, validadas por testes:
- de 3 a 12 letras (espaços, hífens e acentos não contam);
- sem respostas repetidas, nem entre matérias diferentes;
- dica preenchida;
- exatamente 300 palavras por matéria. Ao aumentar o banco, atualize esse número em `gerador.test.ts`.

A digitação ignora acentos e cedilha, mas a exibição mantém a grafia original.

## Adivinhaí: cartas e equilíbrio
O tabuleiro tem 40 casas (`CASAS` em `types.ts`). Cada carta (`src/games/adivinhai/cartas/`, arquivos `*.ts` e `*2.ts` por categoria) tem a resposta, o `nivel` (1 = muito conhecida, 2 = intermediária, 3 = difícil), variações aceitas, chutes errados para os bots e **exatamente 18 pistas** com dificuldade (`f`, `m` ou `d`). A cada rodada, 2 ou 3 comandos entram nos 20 números, em posições sorteadas. Os testes garantem 20 cartas por categoria, 18 pistas e que nenhuma pista contém a resposta.

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
- `jogai:adivinhai:som`: som ligado (`1`) ou desligado (`0`).
- `jogai:adivinhai:cartas`: cartas do Adivinhaí já usadas, para não repetir.

## Deploy (Cloudflare)
O site é publicado como Worker com arquivos estáticos (`wrangler.jsonc` aponta para `./dist`, com rotas desconhecidas tratadas como página única).

O repositório está conectado ao Cloudflare: um push na branch `main` dispara o build e publica. Configuração do projeto no Cloudflare:
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

## PWA
- `public/manifest.webmanifest`: nome, cores e ícones.
- `public/sw.js`: service worker. Na instalação guarda a página e os JS/CSS que ela usa; depois responde do cache e atualiza em segundo plano (stale-while-revalidate). Os scripts de módulo exigem `ignoreVary` na busca no cache, não remova.
- Se uma atualização não aparecer nos aparelhos, incremente `CACHE` em `public/sw.js`.
- Para regenerar os ícones PNG: `python3 design/gerar-icones.py public`.

## Modo online (em construção)
- **Etapa 1 (pronta):** criar sala (código de 4 letras), entrar pelo link `/sala/ABCD`, lista de jogadores em tempo real, reconexão automática e anfitrião.
- **Etapa 2 (pronta):** o anfitrião escolhe a dificuldade e inicia (mínimo de 2 jogadores). A partida roda no Durable Object com o mesmo `motor.ts`; o navegador só recebe a `Visao` (`visao.ts`): categoria, pistas já escolhidas e, no fim da rodada, a resposta. As jogadas são validadas no servidor (só joga quem está na vez). Quem sai no meio da partida pode voltar pelo link; novos jogadores não entram depois do início. No fim, o anfitrião volta todos à sala para outra partida.
- **Etapa 3 (a fazer):** timer de vez (hoje a partida espera quem estiver offline), bots completando a sala e acabamento.

Salas ficam em Durable Objects (SQLite, plano gratuito) e somem após 6 h sem ninguém conectado. As cartas já usadas na sala são lembradas no servidor.

## Ideias futuras
Mais cartas, teclado virtual nas palavras cruzadas, salvar partida em andamento, botão de compartilhar o resultado e novos jogos (caça-palavras e forca já têm cartão "Em breve" na home).
