/**
 * Service Worker for Forex Signals & Trading Platform
 * Strict Caching Tiering Architecture:
 * - HTML Documents & Version Manifest: Network-First (never serve stale versions)
 * - Static Assets (hashed JS/CSS, images, fonts): Cache-First / Stale-While-Revalidate
 * - Live Market Data, WebSockets, Orders, USE Predictions, Auth (/api/*): Network-Only
 */

const CACHE_VERSION = 'v2.5.0';
const STATIC_CACHE = `trading-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `trading-dynamic-${CACHE_VERSION}`;

// Static shell assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching partial error:', err);
      });
    })
  );
  // Do not automatically skipWaiting - let client UI control reload
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log('[SW] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message Event (for instant update activation)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NETWORK-ONLY: All API endpoints, WebSockets, and dynamic server queries
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io/') ||
    event.request.method !== 'GET'
  ) {
    return; // Pass through to native network fetch
  }

  // 2. NETWORK-FIRST: HTML documents and version manifest
  if (
    event.request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/admin' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/version.json'
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, copy);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cached HTML if completely offline
          return caches.match(event.request).then((cached) => {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 3. CACHE-FIRST / STALE-WHILE-REVALIDATE: Static assets (JS, CSS, fonts, SVG, PNG)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to revalidate if needed
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {
            // Ignore background revalidation errors when offline
          });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache for next time
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(STATIC_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});
