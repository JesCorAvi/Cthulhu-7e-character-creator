/**
 * Service Worker para Cthulhu Character Creator
 * Estrategia: Network First para HTML, Cache First para estáticos
 */

// Incrementa v5 para limpiar la caché antigua de la versión v4
const CACHE_NAME = 'cthulhu-builder-v5'; 
// Como ahora usas un dominio raíz, REPO_NAME debe estar vacío
const REPO_NAME = ''; 

const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png'
];

// INSTALACIÓN
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Intentamos cachear, si falla un recurso no bloqueamos todo el SW
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn("Error en precache:", err));
    })
  );
});

// ACTIVACIÓN: Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH: Estrategias de caché
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET') {
      return;
    }
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  if (url.pathname.includes('/_next/static/')) {
     event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
           const responseToCache = response.clone();
           caches.open(CACHE_NAME).then((cache) => {
             cache.put(event.request, responseToCache);
           });
           return response;
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);
      return cachedResponse || fetchPromise;
    })
  );
});
// ELIMINADA LA LLAVE } EXTRA QUE CAUSABA EL ERROR DE EVALUACIÓN