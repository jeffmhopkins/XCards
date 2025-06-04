
const CACHE_NAME = 'xCards-docs-v1.0.5';
const urlsToCache = [
  '/XCards/',
  '/XCards/index.html',
  '/XCards/icon-192.svg',
  '/XCards/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});