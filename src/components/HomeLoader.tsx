'use client';

import { Box } from '@/components/ui';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { initializeAuth } from '@/lib/auth';
import axios from 'axios';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useCallback, useEffect, useRef } from 'react';

const requestCache: Map<string, Promise<void> | true> = new Map();
type ResponseBody = {
    data: {
        body: {
            isCustomer: boolean;
            isDeposit: boolean;
        };
        processId: number;
    };
};
function HomeLoader() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setUserData } = useUser();
    const { nationalId, isAuthenticated } = useAuth();
    const error: string | null = null;

    const makeApiCall = useCallback(
        async (code: string) => {
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

                    const { data } = response.data as ResponseBody;

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

    const calledRef = useRef(false);

    useEffect(() => {
        let isActive = true;

        const run = async () => {
            if (!isActive || calledRef.current) return;

            let codeToUse: string | null = null;

            if (!isAuthenticated || !nationalId) {
                const tokenFromUrl = searchParams.get('token');
                const codeFromUrl = searchParams.get('code');

                if (tokenFromUrl && codeFromUrl) {
                    const { isValidNationalId, cleanNationalId } = await import(
                        '@/components/NationalIdValidator'
                    );
                    const cleanedCode = cleanNationalId(codeFromUrl);

                    if (isValidNationalId(cleanedCode)) {
                        initializeAuth({ token: tokenFromUrl, nationalId: cleanedCode });

                        const url = new URL(window.location.href);
                        url.searchParams.delete('token');
                        window.history.replaceState({}, '', url.toString());

                        codeToUse = cleanedCode;
                    }
                }
            } else {
                codeToUse = nationalId;
            }

            if (!codeToUse || !isActive) return;

            calledRef.current = true;
            try {
                await makeApiCall(codeToUse);
            } catch {
                calledRef.current = false;
            }
        };

        void run();

        return () => {
            isActive = false;
        };
    }, [isAuthenticated, nationalId, makeApiCall, searchParams]);

    if (error) {
        return (
            <Box className="flex w-full max-w-lg flex-col items-center justify-center gap-6 rounded-2xl bg-red-50 p-8 shadow-lg">
                <Box className="rounded-2xl bg-white p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-red-600">خطا در اطلاعات</h3>
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                </Box>
                <Box className="flex gap-2">
                    <button
                        className="rounded bg-gray-100 px-4 py-2"
                        onClick={() => router.push('/')}
                    >
                        برگشت
                    </button>
                    <button
                        className="bg-primary rounded px-4 py-2 text-white"
                        onClick={() => router.push('/register')}
                    >
                        رفتن به ثبت‌نام
                    </button>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="from-primary-50 flex w-full max-w-lg flex-col items-center justify-center gap-6 rounded-2xl bg-gradient-to-br to-gray-600 p-8 shadow-lg">
            <Box className="flex h-32 w-32 items-center justify-center">
                <Box className="animate-spin-slow">
                    <Image
                        src="/icons/EnBankNewVerticalLogo_100x100 (1).png"
                        alt="Logo"
                        width={100}
                        height={100}
                        className="text-primary w-[32rem] p-2"
                    />
                </Box>
            </Box>

            <Box className="text-center">
                <h3 className="text-lg font-semibold">در حال بررسی اطلاعات شما...</h3>
                <p className="text-gray text-sm">لطفا چند لحظه صبر کنید </p>
            </Box>

            <Box className="flex items-center gap-2">
                <span className="bg-primary h-3 w-3 animate-pulse rounded-full delay-75" />
                <span className="h-3 w-3 animate-pulse rounded-full bg-indigo-500 delay-100" />
                <span className="h-3 w-3 animate-pulse rounded-full bg-purple-500 delay-150" />
            </Box>
        </Box>
    );
}

export default memo(HomeLoader);
