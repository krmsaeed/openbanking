"use client";

import { useEffect, memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { useUser } from "@/contexts/UserContext";
type ResponseBody = {
    data: {
        "body": {
            "isCustomer": boolean
        },
        "processId": number
    }
}
function HomeLoader() {
    const router = useRouter();
    const { setUserData } = useUser();
    const error: string | null = null;

    const checkAndRedirect = useCallback(async () => {
        const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
        const nationalCode = params.get('nationalId');
        if (!nationalCode) {
            router.push('/register');
            return;
        }
        await axios.post('/api/bpms/kekyc-user-send-message', { serviceName: "virtual-open-deposit", body: { code: nationalCode } })
            .then((response) => {
                const { data } = response.data as ResponseBody;
                if (data.body.isCustomer) {
                    setUserData({ nationalCode, step: 2, processId: data.processId });
                    router.push("/register");
                } else {
                    setUserData({ nationalCode, processId: data.processId });
                    router.push("/register");
                }
            })
            .catch(error => {
                console.error('Error sending message:', error);
            })


    }, [router, setUserData]);
    useEffect(() => {


        checkAndRedirect();
    }, [checkAndRedirect]);

    if (error) {
        return (
            <div className="w-full max-w-lg flex flex-col items-center justify-center gap-6 p-8 rounded-2xl shadow-lg bg-red-50">
                <div className="bg-white rounded-2xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-red-600">خطا در اطلاعات</h3>
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                </div>
                <div className="flex gap-2">u
                    <button className="px-4 py-2 rounded bg-gray-100" onClick={() => router.push('/')}>برگشت</button>
                    <button className="px-4 py-2 rounded bg-primary text-white" onClick={() => router.push('/register')}>رفتن به ثبت‌نام</button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg flex flex-col items-center justify-center gap-6 p-8 rounded-2xl shadow-lg bg-gradient-to-r from-primary-50 to-indigo-50">
            <div className="flex items-center justify-center w-32 h-32 rounded-3xl bg-white shadow-md">
                <div className="animate-spin-slow">
                    <Image src="/icons/EnBankNewVerticalLogo_100x100 (1).png"
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
                <span className="w-3 h-3 rounded-full bg-primary animate-pulse delay-75" />
                <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse delay-100" />
                <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse delay-150" />
            </div>
        </div>
    );
}

export default memo(HomeLoader);
