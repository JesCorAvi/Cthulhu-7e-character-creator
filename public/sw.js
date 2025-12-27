/**
 * Service Worker para Cthulhu Character Creator
 * Estrategia: Network First para HTML, Cache First para estáticos
 */

const CACHE_NAME = 'cthulhu-builder-v5'; 
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
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.warn("Error en precache:", err));
    })
  );
});

// ACTIVACIÓN
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

// FETCH
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. IGNORAR MÉTODOS NO-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. IGNORAR RUTAS DE API Y NEXT-AUTH (CRÍTICO PARA EL LOGIN)
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/image')) {
    return;
  }

  // 3. Estrategia para navegación (HTML)
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

  // 4. Estrategia para archivos estáticos de Next.js
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

  // 5. Estrategia por defecto (Stale-while-revalidate / Cache fallback)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Solo cacheamos respuestas válidas http/https y status 200
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cacheCopy);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse); // Si falla red, devolver caché si existe
      
      return cachedResponse || fetchPromise;
    })
  );
});