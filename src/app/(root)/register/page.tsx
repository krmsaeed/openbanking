'use client';
import ContractStep from '@/components/register/ContractStep';
import NationalCardScanner from '@/components/register/NationalCardStep';
import PasswordStep from '@/components/register/PasswordStep';
import PersonalInfo from '@/components/register/PersonalInfoStep';
import Sidebar from '@/components/register/Sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import { Box, Card, Typography } from '@/components/ui';
import { useUser } from '@/contexts/UserContext';
import { getNationalId } from '@/lib/auth';
import { mediaStreamManager } from '@/lib/mediaStreamManager';
import {
    extendedRegistrationSchema,
    type ExtendedRegistrationForm,
} from '@/lib/schemas/registration';
import cleanNationalId, {
    convertPersianToEnglish,
    getCookie,
    isValidNationalId,
} from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

// Dynamic import برای heavy components
const SelfieStep = dynamic(() => import('@/components/register/SelfieStep'), {
    loading: () => <div className="py-8 text-center">در حال بارگذاری...</div>,
    ssr: false,
});

const VideoRecorderStep = dynamic(
    () =>
        import('@/components/register/VideoStep').then((mod) => ({
            default: mod.VideoRecorderStep,
        })),
    {
        loading: () => <div className="py-8 text-center">در حال بارگذاری دوربین...</div>,
        ssr: false,
    }
);

const SignatureStep = dynamic(
    () =>
        import('@/components/register/SignatureStep').then((mod) => ({
            default: mod.SignatureStep,
        })),
    {
        loading: () => <div className="py-8 text-center">در حال بارگذاری...</div>,
        ssr: false,
    }
);

const CAMERA_STEPS = [2, 3, 6];

const STEP_DESCRIPTIONS: Record<number, string> = {
    1: 'اطلاعات شخصی',
    2: 'عکس سلفی',
    3: 'فیلم احراز هویت',
    4: 'امضای دیجیتال',
    5: 'تعیین رمز',
    6: 'ارسال مدارک تکمیلی',
    7: 'پیش نمایش قرارداد',
};

export default function Register() {
    const { userData } = useUser();
    const prevStepRef = useRef<number | undefined>(userData.step);

    const { setValue } = useForm<ExtendedRegistrationForm>({
        resolver: zodResolver(extendedRegistrationSchema),
        mode: 'onBlur',
    });
    useEffect(() => {
        try {
            const nid = getNationalId();
            if (!nid) return;
            const cleaned = cleanNationalId(nid);
            if (isValidNationalId(cleaned)) {
                setValue('nationalCode', cleaned);
            }
        } catch {
            // ignore client-side errors
        }
    }, [setValue]);
    useEffect(() => {
        const prevStep = prevStepRef.current;
        const currentStep = userData.step ?? 1;

        const wasCameraStep = prevStep !== undefined && CAMERA_STEPS.includes(prevStep);
        const isCameraStep = CAMERA_STEPS.includes(currentStep);

        if (wasCameraStep && !isCameraStep) {
            mediaStreamManager.stopAll();
        }

        prevStepRef.current = currentStep;
    }, [userData.step]);
    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const nationalId =
                params.get('nationalId') ||
                params.get('nationalCode') ||
                params.get('nid') ||
                getCookie('national_id');
            const mobile = params.get('mobile') || params.get('phone') || params.get('msisdn');
            if (!nationalId && !mobile) return;
            void (async () => {
                const { isValidNationalId, cleanNationalId } = await import(
                    '@/lib/nationalIdValidator'
                );
                if (nationalId) {
                    const cleaned = cleanNationalId(nationalId);
                    if (isValidNationalId(cleaned)) {
                        setValue('nationalCode', cleaned);
                    }
                }
                if (mobile) {
                    const cleanedMobile = convertPersianToEnglish(mobile || '').replace(/\D/g, '');
                    if (cleanedMobile.length >= 10) {
                        setValue('phoneNumber', cleanedMobile);
                    }
                }
            })();
        } catch {}
    }, [setValue]);

    // Read national id from cookie (if present) and set into form

    const getStepDescription = () => STEP_DESCRIPTIONS[userData.step ?? 1] || '';

    const steps = [
        null,
        <PersonalInfo key={1} />,
        <SelfieStep key={2} />,
        <VideoRecorderStep key={3} />,
        <SignatureStep key={4} />,
        <PasswordStep key={5} />,
        <NationalCardScanner key={6} />,
        <ContractStep key={7} />,
    ];

    return (
        <Box className="container flex justify-center">
            <Box
                className={`my-2 flex w-full flex-col items-start gap-4 md:my-8 ${userData.step === 7 ? 'md:max-w-[55rem]' : 'md:max-w-[40rem]'} md:flex-row md:justify-center`}
            >
                <Sidebar />

                <Box className="relative w-full">
                    <ThemeToggle className="top-1 right-1" />
                    <Card className="space-y-5 px-1 sm:px-4">
                        <Typography variant="h5" className="text-center text-gray-800">
                            {getStepDescription()}
                        </Typography>
                        {steps[userData.step ?? 1]}
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
