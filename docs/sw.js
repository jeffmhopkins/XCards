const CACHE_NAME = 'xcards-v2';
const urlsToCache = [
  './',
  './manifest.json',
  './icon-192.png'
];

self.addEventListener('install', event => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Cache core files, but don't fail if some aren't available
        return Promise.allSettled(
          urlsToCache.map(url => cache.add(url).catch(err => {
            console.log('Failed to cache:', url, err);
          }))
        );
      })
  );
});

self.addEventListener('fetch', event => {
  // Only cache same-origin requests, skip Vite HMR and dev server requests
  if (event.request.url.includes('/@vite/') || 
      event.request.url.includes('__vite_ping') ||
      event.request.url.includes('.hot-update.')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // If offline and no cache, return a basic offline page
          if (event.request.destination === 'document') {
            return caches.match('./');
          }
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});