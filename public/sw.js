const CACHE = 'fb-v13';
// Hashed build files live in their own cache so trimming images and pages can
// never evict a chunk the cached app shell still needs.
const ASSET_CACHE = 'fb-assets-v1';
const PRE_CACHE = [
  '/',
  '/favicon-32.png',
  '/icon-192.png',
  '/apple-touch-icon.png',
  '/manifest.json',
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

// Old deploys leave their chunks behind. Entries are kept in insertion order, so
// dropping from the front removes the oldest builds first.
const MAX_ASSET_ENTRIES = 160;
async function pruneAssets() {
  const cache = await caches.open(ASSET_CACHE);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - MAX_ASSET_ENTRIES)).map((key) => cache.delete(key)));
}

// Install — cache app shell + force activate immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await cache.addAll(PRE_CACHE);
      // "/index.html" redirects to "/", and a redirected response cannot answer a
      // navigation. Store the shell itself as the offline fallback.
      const shell = await cache.match('/');
      if (shell) await cache.put('/index.html', shell.clone());
    })
  );
  self.skipWaiting();
});

// Activate — remove ALL old caches + trim current
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE && k !== ASSET_CACHE).map((k) => caches.delete(k)))
    ).then(() => trimCache(CACHE)).then(() => pruneAssets())
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
      fetch(request, { cache: 'no-store' })
        .then((res) => {
          // Keep the latest app shell for offline use. Standalone pages such as
          // /press have no app root and must not replace the cached shell.
          if (res && res.status === 200) {
            const clone = res.clone();
            clone.text().then((html) => {
              if (html.includes('id="root"')) {
                return caches.open(CACHE).then((cache) => cache.put('/index.html', new Response(html, { headers: clone.headers })));
              }
              return null;
            }).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match('/index.html'))
        .then((res) => res || new Response('Offline', { status: 503, statusText: 'Offline' }))
    );
    return;
  }

  // Build assets are content-hashed and never change: serve the cached copy and
  // only go to the network for a file not seen before. A missing file comes back
  // from the SPA fallback as HTML with status 200, which must not be stored as a script.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(ASSET_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        const type = res.headers.get('content-type') || '';
        if (res.status === 200 && !type.includes('text/html')) cache.put(request, res.clone());
        return res;
      })
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
  // Default notification data
  let data = {
    title: 'Bugün için tek adım',
    body: 'Planını aç ve sıradaki adımı tamamla.',
    tag: 'fb-daily-plan',
    category: 'general',
    language: 'tr',
  };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) { /* use defaults */ }

  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/favicon-32.png',
    vibrate: [100, 50, 100],
    // Each reminder keeps its own tag from the server; a later reminder must
    // still alert instead of silently replacing the one already in the tray.
    tag: data.tag || 'fb-daily-plan',
    renotify: true,
    data: { url: data.url || '/dashboard', category: data.category || 'general' },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification Click ─────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

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
