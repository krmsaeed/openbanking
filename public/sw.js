const RUNTIME_CACHE = 'pwa-runtime-v1';

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        try { await clients.claim(); } catch { }
        // Optionally clean up old caches here
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k !== RUNTIME_CACHE).map(k => caches.delete(k)));
    })());
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    // Ignore non-GET requests
    if (req.method !== 'GET') return;
    let url;
    try {
        url = new URL(req.url);
    } catch {
        return;
    }
    // Only handle http and https schemes (skip chrome-extension://, file://, about:, etc.)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    event.respondWith((async () => {
        try {
            const cache = await caches.open(RUNTIME_CACHE);
            const cached = await cache.match(req);
            if (cached) return cached;
            const res = await fetch(req);
            // Only cache successful responses
            if (res && res.ok) {
                try {
                    await cache.put(req, res.clone());
                } catch {
                    // ignore caching errors (e.g., opaque responses or disallowed schemes)
                }
            }
            return res;
        } catch {
            try {
                const cache = await caches.open(RUNTIME_CACHE);
                const fallback = await cache.match(req);
                if (fallback) return fallback;
            } catch { }
            return new Response('Service unavailable', { status: 503 });
        }
    })());
});
