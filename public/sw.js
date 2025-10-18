/**
 * @typedef {Object} ExtendableEvent
 * @property {function(Promise<any>): void} waitUntil
 */

/**
 * @typedef {Object} FetchEvent
 * @property {Request} request
 * @property {function(Promise<Response>|Response): void} respondWith
 */

/**
 * @typedef {Object} ServiceWorkerGlobalScope
 * @property {function(): Promise<void>} skipWaiting
 * @property {Object} clients
 * @property {function(): Promise<Array<string>>} keys
 * @property {function(string): Promise<void>} delete
 * @property {function(string): Promise<Cache>} open
 * @property {function(Request): Promise<Response|undefined>} match
 * @property {function(Request, Response): Promise<void>} put
 */

/**
 * @typedef {Object} ExtendableEvent
 * @property {function(Promise<any>): void} waitUntil
 */

/**
 * @typedef {Object} FetchEvent
 * @property {Request} request
 * @property {function(Promise<Response>|Response): void} respondWith
 */

/**
 * @typedef {Object} ServiceWorkerGlobalScope
 * @property {function(): Promise<void>} skipWaiting
 * @property {Object} clients
 * @property {function(): Promise<Array<string>>} keys
 * @property {function(string): Promise<void>} delete
 * @property {function(string): Promise<Cache>} open
 * @property {function(Request): Promise<Response|undefined>} match
 * @property {function(Request, Response): Promise<void>} put
 */

const RUNTIME_CACHE = 'pwa-runtime-v1';
const CACHE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
const FETCH_TIMEOUT = 10000; // 10 seconds

/**
 * Logger utility for service worker
 * @param {string} level
 * @param {string} message
 * @param {any} data
 */
function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[SW ${timestamp}] ${level.toUpperCase()}: ${message}`;
    if (data) {
        console[level](logMessage, data);
    } else {
        console[level](logMessage);
    }
}

/**
 * Create a timeout promise
 * @param {number} ms
 * @returns {Promise<never>}
 */
function createTimeoutPromise(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), ms);
    });
}

/**
 * Check if URL is valid for caching
 * @param {URL} url
 * @returns {boolean}
 */
function isValidUrlForCaching(url) {
    // Skip non-HTTP/HTTPS URLs
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;

    // Skip Chrome extension URLs
    if (url.protocol === 'chrome-extension:') return false;

    // Skip data URLs
    if (url.protocol === 'data:') return false;

    // Skip blob URLs
    if (url.protocol === 'blob:') return false;

    // Skip localhost in production (optional)
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return false;

    return true;
}

/**
 * Get cache strategy based on request
 * @param {Request} req
 * @returns {string}
 */
function getCacheStrategy(req) {
    const url = new URL(req.url);

    // Network-first for API calls
    if (url.pathname.startsWith('/api/')) {
        return 'network-first';
    }

    // Cache-first for static assets
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
        return 'cache-first';
    }

    // Default to cache-first with network fallback
    return 'cache-first';
}

/**
 * Clean up old caches
 * @returns {Promise<void>}
 */
async function cleanupOldCaches() {
    try {
        const keys = await caches.keys();
        const oldCaches = keys.filter(key => key !== RUNTIME_CACHE);

        if (oldCaches.length > 0) {
            log('info', `Cleaning up ${oldCaches.length} old caches`, oldCaches);
            await Promise.all(oldCaches.map(key => caches.delete(key)));
        }
    } catch (error) {
        log('error', 'Failed to cleanup old caches', error);
    }
}

/**
 * Enforce cache size limit
 * @param {Cache} cache
 * @returns {Promise<void>}
 */
async function enforceCacheSizeLimit(cache) {
    try {
        // Note: Cache.size() is not available in all browsers
        // This is a simplified implementation
        const keys = await cache.keys();
        if (keys.length > 100) { // Arbitrary limit
            log('info', `Cache size limit reached, removing oldest entries`);
            // Remove oldest entries (simplified)
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

/**
 * Activate event handler
 * @param {ExtendableEvent} event
 */
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

/**
 * Fetch event handler
 * @param {FetchEvent} event
 */
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Ignore non-GET requests
    if (req.method !== 'GET') return;

    /** @type {URL} */
    let url;
    try {
        url = new URL(req.url);
    } catch (error) {
        log('warn', 'Invalid URL in request', req.url);
        return;
    }

    // Validate URL for caching
    if (!isValidUrlForCaching(url)) {
        log('debug', 'Skipping invalid URL for caching', url.href);
        return;
    }

    const strategy = getCacheStrategy(req);
    log('debug', `Using ${strategy} strategy for ${url.pathname}`);

    event.respondWith(
        (async () => {
            try {
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

/**
 * Handle network-first caching strategy
 * @param {Request} req
 * @param {Cache} cache
 * @returns {Promise<Response>}
 */
async function handleNetworkFirst(req, cache) {
    try {
        // Try network first with timeout
        const fetchPromise = fetch(req);
        const timeoutPromise = createTimeoutPromise(FETCH_TIMEOUT);

        const res = await Promise.race([fetchPromise, timeoutPromise]);

        // Cache successful responses
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
        log('warn', 'Network request failed, trying cache', networkError);

        // Fallback to cache
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

/**
 * Handle cache-first caching strategy
 * @param {Request} req
 * @param {Cache} cache
 * @returns {Promise<Response>}
 */
async function handleCacheFirst(req, cache) {
    try {
        // Try cache first
        const cached = await cache.match(req);
        if (cached) {
            log('debug', 'Serving from cache (cache-first)', req.url);
            return cached;
        }
    } catch (cacheError) {
        log('warn', 'Cache lookup failed', cacheError);
    }

    // Fallback to network
    try {
        const fetchPromise = fetch(req);
        const timeoutPromise = createTimeoutPromise(FETCH_TIMEOUT);

        const res = await Promise.race([fetchPromise, timeoutPromise]);

        // Cache successful responses
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
