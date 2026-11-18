import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Lista todos os arquivos gerados no build (JS, CSS e os pedaços de cada jogo) para o service worker
// guardá-los de uma vez: assim os jogos carregados sob demanda também funcionam offline.
function precache(): Plugin {
  return {
    name: 'jogai-precache',
    apply: 'build',
    generateBundle(_opcoes, bundle) {
      const arquivos = Object.keys(bundle)
        .filter((f) => f.startsWith('assets/') && !f.endsWith('.map'))
        .map((f) => `/${f}`)
      this.emitFile({ type: 'asset', fileName: 'precache.json', source: JSON.stringify(arquivos) })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), precache()],
  // no dev, a API das salas roda no `wrangler dev` (npm run dev:api)
  server: { proxy: { '/api': { target: 'http://localhost:8787', ws: true } } },
})
