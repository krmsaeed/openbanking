// Simple IndexedDB helper for key-value storage

const DB_NAME = 'openbanking-error-catalog-db';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

export type KvRecord = {
    key: string;
    value: unknown;
};

function isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof indexedDB !== 'undefined';
}

export function openDb(): Promise<IDBDatabase> {
    if (!isBrowser()) {
        return Promise.reject(new Error('IndexedDB is not available in this environment'));
    }

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error || new Error('Failed to open IndexedDB'));
        };
    });
}

export async function kvSet(key: string, value: unknown): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ key, value } as KvRecord);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('Failed to store value'));
    });
}

export async function kvGet<T = unknown>(key: string): Promise<T | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
            if (request.result && typeof request.result === 'object') {
                resolve((request.result as KvRecord).value as T);
            } else {
                resolve(null);
            }
        };

        request.onerror = () => reject(request.error || new Error('Failed to read value'));
    });
}

export async function kvDelete(key: string): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(key);

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error || new Error('Failed to delete value'));
    });
}
