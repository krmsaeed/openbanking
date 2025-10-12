'use client';

import {
    AuthTokens,
    clearAuthTokens,
    getAccessToken,
    getNationalId,
    saveAuthTokens,
} from '@/lib/auth';
import { useCallback, useEffect, useState } from 'react';

export interface UseAuthReturn {
    accessToken: string | null;
    nationalId: string | null;
    isAuthenticated: boolean;
    setTokens: (tokens: AuthTokens) => void;
    logout: () => void;
}

export function useAuth(): UseAuthReturn {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [nationalId, setNationalId] = useState<string | null>(null);

    useEffect(() => {
        setAccessToken(getAccessToken());
        setNationalId(getNationalId());
    }, []);

    const setTokens = useCallback((tokens: AuthTokens) => {
        saveAuthTokens(tokens);
        setAccessToken(tokens.accessToken);
    }, []);

    const logout = useCallback(() => {
        clearAuthTokens();
        setAccessToken(null);
        setNationalId(null);

        if (typeof window !== 'undefined') {
            window.location.href = '/register';
        }
    }, []);

    return {
        accessToken,
        nationalId,
        isAuthenticated: !!(accessToken && nationalId),
        setTokens,
        logout,
    };
}
