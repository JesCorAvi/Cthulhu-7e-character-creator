const CACHE_NAME = 'cthulhu-builder-v3'; // Subimos versión por si acaso
const REPO_NAME = '/Cthulhu-7e-character-creator';

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