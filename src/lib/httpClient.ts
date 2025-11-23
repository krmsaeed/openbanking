import { clearAuthTokens, getAccessToken } from '@/lib/auth';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.BASE_URL;

// Request deduplication cache
const pendingRequests = new Map<string, Promise<unknown>>();

const getCacheKey = (config: InternalAxiosRequestConfig): string => {
    return `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.data || {})}`;
};

export const httpClient: AxiosInstance = axios.create({
    baseURL: `${baseURL}/bpms`,
    timeout: 30000,
});

export function setupAxiosInterceptors() {
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
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                console.warn('Unauthorized request detected:', error.config?.url);
            }
            return Promise.reject(error);
        }
    );
}

export function createAuthenticatedAxios() {
    const instance = axios.create();

    instance.interceptors.request.use((config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    return instance;
}

httpClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.withCredentials = true;

        // Request deduplication: اگر درخواست دقیق مثل این پنجره دارد، منتظر بمان
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
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized request detected:', error.config?.url);
            clearAuthTokens();
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }

        if (error.config) {
            const cacheKey = getCacheKey(error.config as InternalAxiosRequestConfig);
            pendingRequests.delete(cacheKey);
        }

        return Promise.reject(error);
    }
);

export default httpClient;
