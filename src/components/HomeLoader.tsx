"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BuildingLibraryIcon } from "@heroicons/react/24/outline";

export default function HomeLoader({ delay = 2000 }: { delay?: number }) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function checkAndRedirect() {
            const params = new URLSearchParams(window.location.search);
            const nationalId = params.get('nationalId');

            // use centralized validator
            const { isValidNationalId, cleanNationalId } = await import('@/components/NationalIdValidator');
            if (!nationalId) {
                setError('کد ملی پیدا نشد. لینک را بررسی کنید.');
                return;
            }

            const cleaned = cleanNationalId(nationalId);
            if (!isValidNationalId(cleaned)) {
                setError('کد ملی نامعتبر است — لطفاً کد ملی را بررسی کنید.');
                return;
            }

            try {
                // check registry
                const regRes = await fetch('/api/registry-check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nationalId }),
                });
                const regJson = await regRes.json();

                if (!regRes.ok || !regJson.success) {
                    router.push('/register');
                    return;
                }

                // if registry ok, check bank accounts
                const { bankingService } = await import('@/services/banking');
                try {
                    const accountsResp = await bankingService.getAccounts();
                    if (accountsResp && accountsResp.success && accountsResp.data && accountsResp.data.length > 0) {
                        router.push('/credit-assessment');
                        return;
                    }
                } catch (err) {
                    console.error('bankingService error', err);
                }

                // default route
                router.push('/register');
            } catch (err) {
                console.error('HomeLoader check error', err);
                router.push('/register');
            }
        }

        checkAndRedirect();
    }, [delay, router]);

    if (error) {
        return (
            <div className="w-full max-w-lg flex flex-col items-center justify-center gap-6 p-8 rounded-2xl shadow-lg bg-red-50">
                <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-red-600">خطا در اطلاعات</h3>
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 rounded bg-gray-100" onClick={() => router.push('/')}>برگشت</button>
                    <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => router.push('/register')}>رفتن به ثبت‌نام</button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg flex flex-col items-center justify-center gap-6 p-8 rounded-2xl shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-center w-32 h-32 rounded-3xl bg-white shadow-md">
                <div className="animate-spin-slow">
                    <BuildingLibraryIcon className="h-10 w-10 text-blue-600" />
                </div>
            </div>

            <div className="text-center">
                <h3 className="text-lg font-semibold">در حال بررسی اطلاعات شما...</h3>
                <p className="text-sm text-gray-500">لطفا چند لحظه صبر کنید — به صفحه ثبت‌نام منتقل می‌شوید</p>
            </div>

            <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse delay-75" />
                <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse delay-150" />
            </div>
        </div>
    );
}
