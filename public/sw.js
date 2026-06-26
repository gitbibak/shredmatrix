const CACHE = 'fb-v4';
const PRE_CACHE = [
  '/',
  '/index.html',
  '/favicon-32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.json',
  '/robots.txt',
];

const MAX_ENTRIES = 50;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Trim cache: enforce max entries & expire stale items
async function trimCache(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  const now = Date.now();

  // Remove entries older than MAX_AGE_MS
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const cachedTime = new Date(dateHeader).getTime();
        if (now - cachedTime > MAX_AGE_MS) {
          await cache.delete(request);
        }
      }
    }
  }

  // Enforce max entries (FIFO — remove oldest first)
  const remaining = await cache.keys();
  if (remaining.length > MAX_ENTRIES) {
    const excess = remaining.length - MAX_ENTRIES;
    for (let i = 0; i < excess; i++) {
      await cache.delete(remaining[i]);
    }
  }
}

// Install — cache app shell + force activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

// Activate — remove ALL old caches + trim current
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => trimCache(CACHE))
  );
  self.clients.claim();
});

// Fetch — NETWORK FIRST with SPA navigation fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and external requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // For navigation requests (SPA routes like /dashboard, /auth, etc.)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Cache fresh index.html on every navigation
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put('/index.html', clone));
          }
          return res;
        })
        .catch(() => caches.match('/index.html'))
        .then((res) => res || new Response('Offline', { status: 503, statusText: 'Offline' }))
    );
    return;
  }

  // For JS/CSS assets with hashed names — network only, don't serve stale
  if (url.pathname.match(/\/assets\/.*-[a-zA-Z0-9]{8}\./)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return res;
        })
        .catch(() => caches.match(request))
        .then((res) => res || fetch(request))
    );
    return;
  }

  // For other assets — network first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => {
            cache.put(request, clone);
            trimCache(CACHE);
          });
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});

// ── Push Notification ──────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'Full Balance', body: 'Antrenmanını unutma! 💪', tag: 'fb-push' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) { /* use defaults */ }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon-32.png',
    vibrate: [100, 50, 100],
    tag: data.tag || 'fb-push',
    renotify: true,
    data: { url: data.url || '/dashboard' },
    actions: data.actions || [
      { action: 'open', title: 'Aç' },
      { action: 'dismiss', title: 'Kapat' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification Click ─────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing window if found
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(targetUrl);
    })
  );
});
