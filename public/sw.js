/**
 * Service Worker para Cthulhu Character Creator
 * Estrategia: Network First para HTML, Cache First para estáticos
 */

// IMPORTANTE: Incrementa esto cada vez que hagas un deploy para forzar la actualización
const CACHE_NAME = 'cthulhu-builder-v4'; 
const REPO_NAME = '/Cthulhu-7e-character-creator';

const ASSETS_TO_CACHE = [
  `${REPO_NAME}/`,
  `${REPO_NAME}/manifest.json`,
  `${REPO_NAME}/icons/icon-192.png`
  // Puedes añadir aquí otros recursos críticos si quieres
];

// INSTALACIÓN: Cacheamos lo básico y forzamos la activación
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza al SW a activarse inmediatamente sin esperar a cerrar pestañas
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// ACTIVACIÓN: Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Borramos cualquier caché que no coincida con la versión actual
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Borrando caché antigua', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Toma el control de los clientes inmediatamente
});

// FETCH: Estrategias de caché inteligentes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Navegación (HTML): Network First (Red primero, luego caché)
  // Esto soluciona el problema de que sirva un HTML viejo con enlaces a CSS/JS rotos
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si hay red, guardamos la copia fresca en caché
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Si no hay red, devolvemos el HTML cacheado (modo offline)
          return caches.match(event.request);
        })
    );
    return;
  }

  // 2. Archivos estáticos de Next.js (_next/static/): Cache First
  // Estos archivos tienen hashes en el nombre (ej: main-abc1234.js), son inmutables.
  if (url.pathname.includes('/_next/static/')) {
     event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Devolvemos caché si existe, si no, vamos a red y cacheamos
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

  // 3. Otros recursos (Imágenes, JSON, etc.): Stale-While-Revalidate
  // Sirve rápido desde caché, pero actualiza en segundo plano para la próxima vez
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});