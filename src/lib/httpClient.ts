import { clearAuthTokens, getAccessToken } from '@/lib/auth';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const baseURL = process.env.BASE_URL;

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

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

httpClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.warn('Unauthorized request detected:', error.config?.url);
            // Clear tokens and redirect to login on 401 without refresh token logic
            clearAuthTokens();
            if (typeof window !== 'undefined') {
                window.location.href = '/';
            }
        }

        return Promise.reject(error);
    }
);

export default httpClient;
