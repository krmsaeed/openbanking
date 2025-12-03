import { clearAuthTokens, getAccessToken } from '@/lib/auth';
import { clearUserStateCookies } from '@/lib/utils';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

type IDBFactoryWithDatabases = IDBFactory & {
    databases?: () => Promise<Array<{ name?: string }>>;
};

function deleteDatabase(name: string): Promise<void> {
    return new Promise((resolve) => {
        try {
            const request = indexedDB.deleteDatabase(name);
            request.onsuccess = () => resolve();
            request.onerror = () => resolve();
            request.onblocked = () => resolve();
        } catch {
            resolve();
        }
    });
}

async function clearIndexedDBDatabases(): Promise<void> {
    if (typeof indexedDB === 'undefined') return;
    const idbWithListing = indexedDB as IDBFactoryWithDatabases;

    if (typeof idbWithListing.databases === 'function') {
        try {
            const databases = await idbWithListing.databases();
            const deletions = databases
                .map((db) => db.name)
                .filter((name): name is string => Boolean(name))
                .map((name) => deleteDatabase(name));
            await Promise.all(deletions);
            return;
        } catch (error) {
            console.error('Failed to enumerate IndexedDB databases:', error);
        }
    }

    const fallbackDatabases: string[] = [];
    await Promise.all(fallbackDatabases.map((name) => deleteDatabase(name)));
}
function isTimeoutError(error: AxiosError): boolean {
    if (!error) return false;
    if (error.code === 'ECONNABORTED') return true;
    if (error.response?.status === 408) return true;
    return typeof error.message === 'string' && error.message.toLowerCase().includes('timeout');
}
function isServerError(error: AxiosError): boolean {
    return error.response?.status === 500;
}

async function resetClientState(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
        clearAuthTokens();
        clearUserStateCookies();
    } catch (error) {
        console.error('Failed to clear auth cookies after timeout:', error);
    }

    try {
        await clearIndexedDBDatabases();
    } catch (error) {
        console.error('Failed to clear IndexedDB after timeout:', error);
    }

    window.location.href = '/';
}

// Request deduplication cache
const pendingRequests = new Map<string, Promise<unknown>>();

const getCacheKey = (config: InternalAxiosRequestConfig): string => {
    return `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.data || {})}`;
};

export const httpClient: AxiosInstance = axios.create({
    baseURL: '', // برای استفاده از API routes داخلی Next.js
    timeout: 60000,
    withCredentials: true,
});

// Setup global axios interceptors for all axios requests (including direct axios calls)
export function setupAxiosInterceptors() {
    axios.defaults.withCredentials = true;

    axios.interceptors.request.use(
        (config) => {
            const token = getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (response) => {
            // Check for 500 error
            if (response.status === 500) {
                void resetClientState();
            }
            return response;
        },
        (error: AxiosError) => {
            if (isTimeoutError(error) || isServerError(error)) {
                void resetClientState();
            }

            if (error.response?.status === 401) {
                console.warn('Unauthorized request detected:', error.config?.url);
            }
            return Promise.reject(error);
        }
    );
}

// Auto-setup interceptors when module is loaded
if (typeof window !== 'undefined') {
    setupAxiosInterceptors();
}

httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Request deduplication
        const cacheKey = getCacheKey(config);
        if (pendingRequests.has(cacheKey)) {
            return Promise.reject(new Error('Duplicate request deferred'));
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

httpClient.interceptors.response.use(
    (response) => {
        const cacheKey = getCacheKey(response.config as InternalAxiosRequestConfig);
        pendingRequests.delete(cacheKey);

        // Check for 500 error in successful response (when validateStatus allows it)
        if (response.status === 500) {
            void resetClientState();
        }

        return response;
    },
    (error: AxiosError) => {
        // Reset state only on 500 errors
        if (isServerError(error)) {
            void resetClientState();
        }

        if (error.response?.status === 401) {
            console.warn('Unauthorized request detected:', error.config?.url);
            // Don't clear cookies on 401 - let components handle this
        }

        if (error.config) {
            const cacheKey = getCacheKey(error.config as InternalAxiosRequestConfig);
            pendingRequests.delete(cacheKey);
        }

        return Promise.reject(error);
    }
);

export default httpClient;
