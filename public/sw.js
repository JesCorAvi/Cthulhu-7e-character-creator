const CACHE_NAME = 'cthulhu-builder-v2'; // Cambia v1 a v2 para forzar actualización
const REPO_NAME = '/cthulhu-7e-character-creator'; // Tu nombre de repo

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        `${REPO_NAME}/`,
        `${REPO_NAME}/manifest.json`,
        `${REPO_NAME}/icons/icon-192.png`
      ]);
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