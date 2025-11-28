import axios from 'axios';

type RemoteError = {
    id?: number;
    code?: number;
    errorKey?: string;
    message?: string;
    locale?: string;
    isDeleted?: boolean;
    createDateTime?: string;
    updateDateTime?: string;
    [k: string]: unknown;
};

const DB_NAME = 'openbank-errors';
const STORE_NAME = 'errors';
const DEFAULT_ERROR_MESSAGE = 'خطا در پردازش اطلاعات';
let inMemoryByCode: Record<number, string> = {};
let inMemoryByName: Record<string, string> = {};

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !('indexedDB' in window)) {
            reject(new Error('IndexedDB not available'));
            return;
        }
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveToIndexedDB(items: RemoteError[]) {
    try {
        const db = await openDb();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const it of items) {
            const key =
                typeof it.code === 'number'
                    ? `code:${it.code}`
                    : it.errorKey
                        ? `errorKey:${it.errorKey}`
                        : undefined;
            if (!key) continue;
            await new Promise((res, rej) => {
                const r = store.put({ key, payload: it });
                r.onsuccess = () => res(undefined);
                r.onerror = () => rej(r.error);
            });
        }
        tx.commit?.();
    } catch { }
}

async function loadFromIndexedDB(): Promise<void> {
    try {
        const db = await openDb();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const allReq = store.getAll();
        const results: Array<{ key: string; payload: RemoteError }> = await new Promise(
            (res, rej) => {
                allReq.onsuccess = () =>
                    res(allReq.result as unknown as Array<{ key: string; payload: RemoteError }>);
                allReq.onerror = () => rej(allReq.error);
            }
        );

        for (const r of results) {
            if (r.payload.code) {
                const code = r.payload.code;
                if (!isNaN(code) && r.payload.message)
                    inMemoryByCode[code] = String(r.payload.message);
            }
        }
    } catch { }
}

let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initErrorCatalog(): Promise<void> {
    if (isInitialized) {
        return;
    }

    if (initializationPromise) {
        return initializationPromise;
    }

    initializationPromise = (async () => {
        try {
            await loadFromIndexedDB();
            const url = `/api/errors/getAll`;

            const resp = await axios.get(url);
            const data = resp?.data.data;
            if (!data) return;

            const items: RemoteError[] = Array.isArray(data)
                ? data
                : Array.isArray(data.items)
                    ? data.items
                    : [];

            for (const it of items) {
                if (typeof it.code === 'number' && it.message)
                    inMemoryByCode[it.code] = String(it.message);
                if (it.errorKey && it.message)
                    inMemoryByName[String(it.errorKey)] = String(it.message);
            }

            await saveToIndexedDB(items);

            isInitialized = true;
        } catch {
        } finally {
            initializationPromise = null;
        }
    })();

    return initializationPromise;
}

export function getMessageByCode(code: number | undefined, fallback?: string): string | undefined {
    if (typeof code !== 'number') {
        return fallback || DEFAULT_ERROR_MESSAGE;
    }
    return inMemoryByCode[code] ?? fallback ?? DEFAULT_ERROR_MESSAGE;
}
export function getMessageByName(name: string | undefined, fallback?: string): string | undefined {
    if (!name) return fallback;
    return inMemoryByName[name] ?? fallback;
}

export function clearInMemoryCatalog() {
    inMemoryByCode = {};
    inMemoryByName = {};
    isInitialized = false;
    initializationPromise = null;
}

export function isErrorCatalogInitialized(): boolean {
    return isInitialized;
}

const api = {
    initErrorCatalog,
    getMessageByCode,
    getMessageByName,
    clearInMemoryCatalog,
    isErrorCatalogInitialized,
};

export default api;
