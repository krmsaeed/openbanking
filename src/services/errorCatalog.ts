import { kvDelete, kvGet, kvSet } from '@/lib/indexedDbClient';

const DEFAULT_ERROR_MESSAGE = 'خطا در پردازش اطلاعات';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = 'error_catalog_cache';
const TIMESTAMP_KEY = 'error_catalog_timestamp';

export type ErrorCatalogEntry = {
    id?: number;
    code?: number;
    errorKey?: string;
    message?: string;
    locale?: string;
};

export type DigitalMessageException = {
    code?: number;
    errorCode?: number;
    errorKey?: string;
    message?: string;
};

let cacheByCode: Map<number, ErrorCatalogEntry> = new Map();
let cacheByKey: Map<string, ErrorCatalogEntry> = new Map();
let cacheTimestamp: number | null = null;
let inflight: Promise<void> | null = null;

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

async function loadFromStorage(): Promise<ErrorCatalogEntry[] | null> {
    if (!isBrowser()) return null;

    try {
        const [stored, timestamp] = await Promise.all([
            kvGet<ErrorCatalogEntry[]>(STORAGE_KEY),
            kvGet<number>(TIMESTAMP_KEY),
        ]);

        if (!stored || !timestamp) return null;

        if (Date.now() - timestamp > CACHE_TTL_MS) {
            // Expired
            await Promise.all([kvDelete(STORAGE_KEY), kvDelete(TIMESTAMP_KEY)]);
            return null;
        }

        return stored;
    } catch (error) {
        console.warn('Failed to load error catalog from IndexedDB:', error);
        return null;
    }
}

async function saveToStorage(entries: ErrorCatalogEntry[]): Promise<void> {
    if (!isBrowser()) return;

    try {
        await Promise.all([
            kvSet(STORAGE_KEY, entries),
            kvSet(TIMESTAMP_KEY, Date.now()),
        ]);
    } catch (error) {
        console.warn('Failed to save error catalog to IndexedDB:', error);
    }
}

function needsRefresh(force?: boolean): boolean {
    if (force) return true;
    if (!cacheTimestamp) return true;
    return Date.now() - cacheTimestamp > CACHE_TTL_MS;
}

function resolveApiEndpoint(): string {
    if (typeof window !== 'undefined') {
        return '/api/errors/getAll';
    }

    const origin =
        process.env.NEXT_PUBLIC_BASE_URL ||
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
        process.env.ORIGIN_URL ||
        'http://localhost:3000';

    return `${origin.replace(/\/$/, '')}/api/errors/getAll`;
}

async function fetchCatalogEntries(): Promise<ErrorCatalogEntry[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
        const response = await fetch(resolveApiEndpoint(), {
            cache: 'no-store',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Failed to fetch error catalog (${response.status})`);
        }

        const payload = await response.json();
        if (Array.isArray(payload)) {
            return payload;
        }
        if (payload && typeof payload === 'object' && Array.isArray(payload.items)) {
            return payload.items;
        }
        return [];
    } catch (error) {
        clearTimeout(timeoutId);
        if ((error as Error).name === 'AbortError') {
            throw new Error('Error catalog fetch timeout');
        }
        throw error;
    }
}

function populateCache(entries: ErrorCatalogEntry[]): void {
    cacheByCode = new Map();
    cacheByKey = new Map();

    for (const entry of entries) {
        if (typeof entry.code === 'number' && entry.message) {
            cacheByCode.set(entry.code, entry);
        }
        if (entry.errorKey && entry.message) {
            cacheByKey.set(entry.errorKey, entry);
        }
    }

    cacheTimestamp = Date.now();
    // Fire and forget persistence into IndexedDB
    void saveToStorage(entries);
}

export async function initErrorCatalog(options?: { forceRefresh?: boolean }): Promise<void> {
    const force = options?.forceRefresh ?? false;

    // Try to load from storage first
    if (!force && cacheByCode.size === 0) {
        const stored = await loadFromStorage();
        if (stored && stored.length > 0) {
            populateCache(stored);
            console.log(`Error catalog loaded from IndexedDB with ${stored.length} entries`);
            return;
        }
    }

    if (!needsRefresh(force)) {
        return;
    }

    if (inflight) {
        return inflight;
    }

    inflight = (async () => {
        try {
            const entries = await fetchCatalogEntries();
            populateCache(entries);
            console.log(`Error catalog fetched and cached with ${entries.length} entries`);
        } catch (error) {
            console.error('Failed to initialize error catalog:', error);
            // Don't throw - let the calling code handle fallback
            // but clear inflight so retry is possible
            inflight = null;
            throw error;
        } finally {
            if (inflight) {
                inflight = null;
            }
        }
    })();

    return inflight;
}

export function isErrorCatalogInitialized(): boolean {
    return cacheByCode.size > 0;
}

export function getMessageByCode(code: number | undefined, fallback?: string): string {
    if (typeof code !== 'number') {
        return fallback || DEFAULT_ERROR_MESSAGE;
    }
    return cacheByCode.get(code)?.message || fallback || DEFAULT_ERROR_MESSAGE;
}

export function getMessageByName(name: string | undefined, fallback?: string): string {
    if (!name) {
        return fallback || DEFAULT_ERROR_MESSAGE;
    }
    return cacheByKey.get(name)?.message || fallback || DEFAULT_ERROR_MESSAGE;
}

export function clearErrorCatalogCache(): void {
    cacheByCode.clear();
    cacheByKey.clear();
    cacheTimestamp = null;

    if (isBrowser()) {
        // Best-effort async cleanup of IndexedDB
        void Promise.all([
            kvDelete(STORAGE_KEY),
            kvDelete(TIMESTAMP_KEY),
        ]).catch((error) => {
            console.warn('Failed to clear error catalog from IndexedDB:', error);
        });
    }
}

const errorCatalogService = {
    initErrorCatalog,
    isErrorCatalogInitialized,
    getMessageByCode,
    getMessageByName,
    clearErrorCatalogCache,
};

export default errorCatalogService;

export async function resolveCatalogMessage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input?: any,
    fallback?: string
): Promise<string> {
    let exception: DigitalMessageException | undefined = input;

    if (input && typeof input === 'object') {
        if ('digitalMessageException' in input) {
            exception = input.digitalMessageException;
        } else if (input.data && typeof input.data === 'object' && 'digitalMessageException' in input.data) {
            exception = input.data.digitalMessageException;
        }
    }

    const providedMessage = exception?.message?.trim();
    const code = exception?.code ?? exception?.errorCode;
    const key = exception?.errorKey;

    if (code === -1) {
        return 'خطای برقراری ارتباط';
    }

    try {
        await initErrorCatalog();
    } catch (error) {
        console.warn('Failed to initialize error catalog on client:', error);
    }

    if (typeof code === 'number') {
        const mappedByCode = getMessageByCode(code, providedMessage);
        if (mappedByCode) {
            return mappedByCode;
        }
    }

    if (key) {
        const mappedByKey = getMessageByName(key, providedMessage);
        if (mappedByKey) {
            return mappedByKey;
        }
    }

    return providedMessage || fallback || DEFAULT_ERROR_MESSAGE;
}
