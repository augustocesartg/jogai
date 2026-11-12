# Jogaí

Site de jogos para o navegador, pensado para o celular. Por enquanto tem um jogo: **palavras cruzadas** com palavras de história, artes, ciência e geografia.

**Online:** https://jogai.augustocesartg.workers.dev

Funciona como app instalável (PWA) e abre offline depois da primeira visita.

## Recursos
- Tabuleiro gerado a cada partida (grade 11×11, cerca de 10 palavras), sorteando das matérias escolhidas.
- Banco com 1.200 palavras (300 por matéria), cada uma com dica. Palavras já vistas só voltam quando as inéditas acabam.
- Matérias configuráveis (todas por padrão); a escolha fica salva no navegador.
- Palavra certa fica verde e trava; botão para revelar letra.
- Tela de vitória com tempo, acertos e ajudas usadas.
- Estatísticas leves na home (palavras acertadas e dias seguidos), salvas só no navegador, sem login.
- Mascote (Bloco J) com três poses, em SVG.
- PWA: instalável e offline.

## Tecnologias
React 19, Vite, TypeScript, Vitest e oxlint. Sem backend: tudo roda no navegador e é publicado como arquivos estáticos.

## Desenvolvimento
```bash
npm install
npm run dev      # servidor local
npm test         # testes (vitest)
npm run lint     # oxlint
npm run build    # gera dist/
npm run preview  # serve o build (útil para testar o PWA)
```

## Estrutura
```
src/
  App.tsx                         home e navegação entre jogos
  components/Mascote.tsx          mascote em SVG (boas-vindas, escritor, comemorando)
  games/palavras-cruzadas/
    PalavrasCruzadas.tsx          configuração de matérias e início da partida
    Jogo.tsx                      tabuleiro, digitação, dicas e tela de vitória
    gerador.ts                    gera a grade e escolhe as palavras
    banco.ts, data/               banco de palavras
    progresso.ts                  preferências, histórico e estatísticas (localStorage)
    gerador.test.ts               testes do gerador e do banco
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

## Dados no navegador
Guardados em `localStorage`, só no aparelho do jogador:
- `jogai:cruzadas:materias`: matérias escolhidas.
- `jogai:cruzadas:vistas`: palavras já usadas, para evitar repetição.
- `jogai:stats`: palavras acertadas e sequência de dias.

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

## Ideias futuras
Teclado virtual próprio, salvar a partida em andamento, botão de compartilhar o resultado, dificuldade ajustável e novos jogos (caça-palavras e forca já têm cartão "Em breve" na home).
