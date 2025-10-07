/**
 * Authentication utilities for managing access tokens and refresh tokens
 */

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn?: number; // Token expiry time in seconds
}

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

/**
 * Save authentication tokens to localStorage
 */
export function saveAuthTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

        if (tokens.expiresIn) {
            const expiryTime = Date.now() + tokens.expiresIn * 1000;
            localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
        }
    } catch (error) {
        console.error('Failed to save auth tokens:', error);
    }
}

/**
 * Get the current access token
 */
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
        console.error('Failed to get access token:', error);
        return null;
    }
}

/**
 * Get the current refresh token
 */
export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error('Failed to get refresh token:', error);
        return null;
    }
}

/**
 * Check if the access token is expired
 */
export function isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;

    try {
        const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);
        if (!expiryTime) return false; // If no expiry set, assume token is valid

        return Date.now() >= parseInt(expiryTime, 10);
    } catch (error) {
        console.error('Failed to check token expiry:', error);
        return true;
    }
}

/**
 * Clear all authentication tokens
 */
export function clearAuthTokens(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
        console.error('Failed to clear auth tokens:', error);
    }
}

/**
 * Get auth tokens from server-side (cookies or headers)
 * This is useful for SSR/API routes
 */
export function getServerAuthTokens(request: Request): {
    accessToken: string | null;
    refreshToken: string | null;
} {
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;

    // Try to get refresh token from cookie or custom header
    const cookies = request.headers.get('cookie') || '';
    const refreshTokenMatch = cookies.match(/refresh_token=([^;]+)/);
    const refreshToken = refreshTokenMatch?.[1] || request.headers.get('x-refresh-token') || null;

    return { accessToken, refreshToken };
}
