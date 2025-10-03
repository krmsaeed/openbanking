'use client';

import { useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Loading } from '@/components/ui';
import { Box, Typography } from '@/components/ui';

const FinancialInfoStep = lazy(() =>
    import('@/components/credit-assessment').then((module) => ({
        default: module.FinancialInfoStep,
    }))
);
const IdentityFilesStep = lazy(() =>
    import('@/components/credit-assessment').then((module) => ({
        default: module.IdentityFilesStep,
    }))
);
const JobFilesStep = lazy(() =>
    import('@/components/credit-assessment').then((module) => ({ default: module.JobFilesStep }))
);
const ProgressSteps = lazy(() =>
    import('@/components/credit-assessment').then((module) => ({ default: module.ProgressSteps }))
);

export default function CreditAssessment() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleStep1Submit = () => {
        toast.success('اطلاعات مالی تأیید شد');
        setStep(2);
    };

    const handleStep2Submit = () => {
        toast.success('مدارک شناسایی تأیید شد');
        setStep(3);
    };

    const handleStep3Submit = async () => {
        setLoading(true);
        try {
            toast.success('تمام مدارک بررسی شد');
            setTimeout(() => {
                toast.success('اعتبارسنجی تکمیل شد!');
                router.push('/payment/credit-assessment');
            }, 2000);
        } catch {
            toast.error('خطا در پردازش اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box className="flex min-h-screen items-center justify-center bg-gray-50">
                <Loading />
            </Box>
        );
    }

    return (
        <Box className="min-h-screen p-6">
            <Box className="mx-auto max-w-4xl">
                <Box className="relative mb-8 text-center">
                    <Typography
                        variant="h3"
                        className="mb-4 text-center text-4xl font-bold text-gray-900"
                    >
                        اعتبارسنجی
                    </Typography>
                    <Typography variant="p" className="text-secondary text-center">
                        برای دریافت وام، لطفاً مراحل زیر را تکمیل کنید
                    </Typography>
                    <Suspense fallback={<Loading />}>
                        <ProgressSteps currentStep={step} />
                    </Suspense>
                </Box>

                {step === 1 && (
                    <Suspense fallback={<Loading />}>
                        <FinancialInfoStep onNext={handleStep1Submit} />
                    </Suspense>
                )}

                {step === 2 && (
                    <Suspense fallback={<Loading />}>
                        <IdentityFilesStep
                            onNext={handleStep2Submit}
                            onPrevious={() => setStep(1)}
                            loading={loading}
                        />
                    </Suspense>
                )}

                {step === 3 && (
                    <Suspense fallback={<Loading />}>
                        <JobFilesStep
                            onNext={handleStep3Submit}
                            onPrevious={() => setStep(2)}
                            loading={loading}
                        />
                    </Suspense>
                )}
            </Box>
        </Box>
    );
}
