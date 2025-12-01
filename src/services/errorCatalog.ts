const DEFAULT_ERROR_MESSAGE = 'خطا در پردازش اطلاعات';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export type ErrorCatalogEntry = {
    id?: number;
    code?: number;
    errorKey?: string;
    message?: string;
    locale?: string;
};

let cacheByCode: Map<number, ErrorCatalogEntry> = new Map();
let cacheByKey: Map<string, ErrorCatalogEntry> = new Map();
let cacheTimestamp: number | null = null;
let inflight: Promise<void> | null = null;

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
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
        process.env.ORIGIN_URL ||
        'http://localhost:3000';

    return `${origin.replace(/\/$/, '')}/api/errors/getAll`;
}

async function fetchCatalogEntries(): Promise<ErrorCatalogEntry[]> {
    const response = await fetch(resolveApiEndpoint(), {
        cache: 'no-store',
    });

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
}

export async function initErrorCatalog(options?: { forceRefresh?: boolean }): Promise<void> {
    const force = options?.forceRefresh ?? false;
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
        } finally {
            inflight = null;
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
}

const errorCatalogService = {
    initErrorCatalog,
    isErrorCatalogInitialized,
    getMessageByCode,
    getMessageByName,
    clearErrorCatalogCache,
};

export default errorCatalogService;
