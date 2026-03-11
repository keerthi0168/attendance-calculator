const CACHE_NAME = 'attendance-v3';
const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  const isHttpRequest = requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:';

  if (request.method !== 'GET' || !isHttpRequest) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache only successful same-origin responses
        const responseUrl = new URL(response.url || request.url);
        const isHttpResponse = responseUrl.protocol === 'http:' || responseUrl.protocol === 'https:';
        const isSameOrigin = requestUrl.origin === self.location.origin;

        if (response && response.ok && isSameOrigin && isHttpResponse) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy)).catch(() => {
            // Ignore cache write failures for non-cacheable requests.
          });
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        // For navigation requests, fall back to cached index
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }

        return Response.error();
      })
  );
});
