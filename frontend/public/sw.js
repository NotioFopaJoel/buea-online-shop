/* BUEA ONLINE SHOP — service worker (v2) */
const VERSION = 'bos-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html',
];

// Install: pre-cache the app shell (updated each release).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches and take control immediately.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Group image-like URLs so we can cache them aggressively.
function isImageRequest(url) {
  return /\.(png|jpe?g|gif|svg|webp|avif|ico)(\?.*)?$/i.test(url.pathname)
    || /\.(mp4|webm)(\?.*)?$/i.test(url.pathname);
}

// Cache a request (network-first, cache fallback) into the current version.
function cacheFirstFetch(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
        }
        return res;
      })
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cache images (Cloudinary/external + same-origin) so the catalogue keeps
  // showing product photos while offline.
  if (isImageRequest(url)) {
    event.respondWith(cacheFirstFetch(request));
    return;
  }

  // App shell / navigation: network first, offline.html fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((cache) => cache.put('/', copy));
          return res;
        })
        .catch(() => caches.match('/offline.html').then((f) => f || caches.match('/')))
    );
    return;
  }

  // Static assets: cache-first, then network.
  event.respondWith(cacheFirstFetch(request));
});
