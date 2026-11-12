# Jogaí

Site de jogos em React + Vite. Primeiro jogo: palavras cruzadas (história, artes, ciência e geografia).

## Desenvolvimento
```
npm install
npm run dev      # servidor local
npm test         # testes (vitest)
npm run build    # gera dist/
```

## Banco de palavras
Arquivos em `src/games/palavras-cruzadas/data/` (`['Resposta', 'dica']`). Respostas: 3 a 12 letras; acentos são ignorados na digitação. O teste valida duplicadas e tamanhos.

## Deploy gratuito (Cloudflare Pages)
1. Suba o repositório no GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
3. Build command: `npm run build` · Output directory: `dist`.

## PWA
O site é instalável e funciona offline depois da primeira visita (`public/manifest.webmanifest`, `public/sw.js`). Para regenerar os ícones PNG: `python3 design/gerar-icones.py public`. Ao mudar arquivos que precisam invalidar o cache de forma forçada, incremente `CACHE` em `public/sw.js`.
