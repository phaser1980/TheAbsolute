const CACHE = 'the-absolute-v3';
const CORE = [
  './',
  './index.html',
  './assets/styles.css',
  './assets/v2.css',
  './assets/icon.svg',
  './data/pages.js',
  './js/app.js',
  './js/v2.js',
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const isDocument = event.request.mode === 'navigate';
  const isSourcePdf = url.pathname.endsWith('/assets/source/gateway-process.pdf');

  if (isDocument || isSourcePdf) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok && !isSourcePdf) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
