import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // no dev, a API das salas roda no `wrangler dev` (npm run dev:api)
  server: { proxy: { '/api': { target: 'http://localhost:8787', ws: true } } },
})
