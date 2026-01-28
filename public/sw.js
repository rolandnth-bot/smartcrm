/**
 * SmartCRM Service Worker
 * Offline támogatás és cache kezelés
 */

const CACHE_NAME = 'smartcrm-v1.1.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache statikus assetek
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((err) => {
        console.warn('Service Worker install hiba:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - régi cache-ek törlése
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - network-first stratégia API hívásokhoz, cache-first statikus assetekhez
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API hívások - network-first (offline esetén cache-ből)
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Ha sikeres, cache-eljük
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Offline esetén cache-ből próbáljuk
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Ha nincs cache, visszaadunk egy offline választ
            return new Response(
              JSON.stringify({ error: 'Offline mód. Nincs internetkapcsolat.' }),
              {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Statikus assetek - cache-first stratégia
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        // Csak GET kéréseket cache-elünk
        if (request.method === 'GET' && response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

