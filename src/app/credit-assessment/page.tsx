"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loading } from "@/components/ui";
import { FinancialInfoStep, IdentityFilesStep, JobFilesStep, ProgressSteps } from "@/components/credit-assessment";

export default function CreditAssessment() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleStep1Submit = () => {
        toast.success("اطلاعات مالی تأیید شد");
        setStep(2);
    };

    const handleStep2Submit = () => {
        toast.success("مدارک شناسایی تأیید شد");
        setStep(3);
    };

    const handleStep3Submit = async () => {
        setLoading(true);
        try {
            toast.success("تمام مدارک بررسی شد");
            setTimeout(() => {
                toast.success("اعتبارسنجی تکمیل شد!");
                router.push("/payment/credit-assessment");
            }, 2000);
        } catch {
            toast.error("خطا در پردازش اطلاعات");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    return (
        <div className="min-h-screen  p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">اعتبارسنجی</h1>
                    <p className="text-gray-600">برای دریافت وام، لطفاً مراحل زیر را تکمیل کنید</p>
                    <ProgressSteps currentStep={step} />
                </div>

                {step === 1 && (
                    <FinancialInfoStep onNext={handleStep1Submit} />
                )}

                {step === 2 && (
                    <IdentityFilesStep
                        onNext={handleStep2Submit}
                        onPrevious={() => setStep(1)}
                        loading={loading}
                    />
                )}

                {step === 3 && (
                    <JobFilesStep
                        onNext={handleStep3Submit}
                        onPrevious={() => setStep(2)}
                        loading={loading}
                    />
                )}
            </div>
        </div>
    );
}
