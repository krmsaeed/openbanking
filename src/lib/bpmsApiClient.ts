import { clearAuthTokens, getAccessToken, getRefreshToken, saveAuthTokens } from '@/lib/auth';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * Create an authenticated axios instance for BPMS API calls
 */
const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;

// Create axios instance
export const bpmsApiClient: AxiosInstance = axios.create({
    baseURL: `${baseURL}/bpms`,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});

// Flag to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Add subscriber to wait for token refresh
 */
function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

/**
 * Notify all subscribers when token is refreshed
 */
function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
    try {
        const refreshToken = getRefreshToken();

        if (!refreshToken) {
            console.error('No refresh token available');
            return null;
        }

        // Call your refresh token endpoint
        const response = await axios.post(`${baseURL}/auth/refresh`, {
            refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;

        // Save new tokens
        saveAuthTokens({
            accessToken,
            refreshToken: newRefreshToken || refreshToken,
            expiresIn,
        });

        return accessToken;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        // Clear tokens and redirect to login
        clearAuthTokens();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        return null;
    }
}

/**
 * Request interceptor - Add Bearer token to all requests
 */
bpmsApiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAccessToken();

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

/**
 * Response interceptor - Handle 401 errors and refresh token
 */
bpmsApiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Wait for the token to be refreshed
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        resolve(bpmsApiClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();

                if (newToken) {
                    isRefreshing = false;
                    onTokenRefreshed(newToken);

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }
                    return bpmsApiClient(originalRequest);
                }
            } catch (refreshError) {
                isRefreshing = false;
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default bpmsApiClient;
