// MY STELLIVE 2.0 stage 16: same-origin offline shell, staged cache update.
const CACHE_NAME = 'my-stellive-2-phase23-settings-qa2-20261025';
const CACHE_PREFIX = 'my-stellive-';
const ASSETS = ['./index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(async cache => {
    await cache.addAll(['./index.html', './manifest.webmanifest']);
    await Promise.all(ASSETS.slice(2).map(asset => cache.add(asset).catch(() => undefined)));
  }));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = (await caches.keys()).filter(k => k.startsWith(CACHE_PREFIX));
    // Keep the current cache and one previous version for a safer file rollback.
    const old = keys.filter(k => k !== CACHE_NAME);
    for (const key of old.slice(0, Math.max(0, old.length - 1))) await caches.delete(key);
    await self.clients.claim();
  })());
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put('./index.html', response.clone());
        }
        return response;
      } catch (_) {
        return await caches.match('./index.html') || Response.error();
      }
    })());
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
