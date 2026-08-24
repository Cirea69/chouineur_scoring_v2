// Service worker minimal pour enregistrer l'application en mode PWA/offline
const CACHE_NAME = 'chouineur-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // En cas d'échec sur certains assets locaux lors du dev, l'installation n'est pas bloquée
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Stratégie Network-first avec fallback Cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Optionnel : mettre en cache les requêtes de pages valides
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
