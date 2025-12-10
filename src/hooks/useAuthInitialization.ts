'use client';

import { getAccessToken, getNationalId, initializeAuth } from '@/lib/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';

interface UseAuthInitializationOptions {
    requireAuth?: boolean;
}

interface UseAuthInitializationReturn {
    isInitialized: boolean;
    isLoading: boolean;
    error: string | null;
}

export const useAuthInitialization = ({
    requireAuth = true,
}: UseAuthInitializationOptions = {}): UseAuthInitializationReturn => {
    const searchParams = useSearchParams();
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const route = useRouter();
    const validateAndCleanNationalId = useCallback(async (code: string) => {
        try {
            const { isValidNationalId, cleanNationalId } = await import(
                '@/lib/nationalIdValidator'
            );
            const cleanedNationalId = cleanNationalId(code);

            if (!isValidNationalId(cleanedNationalId)) {
                throw new Error('کد ملی نامعتبر است');
            }

            return cleanedNationalId;
        } catch {
            throw new Error('خطا در اعتبارسنجی کد ملی');
        }
    }, []);

    const initializeAuthentication = useCallback(async () => {
        try {
            setError(null);

            const existingToken = getAccessToken();
            const existingNationalId = getNationalId();

            if (existingToken && existingNationalId) {
                // Token exists - error catalog should already be initialized
                setIsInitialized(true);
                return;
            }

            const token = searchParams.get('token');
            const code = searchParams.get('code');

            if (!token || !code) {
                if (requireAuth) {
                    return;
                }
                setIsInitialized(true);
                return;
            }

            const cleanedNationalId = await validateAndCleanNationalId(code);

            initializeAuth({ token, nationalId: cleanedNationalId });

            // Error catalog is now initialized in initializeAuth
            setIsInitialized(true);

            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            route.push("/")
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'خطای نامشخص در احراز هویت';
            console.error('Auth initialization error:', err);
            setError(errorMessage);

            if (requireAuth) {
                showDismissibleToast(errorMessage, 'error');
            } else {
                setIsInitialized(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [searchParams, requireAuth, route, validateAndCleanNationalId]);

    useEffect(() => {
        initializeAuthentication();
    }, [initializeAuthentication]);

    return {
        isInitialized,
        isLoading,
        error,
    };
};
