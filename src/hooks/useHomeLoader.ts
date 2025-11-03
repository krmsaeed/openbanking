'use client';

import { useUser } from '@/contexts/UserContext';
import { getCookie, saveUserStateToCookie, setCookie } from '@/lib/utils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
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

                        const newState = {
                            nationalCode: code,
                            step: 1,
                            processId: data.processId,
                            isCustomer: data.body.isCustomer,
                            isDeposit: data.body.isDeposit,
                        };

                        // ذخیره در state
                        setUserData({
                            ...userData,
                            ...newState,
                        });

                        // ذخیره در کوکی
                        saveUserStateToCookie({
                            step: newState.step,
                            processId: newState.processId,
                            isCustomer: newState.isCustomer,
                            isDeposit: newState.isDeposit,
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

            const params = new URLSearchParams(window.location.search);

            // خواندن از URL params
            const tokenFromParams = params.get('token');
            const codeFromParams = params.get('code');

            // خواندن توکن و کد ملی از کوکی
            const cookieToken = getCookie('access_token');
            const cookieNationalId = getCookie('national_id');

            // اولویت با searchParams - اگر در URL هست استفاده کن و در کوکی ست کن
            let accessToken: string | null = null;
            let nationalId: string | null = null;

            const normalized = codeFromParams;
            if (tokenFromParams) {
                setCookie('access_token', tokenFromParams);
                accessToken = tokenFromParams;
            } else {
                accessToken = cookieToken;
            }

            if (codeFromParams) {
                nationalId = normalized;
                setCookie('national_id', nationalId!);
            } else {
                nationalId = cookieNationalId;
            }

            if (!accessToken || !nationalId) {
                toast.error('اطلاعات احراز هویت یافت نشد');
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
