'use client';

import {
    AuthTokens,
    clearAuthTokens,
    getAccessToken,
    getRefreshToken,
    saveAuthTokens,
} from '@/lib/auth';
import { useCallback, useEffect, useState } from 'react';

export interface UseAuthReturn {
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    setTokens: (tokens: AuthTokens) => void;
    logout: () => void;
}

/**
 * Hook for managing authentication tokens
 */
export function useAuth(): UseAuthReturn {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    // Load tokens on mount
    useEffect(() => {
        setAccessToken(getAccessToken());
        setRefreshToken(getRefreshToken());
    }, []);

    const setTokens = useCallback((tokens: AuthTokens) => {
        saveAuthTokens(tokens);
        setAccessToken(tokens.accessToken);
        setRefreshToken(tokens.refreshToken);
    }, []);

    const logout = useCallback(() => {
        clearAuthTokens();
        setAccessToken(null);
        setRefreshToken(null);
        // Optionally redirect to login
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }, []);

    return {
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
        setTokens,
        logout,
    };
}
