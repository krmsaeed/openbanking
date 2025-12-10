const RUNTIME_CACHE = 'pwa-runtime-v1';
const FETCH_TIMEOUT = 5000;
const VERSION_CACHE = 'version-cache-v1';
const VERSION_EXPIRY = 60000; // 1 minute

function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[SW ${timestamp}] ${level.toUpperCase()}: ${message}`;
    if (data) {
        console[level](logMessage, data);
    } else {
        console[level](logMessage);
    }
}

function createTimeoutPromise(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), ms);
    });
}

function isValidUrlForCaching(url) {
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.protocol === 'chrome-extension:') return false;
    if (url.protocol === 'data:') return false;
    if (url.protocol === 'blob:') return false;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return false;
    return true;
}

function getCacheStrategy(req) {
    const url = new URL(req.url);
    // version.json uses stale-while-revalidate strategy to balance fresh updates with performance
    if (url.pathname === '/version.json') return 'stale-while-revalidate';
    if (url.pathname.startsWith('/api/')) {
        return 'network-first';
    }
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
        return 'cache-first';
    }
    return 'cache-first';
}

async function cleanupOldCaches() {
    try {
        const keys = await caches.keys();
        const oldCaches = keys.filter(key => key !== RUNTIME_CACHE && key !== VERSION_CACHE);
        if (oldCaches.length > 0) {
            log('info', `Cleaning up ${oldCaches.length} old caches`, oldCaches);
            await Promise.all(oldCaches.map(key => caches.delete(key)));
        }
    } catch (error) {
        log('error', 'Failed to cleanup old caches', error);
    }
}

async function enforceCacheSizeLimit(cache) {
    try {
        const keys = await cache.keys();
        if (keys.length > 100) {
            log('info', `Cache size limit reached, removing oldest entries`);
            const entriesToRemove = keys.slice(0, 10);
            await Promise.all(entriesToRemove.map(req => cache.delete(req)));
        }
    } catch (error) {
        log('error', 'Failed to enforce cache size limit', error);
    }
}

self.addEventListener('install', () => {
    log('info', 'Service worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    log('info', 'Service worker activating');
    event.waitUntil(
        (async () => {
            try {
                await self.clients.claim();
                log('info', 'Service worker claimed all clients');
            } catch (error) {
                log('error', 'Failed to claim clients', error);
            }
            await cleanupOldCaches();
        })()
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    let url;
    try {
        url = new URL(req.url);
    } catch {
        log('warn', 'Invalid URL in request', req.url);
        return;
    }
    if (!isValidUrlForCaching(url)) {
        log('debug', 'Skipping invalid URL for caching', url.href);
        return;
    }
    const strategy = getCacheStrategy(req);
    log('debug', `Using ${strategy} strategy for ${url.pathname}`);
    event.respondWith(
        (async () => {
            try {
                if (strategy === 'stale-while-revalidate') {
                    const versionCache = await caches.open(VERSION_CACHE);
                    return await handleStaleWhileRevalidate(req, versionCache);
                }

                const cache = await caches.open(RUNTIME_CACHE);
                if (strategy === 'network-first') {
                    return await handleNetworkFirst(req, cache);
                } else {
                    return await handleCacheFirst(req, cache);
                }
            } catch (error) {
                log('error', 'Fetch handler failed', error);
                return new Response('Service unavailable', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: { 'Content-Type': 'text/plain' }
                });
            }
        })()
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        log('info', 'Received cache clear request');
        event.waitUntil(
            (async () => {
                try {
                    const keys = await caches.keys();
                    await Promise.all(keys.map(key => caches.delete(key)));
                    log('info', 'All caches cleared');
                    event.ports[0]?.postMessage({ success: true });
                } catch (error) {
                    log('error', 'Failed to clear caches', error);
                    event.ports[0]?.postMessage({ success: false, error: error.message });
                }
            })()
        );
    }
});

self.addEventListener('error', (event) => {
    log('error', 'Service worker error', event.error);
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: 'SW_ERROR', error: event.error?.message });
        });
    });
});

self.addEventListener('unhandledrejection', (event) => {
    log('error', 'Unhandled promise rejection in SW', event.reason);
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: 'SW_ERROR', error: event.reason?.message || 'Unhandled rejection' });
        });
    });
});

async function handleNetworkFirst(req, cache) {
    try {
        const fetchPromise = fetch(req);
        const timeoutPromise = createTimeoutPromise(FETCH_TIMEOUT);
        const res = await Promise.race([fetchPromise, timeoutPromise]);
        if (res && res.ok) {
            try {
                await cache.put(req, res.clone());
                await enforceCacheSizeLimit(cache);
                log('debug', 'Cached network response', req.url);
            } catch (cacheError) {
                log('warn', 'Failed to cache response', cacheError);
            }
        }
        return res;
    } catch (networkError) {
        log('debug', 'Network request failed, trying cache', networkError.message);
        try {
            const cached = await cache.match(req);
            if (cached) {
                log('info', 'Serving from cache (network-first fallback)', req.url);
                return cached;
            }
        } catch (cacheError) {
            log('error', 'Cache fallback also failed', cacheError);
        }
        throw networkError;
    }
}

async function handleStaleWhileRevalidate(req, cache) {
    const cacheKey = req.clone();

    try {
        const cached = await cache.match(cacheKey);
        if (cached) {
            // Check if cached response is fresh (within VERSION_EXPIRY)
            const cacheDate = cached.headers.get('date');
            const isFresh = cacheDate && (Date.now() - new Date(cacheDate).getTime()) < VERSION_EXPIRY;

            if (isFresh) {
                log('debug', 'Serving fresh cached version.json', req.url);
                return cached;
            }
        }
    } catch (e) {
        log('debug', 'Cache lookup for version.json failed', e.message);
    }

    // Try to fetch from network in background for stale cache
    try {
        const fetchPromise = fetch(req);
        const timeoutPromise = createTimeoutPromise(2000); // Shorter timeout for version check
        const res = await Promise.race([fetchPromise, timeoutPromise]);

        if (res && res.ok) {
            try {
                await cache.put(cacheKey, res.clone());
                log('debug', 'Updated cached version.json', req.url);
            } catch (cacheError) {
                log('warn', 'Failed to cache version response', cacheError);
            }
        }
        return res;
    } catch (networkError) {
        // If network fails but we have cached version, return it
        const cached = await cache.match(cacheKey);
        if (cached) {
            log('info', 'Network failed for version.json, serving stale cache', req.url);
            return cached;
        }
        log('error', 'Failed to fetch version.json and no cache available', networkError.message);
        throw networkError;
    }
}

async function handleCacheFirst(req, cache) {
    try {
        const cached = await cache.match(req);
        if (cached) {
            log('debug', 'Serving from cache (cache-first)', req.url);
            return cached;
        }
    } catch (cacheError) {
        log('warn', 'Cache lookup failed', cacheError);
    }
    try {
        const fetchPromise = fetch(req);
        const timeoutPromise = createTimeoutPromise(FETCH_TIMEOUT);
        const res = await Promise.race([fetchPromise, timeoutPromise]);
        if (res && res.ok) {
            try {
                await cache.put(req, res.clone());
                await enforceCacheSizeLimit(cache);
                log('debug', 'Cached network response', req.url);
            } catch (cacheError) {
                log('warn', 'Failed to cache response', cacheError);
            }
        }
        return res;
    } catch (networkError) {
        log('error', 'Network request failed, no cache available', networkError);
        throw networkError;
    }
}
