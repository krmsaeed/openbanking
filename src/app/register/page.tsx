'use client';
import ContractStep from '@/components/register/ContractStep';
import NationalCardScanner from '@/components/register/NationalCardStep';
import PasswordStep from '@/components/register/PasswordStep';
import PersonalInfo from '@/components/register/PersonalInfoStep';
import SelfieStep from '@/components/register/SelfieStep';
import Sidebar from '@/components/register/Sidebar';
import { SignatureStep } from '@/components/register/SignatureStep';
import { VideoRecorderStep } from '@/components/register/VideoStep';
import ThemeToggle from '@/components/ThemeToggle';
import { Box, Card, Typography } from '@/components/ui';
import { useUser } from '@/contexts/UserContext';
import { mediaStreamManager } from '@/lib/mediaStreamManager';
import {
    extendedRegistrationSchema,
    type ExtendedRegistrationForm,
} from '@/lib/schemas/registration';
import { convertPersianToEnglish } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

const CAMERA_STEPS = [2, 3, 6];

const STEP_DESCRIPTIONS: Record<number, string> = {
    1: 'اطلاعات شخصی',
    2: 'عکس سلفی',
    3: 'فیلم احراز هویت',
    4: 'امضای دیجیتال',
    5: 'تعیین رمز',
    6: 'اطلاعات هویتی',
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
                params.get('nationalId') || params.get('nationalCode') || params.get('nid');
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
                className={`my-2 flex w-full flex-col items-start gap-4 md:my-8 md:max-w-[40rem] md:flex-row md:justify-center`}
            >
                <Sidebar />

                <Box className="relative w-full">
                    <ThemeToggle className="top-1 right-1" />
                    <Card className="space-y-8">
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
