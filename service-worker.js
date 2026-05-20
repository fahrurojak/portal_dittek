const CACHE_NAME = 'dtp-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/assets/css/main.css',
  '/assets/js/main.js',
  '/assets/logo.png',
  '/assets/img/icons/icon-192.svg',
  '/assets/img/icons/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResp => {
      if (cachedResp) return cachedResp;
      return fetch(event.request).then(response => {
        // Optionally cache new requests
        return caches.open(CACHE_NAME).then(cache => {
          try { cache.put(event.request, response.clone()); } catch (e) { /* ignore opaque */ }
          return response;
        });
      }).catch(() => {
        // Fallback to offline page for navigation requests
        if (event.request.mode === 'navigate') return caches.match('/offline.html');
      });
    })
  );
});
