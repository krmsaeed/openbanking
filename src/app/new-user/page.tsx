"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserInfoStep, IdentityVerificationStep } from "@/components/new-user";
import { NewUserFormData } from "@/lib/schemas/newUser";
import { useToast, Box } from "@/components/ui";

export default function NewUserPage() {
    const [step, setStep] = useState<'userInfo' | 'identity'>('userInfo');
    const [userInfo, setUserInfo] = useState<NewUserFormData | null>(null);
    const router = useRouter();
    const toast = useToast();

    const handleUserInfoSubmit = (data: NewUserFormData) => {
        setUserInfo(data);
        setStep('identity');
        toast.success('اطلاعات ثبت شد، لطفاً مدارک هویتی را ارسال کنید');
    };

    const handleIdentityComplete = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            toast.success('ثبت نام با موفقیت انجام شد');
            router.push('/login');
        } catch {
            toast.error('خطا در ثبت نام');
        }
    };

    const handleBack = () => {
        setStep('userInfo');
    };
    return (
        <Box className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <Box className="w-full max-w-2xl">
                {step === 'userInfo' ? (
                    <UserInfoStep onNext={handleUserInfoSubmit} />
                ) : userInfo ? (
                    <IdentityVerificationStep
                        userInfo={userInfo}
                        onBack={handleBack}
                        onComplete={handleIdentityComplete}
                    />
                ) : null}
            </Box>
        </Box>
    );
}
