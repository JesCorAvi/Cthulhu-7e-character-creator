const CACHE_NAME = 'cthulhu-builder-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cacheamos lo mínimo vital
      return cache.addAll(['/', '/manifest.json', '/icons/icon-192.png']);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});