// MedBook Service Worker v3.1.0
const CACHE_NAME = 'medbook-pwa-v3.1'
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/pwa/icon-192.png',
  '/pwa/icon-512.png',
  '/pwa/icon-maskable-192.png',
  '/pwa/icon-maskable-512.png',
  '/pwa/apple-touch-icon.png',
  '/doctors',
  '/login',
  '/signup',
]

// Listen for message from client to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Install Event — pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
  )
})

// Activate Event — cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch Event — Network-first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests and chrome extensions
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return
  }

  // API calls: Network only (never cache sensitive live database responses)
  if (request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Clone and store successful GET responses for offline access
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(async () => {
        // Fallback to cache when offline
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
          return cachedResponse
        }

        // Return root page if navigating
        if (request.mode === 'navigate') {
          const rootCache = await caches.match('/')
          if (rootCache) return rootCache
        }

        return new Response('Offline: Connection unavailable', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        })
      })
  )
})
