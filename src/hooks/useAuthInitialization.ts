'use client';

import { getAccessToken, getNationalId, initializeAuth } from '@/lib/auth';
import { initErrorCatalog, isErrorCatalogInitialized } from '@/services/errorCatalog';
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
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

            if (!isErrorCatalogInitialized()) {
                try {
                    await initErrorCatalog();
                } catch { }
            }

            const existingToken = getAccessToken();
            const existingNationalId = getNationalId();

            if (existingToken && existingNationalId) {
                setIsInitialized(true);
                return;
            }

            const token = searchParams.get('token');
            const code = searchParams.get('code');

            if (!token || !code) {
                if (requireAuth) {
                    router.push('/not-eligible?error=missing_params');
                    return;
                }
                setIsInitialized(true);
                return;
            }

            const cleanedNationalId = await validateAndCleanNationalId(code);

            initializeAuth({ token, nationalId: cleanedNationalId });
            setIsInitialized(true);

            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            window.history.replaceState({}, '', url.toString());
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'خطای نامشخص در احراز هویت';
            console.error('Auth initialization error:', err);
            setError(errorMessage);

            if (requireAuth) {
                showDismissibleToast(errorMessage, 'error');
                router.push('/not-eligible?error=initialization_failed');
            } else {
                setIsInitialized(true);
            }
        } finally {
            setIsLoading(false);
        }
    }, [searchParams, router, requireAuth, validateAndCleanNationalId]);

    useEffect(() => {
        initializeAuthentication();
    }, [initializeAuthentication]);

    return {
        isInitialized,
        isLoading,
        error,
    };
};
