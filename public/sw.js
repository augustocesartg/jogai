// Service worker do Jogaí: o app todo funciona offline depois da primeira visita.
// Estratégia: stale-while-revalidate para arquivos do próprio site; navegação cai no index.html em cache.
const CACHE = 'jogai-v4'
const BASE = ['/', '/favicon.svg', '/manifest.webmanifest', '/icon-192.png']

// Guarda a página e todos os arquivos do build (lista em /precache.json, gerada pelo Vite), inclusive os
// pedaços de cada jogo carregados sob demanda, para funcionar offline já na primeira visita.
// Se a lista não existir (ex.: servidor de desenvolvimento), cai nos JS/CSS citados na própria página.
async function precache() {
  const cache = await caches.open(CACHE)
  const res = await fetch('/', { cache: 'reload' })
  const html = await res.clone().text()
  await cache.put('/', res)
  let assets = []
  try {
    const lista = await fetch('/precache.json', { cache: 'reload' })
    if (lista.ok) assets = await lista.json()
  } catch {
    // sem lista: usa a página
  }
  if (assets.length === 0) assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
  await cache.addAll([...BASE.filter((u) => u !== '/'), ...new Set(assets)])
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const chave = req.mode === 'navigate' ? '/' : req
      // ignoreVary: scripts de módulo pedem com cabeçalho Origin e o servidor responde Vary: Origin,
      // o que impediria casar com a cópia guardada no precache
      const emCache = await cache.match(chave, { ignoreVary: true })
      const rede = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(chave, res.clone())
          return res
        })
        .catch(() => undefined)
      return emCache ?? (await rede) ?? Response.error()
    }),
  )
})
