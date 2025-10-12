'use client';
import CertificateStep from '@/components/register/CertificateStep';
import ContractStep from '@/components/register/contractStep';
import NationalCardScanner from '@/components/register/NationalCardStep';
import PasswordStep from '@/components/register/PasswordStep';
import PersonalInfo from '@/components/register/PersonalInfoStep';
import SelfieStep from '@/components/register/SelfieStep';
import Sidebar from '@/components/register/Sidebar';
import { SignatureStep } from '@/components/register/SignatureStep';
import { VideoRecorderStep } from '@/components/register/VideoStep';
import { Box, Card, Typography } from '@/components/ui';
import { useUser } from '@/contexts/UserContext';
import { mediaStreamManager } from '@/lib/mediaStreamManager';
import {
    extendedRegistrationSchema,
    type ExtendedRegistrationForm,
} from '@/lib/schemas/registration';
import { convertPersianToEnglish } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Schemas now imported from consolidated validation files

export default function Register() {
    const { userData, setUserData } = useUser();
    const [loading, setLoading] = useState(false);

    const [passwordSet, setPasswordSet] = useState(false);
    const [, setPassword] = useState('');
    const prevStepRef = useRef<number | undefined>(userData.step);

    const { control, setValue, setError, getValues } = useForm<ExtendedRegistrationForm>({
        resolver: zodResolver(extendedRegistrationSchema),
        mode: 'onBlur',
    });

    useEffect(() => {
        const prevStep = prevStepRef.current;
        const currentStep = userData.step ?? 1;

        const cameraSteps = [2, 3, 6];
        const wasCameraStep = prevStep !== undefined && cameraSteps.includes(prevStep);
        const isCameraStep = cameraSteps.includes(currentStep);

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
                const { cleanNationalId, isValidNationalId } = await import(
                    '@/components/NationalIdValidator'
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

    const handleOtp2Submit = () => {
        setLoading(true);
        axios
            .post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                formName: 'CertificateOtpVerify',
                processId: userData.processId,
                body: {
                    otpCode: getValues('certOtp'),
                    password: userData.password,
                },
            })
            .then((res) => {
                const { data } = res.data;
                if (data.body.success) {
                    toast.success('عملیات موفق');
                    setUserData({ step: 6 });
                } else {
                    toast.error('عملیات ناموفق');
                }
            })
            .catch((error) => {
                console.error('OTP verification failed', error);
            });
    };
    const getStepDescription = () => {
        switch (userData.step) {
            case 1:
                return 'اطلاعات شخصی';
            case 2:
                return 'عکس سلفی';
            case 3:
                return 'فیلم احراز هویت';
            case 4:
                return 'ثبت امضای دیجیتال';
            case 5:
                return 'تعیین رمز';
            case 6:
                return 'اطلاعات هویتی';
            case 7:
                return 'پیش نمایش قرارداد';
            default:
                return '';
        }
    };
    return (
        <Box className="container flex justify-center">
            <Box
                className={`my-2 flex w-full flex-col items-start gap-4 md:my-8 md:max-w-[50rem] md:flex-row md:justify-center`}
            >
                <Sidebar />

                <Box className="w-full">
                    <Card className="space-y-8">
                        <Typography variant="h4" className="text-center text-gray-800">
                            {getStepDescription()}
                        </Typography>
                        {userData.step === 1 && <PersonalInfo />}
                        {userData.step === 2 && <SelfieStep />}
                        {userData.step === 3 && <VideoRecorderStep />}
                        {userData.step === 4 && <SignatureStep />}
                        {userData.step === 5 && (
                            <>
                                {!passwordSet && (
                                    <PasswordStep
                                        setPassword={setPassword}
                                        setPasswordSet={setPasswordSet}
                                    />
                                )}

                                {passwordSet && (
                                    <Controller
                                        name="certOtp"
                                        control={control}
                                        defaultValue={''}
                                        render={({ field }) => (
                                            <CertificateStep
                                                otp={field.value ?? ''}
                                                setOtp={field.onChange}
                                                onIssue={() =>
                                                    (field.value ?? '').length === 6
                                                        ? handleOtp2Submit()
                                                        : setError('certOtp', {
                                                              type: 'manual',
                                                              message: 'کد تایید را کامل وارد کنید',
                                                          })
                                                }
                                                loading={loading}
                                            />
                                        )}
                                    />
                                )}
                            </>
                        )}
                        {userData.step === 6 && <NationalCardScanner />}

                        {userData.step === 7 && <ContractStep />}
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
