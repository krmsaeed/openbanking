'use client';

import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { initializeAuth } from '@/lib/auth';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

interface ApiResponse {
    data: {
        body: {
            isCustomer: boolean;
            isDeposit: boolean;
        };
        processId: number;
    };
}

interface UseHomeLoaderReturn {
    isLoading: boolean;
    error: string | null;
    retry: () => void;
}

const requestCache: Map<string, Promise<void> | true> = new Map();

export const useHomeLoader = (): UseHomeLoaderReturn => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUserData } = useUser();
    const { nationalId, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const calledRef = useRef(false);

    const makeApiCall = useCallback(
        async (code: string): Promise<void> => {
            const cached = requestCache.get(code);
            if (cached === true) return;
            if (cached && typeof (cached as Promise<void>).then === 'function') {
                return cached as Promise<void>;
            }

            const requestPromise = (async () => {
                try {
                    const response = await axios.post('/api/bpms/send-message', {
                        serviceName: 'virtual-open-deposit',
                        body: { code },
                    });

                    const { data } = response.data as ApiResponse;

                    router.push('/register');
                    setUserData({
                        nationalCode: code,
                        step: 1,
                        processId: data.processId,
                        isCustomer: true,
                    });

                    requestCache.set(code, true);
                } catch (err) {
                    requestCache.delete(code);
                    throw err;
                }
            })();

            requestCache.set(code, requestPromise);
            return requestPromise;
        },
        [router, setUserData]
    );

    const validateAndInitializeAuth = useCallback(async (): Promise<string | null> => {
        try {
            if (!isAuthenticated || !nationalId) {
                const tokenFromUrl = searchParams.get('token');
                const codeFromUrl = searchParams.get('code');

                if (!tokenFromUrl || !codeFromUrl) {
                    throw new Error('اطلاعات احراز هویت در URL یافت نشد');
                }

                const { isValidNationalId, cleanNationalId } = await import(
                    '@/lib/nationalIdValidator'
                );
                const cleanedCode = cleanNationalId(codeFromUrl);

                if (!isValidNationalId(cleanedCode)) {
                    throw new Error('کد ملی نامعتبر است');
                }

                initializeAuth({ token: tokenFromUrl, nationalId: cleanedCode });

                // Clean up URL parameters
                const url = new URL(window.location.href);
                url.searchParams.delete('token');
                window.history.replaceState({}, '', url.toString());

                return cleanedCode;
            }

            return nationalId;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'خطا در احراز هویت';
            throw new Error(errorMessage);
        }
    }, [isAuthenticated, nationalId, searchParams]);

    const initializeLoader = useCallback(async () => {
        if (calledRef.current) return;

        try {
            setError(null);
            setIsLoading(true);

            const codeToUse = await validateAndInitializeAuth();

            if (!codeToUse) {
                throw new Error('کد ملی یافت نشد');
            }

            calledRef.current = true;
            await makeApiCall(codeToUse);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'خطای نامشخص رخ داده';
            setError(errorMessage);
            toast.error(errorMessage);
            calledRef.current = false;
        } finally {
            setIsLoading(false);
        }
    }, [validateAndInitializeAuth, makeApiCall]);

    const retry = useCallback(() => {
        calledRef.current = false;
        initializeLoader();
    }, [initializeLoader]);

    useEffect(() => {
        initializeLoader();
    }, [initializeLoader]);

    return {
        isLoading,
        error,
        retry,
    };
};
