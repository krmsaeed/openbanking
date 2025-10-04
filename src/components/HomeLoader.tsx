'use client';

import { useUser } from '@/contexts/UserContext';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect } from 'react';
type ResponseBody = {
    data: {
        body: {
            isCustomer: boolean;
        };
        processId: number;
    };
};
function HomeLoader() {
    const router = useRouter();
    const { setUserData } = useUser();
    const error: string | null = null;

    const checkAndRedirect = useCallback(async () => {
        const params = new URLSearchParams(
            typeof window !== 'undefined' ? window.location.search : ''
        );
        const nationalCode = params.get('nationalId');
        if (!nationalCode) {
            router.push('/register');
            return;
        }
        await axios
            .post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                body: { code: nationalCode },
            })
            .then((response) => {
                const { data } = response.data as ResponseBody;
                if (data.body.isCustomer) {
                    setUserData({ nationalCode, step: 1, processId: data.processId });
                    router.push('/register');
                } else {
                    setUserData({ nationalCode, processId: data.processId });
                    router.push('/register');
                }
            })
            .catch((error) => {
                console.error('Error sending message:', error);
            });
    }, [router, setUserData]);
    useEffect(() => {
        checkAndRedirect();
    }, [checkAndRedirect]);

    if (error) {
        return (
            <div className="flex w-full max-w-lg flex-col items-center justify-center gap-6 rounded-2xl bg-red-50 p-8 shadow-lg">
                <div className="rounded-2xl bg-white p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-red-600">خطا در اطلاعات</h3>
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                </div>
                <div className="flex gap-2">
                    u
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
                </div>
            </div>
        );
    }

    return (
        <div className="from-primary-50 flex w-full max-w-lg flex-col items-center justify-center gap-6 rounded-2xl bg-gradient-to-r to-indigo-50 p-8 shadow-lg">
            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-white shadow-md">
                <div className="animate-spin-slow">
                    <Image
                        src="/icons/EnBankNewVerticalLogo_100x100 (1).png"
                        alt="Logo"
                        width={100}
                        height={100}
                        className="text-primary w-[32rem] p-2"
                    />
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-lg font-semibold">در حال بررسی اطلاعات شما...</h3>
                <p className="text-sm text-gray-500">لطفا چند لحظه صبر کنید </p>
            </div>

            <div className="flex items-center gap-2">
                <span className="bg-primary h-3 w-3 animate-pulse rounded-full delay-75" />
                <span className="h-3 w-3 animate-pulse rounded-full bg-indigo-500 delay-100" />
                <span className="h-3 w-3 animate-pulse rounded-full bg-purple-500 delay-150" />
            </div>
        </div>
    );
}

export default memo(HomeLoader);
