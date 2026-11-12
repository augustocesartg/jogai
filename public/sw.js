// Service worker do Jogaí: o app todo funciona offline depois da primeira visita.
// Estratégia: stale-while-revalidate para arquivos do próprio site; navegação cai no index.html em cache.
const CACHE = 'jogai-v1'
const BASE = ['/', '/favicon.svg', '/manifest.webmanifest', '/icon-192.png']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(BASE)).then(() => self.skipWaiting()))
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

  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const chave = req.mode === 'navigate' ? '/' : req
      const emCache = await cache.match(chave)
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
