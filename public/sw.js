// Service worker do Jogaí: o app todo funciona offline depois da primeira visita.
// Estratégia: stale-while-revalidate para arquivos do próprio site; navegação cai no index.html em cache.
const CACHE = 'jogai-v3'
const BASE = ['/', '/favicon.svg', '/manifest.webmanifest', '/icon-192.png']

// Guarda a página e também os JS/CSS com hash que ela referencia, para funcionar offline
// já na primeira visita (o registro do SW acontece depois que esses arquivos foram baixados).
async function precache() {
  const cache = await caches.open(CACHE)
  const res = await fetch('/', { cache: 'reload' })
  const html = await res.clone().text()
  await cache.put('/', res)
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((m) => m[1])
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
