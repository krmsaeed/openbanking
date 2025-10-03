'use client';
import CertificateStep from '@/components/register/CertificateStep';
import NationalCardScanner from '@/components/register/NationalCardScanner';
import PasswordStep from '@/components/register/PasswordStep';
import PersonalInfoForm from '@/components/register/PersonalInfoForm';
import SelfieStep from '@/components/register/SelfieStep';
import Sidebar from '@/components/register/Sidebar';
import SignatureStep from '@/components/register/SignatureStep';
import VideoStep from '@/components/register/VideoStep';
import { Box } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/core/Card';
import { useUser } from '@/contexts/UserContext';
import { convertPersianToEnglish } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import ContractPage from '../contract/page';

const registrationSchema = z.object({
    nationalCode: z
        .string('کد ملی الزامی است')
        .length(10, 'کد ملی باید 10 رقم باشد')
        .regex(/^\d+$/, 'کد ملی باید فقط شامل اعداد باشد'),
    phoneNumber: z
        .string('شماره همراه الزامی است')
        .min(10, 'شماره همراه نامعتبر است')
        .regex(/^\d+$/, 'شماره همراه باید فقط شامل اعداد باشد'),
    birthDate: z.string('تاریخ تولد الزامی است').min(1, 'تاریخ تولد الزامی است'),
    postalCode: z
        .string('کد پستی الزامی است')
        .length(10, 'کد پستی باید 10 رقم باشد')
        .regex(/^\d+$/, 'کد پستی باید فقط شامل اعداد باشد'),
});

const extendedRegistrationSchema = registrationSchema
    .extend({
        password: z.string().optional(),
        confirmPassword: z.string().optional(),
        otp: z.string().optional(),
        certOtp: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        const pw = data.password;
        const cpw = data.confirmPassword;
        if ((pw !== undefined && pw !== '') || (cpw !== undefined && cpw !== '')) {
            if (!pw || pw.length < 8) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['password'],
                    message: 'رمز عبور باید حداقل 8 کاراکتر باشد',
                });
            }
            if (pw !== cpw) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['confirmPassword'],
                    message: 'رمز عبور و تایید آن باید یکسان باشند',
                });
            }
        }
    });

type RegistrationForm = z.infer<typeof registrationSchema>;
type ExtendedRegistrationForm = RegistrationForm & {
    otp?: string;
    certOtp?: string;
    password?: string;
    confirmPassword?: string;
};

export default function Register() {
    const { userData, setUserData } = useUser();
    const [loading, setLoading] = useState(false);

    const [passwordSet, setPasswordSet] = useState(false);
    const [, setPassword] = useState('');

    const { control, setValue, setError, getValues } = useForm<ExtendedRegistrationForm>({
        resolver: zodResolver(extendedRegistrationSchema),
        mode: 'onBlur',
    });

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
        } catch {
            // Prefill failed - not critical
        }
    }, [setValue]);

    const handleOtp2Submit = () => {
        axios
            .post('/api/bpms/kekyc-user-send-message', {
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
                return 'ارسال فرم';
            case 6:
                return 'اسکن کارت و تعیین شعبه ';
            case 7:
                return 'پیش نمایش قرارداد';
            default:
                return '';
        }
    };

    function handleNationalCardScanComplete(_file: File, _branch: string): void {
        setUserData({ nationalCard: _file, branch: _branch, step: 7 });
        toast.success('تصویر کارت ملی و شعبه ثبت شد');
    }

    return (
        <Box className="my-6 flex flex-col items-start gap-6 p-4 md:flex-row md:justify-center">
            <Box className="w-full flex-shrink-0 md:w-64">
                <Sidebar />
            </Box>

            <Box className="w-full rounded-lg shadow-md">
                <Box className="md:max-w-9xl mx-auto w-full">
                    <Box className="flex flex-col gap-3 md:flex-row">
                        <Box className="w-full">
                            <Card padding="sm" className="w-full md:min-w-96">
                                <CardHeader>
                                    <CardTitle className="text-center">
                                        {getStepDescription()}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {userData.step === 1 && <PersonalInfoForm />}
                                    {userData.step === 2 && <SelfieStep />}
                                    {userData.step === 3 && <VideoStep />}
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
                                                                          message:
                                                                              'کد تایید را کامل وارد کنید',
                                                                      })
                                                            }
                                                            loading={loading}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </>
                                    )}
                                    {userData.step === 6 && (
                                        <NationalCardScanner
                                            onComplete={() => handleNationalCardScanComplete}
                                            onBack={() => setUserData({ step: 5 })}
                                        />
                                    )}

                                    {userData.step === 7 && <ContractPage />}
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
