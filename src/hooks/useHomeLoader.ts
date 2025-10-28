'use client';

import { useUser } from '@/contexts/UserContext';
import { getCookie } from '@/lib/utils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const calledRef = useRef(false);
    const effectRan = useRef(false);

    const makeApiCall = useCallback(
        async (code: string): Promise<void> => {
            const cached = requestCache.get(code);
            if (cached === true) return;
            if (cached && typeof (cached as Promise<void>).then === 'function') {
                return cached as Promise<void>;
            }

            const requestPromise = (async () => {
                await axios
                    .post('/api/bpms/send-message', {
                        serviceName: 'virtual-open-deposit',
                        body: { code },
                    })
                    .then((response) => {
                        const { data } = response.data as ApiResponse;

                        setUserData({
                            ...userData,
                            nationalCode: code,
                            step: 1,
                            processId: data.processId,
                            isCustomer: data.body.isCustomer,
                            isDeposit: data.body.isDeposit,
                        });

                        router.push('/register');
                        requestCache.set(code, true);
                    })
                    .catch((err) => {
                        requestCache.delete(code);
                        throw err;
                    });
            })();

            requestCache.set(code, requestPromise);
            return requestPromise;
        },
        [router, setUserData, userData]
    );

    const initializeLoader = useCallback(async () => {
        if (calledRef.current) return;

        try {
            setError(null);
            setIsLoading(true);

            // خواندن توکن و کد ملی از کوکی
            const accessToken = getCookie('access_token');
            const nationalId = getCookie('national_id');

            if (!accessToken || !nationalId) {
                throw new Error('اطلاعات احراز هویت یافت نشد');
            }

            calledRef.current = true;
            await makeApiCall(nationalId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'خطای نامشخص رخ داده';
            setError(errorMessage);
            calledRef.current = false;
        } finally {
            setIsLoading(false);
        }
    }, [makeApiCall]);

    const retry = useCallback(() => {
        calledRef.current = false;
        initializeLoader();
    }, [initializeLoader]);

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;
        initializeLoader();
    }, [initializeLoader]);

    return {
        isLoading,
        error,
        retry,
    };
};
