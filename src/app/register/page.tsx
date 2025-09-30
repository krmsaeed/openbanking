"use client";
import { useState, useEffect } from "react";
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { convertPersianToEnglish } from '@/lib/utils';
import Sidebar from '@/components/register/Sidebar';
import PersonalInfoForm from '@/components/register/PersonalInfoForm';
import SelfieStep from '@/components/register/SelfieStep';
import VideoStep from '@/components/register/VideoStep';
import SignatureStep from '@/components/register/SignatureStep';
import CertificateStep from '@/components/register/CertificateStep';
import PasswordStep from '@/components/register/PasswordStep';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/Card";
import { Box } from "@/components/ui";
import NationalCardScanner from "@/components/register/NationalCardScanner";
import ContractPage from "../contract/page";
import { useUser } from "@/contexts/UserContext";

// Combined registration schema: nationalCode, phoneNumber, birthDate, postalCode
const registrationSchema = z.object({
    nationalCode: z.string("کد ملی الزامی است").length(10, "کد ملی باید 10 رقم باشد").regex(/^\d+$/, "کد ملی باید فقط شامل اعداد باشد"),
    phoneNumber: z.string("شماره همراه الزامی است").min(10, "شماره همراه نامعتبر است").regex(/^\d+$/, "شماره همراه باید فقط شامل اعداد باشد"),
    birthDate: z.string("تاریخ تولد الزامی است").min(1, "تاریخ تولد الزامی است"),
    postalCode: z.string("کد پستی الزامی است").length(10, "کد پستی باید 10 رقم باشد").regex(/^\d+$/, "کد پستی باید فقط شامل اعداد باشد"),
});

// Extended schema includes optional password fields and validates them when present
const extendedRegistrationSchema = registrationSchema.extend({
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    otp: z.string().optional(),
    certOtp: z.string().optional(),
}).superRefine((data, ctx) => {
    // If either password field is provided, enforce rules
    const pw = data.password;
    const cpw = data.confirmPassword;
    if ((pw !== undefined && pw !== '') || (cpw !== undefined && cpw !== '')) {
        if (!pw || pw.length < 8) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'رمز عبور باید حداقل 8 کاراکتر باشد' });
        }
        if (pw !== cpw) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'رمز عبور و تایید آن باید یکسان باشند' });
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

    const {
        control,
        setValue,
        setError,
    } = useForm<ExtendedRegistrationForm>({
        resolver: zodResolver(extendedRegistrationSchema),
        mode: "onBlur",
    });

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);
            const nationalId = params.get('nationalId') || params.get('nationalCode') || params.get('nid');
            const mobile = params.get('mobile') || params.get('phone') || params.get('msisdn');
            if (!nationalId && !mobile) return;
            void (async () => {
                const { cleanNationalId, isValidNationalId } = await import('@/components/NationalIdValidator');
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
        } catch (err) {
            console.warn('prefill failed', err);
        }
    }, [setValue]);


    const handleVideoRecording = (file: File) => {
        setUserData({ video: file, step: 4 });
        toast.success("فیلم احراز هویت ثبت شد؛");
    };
    const handleSignatureComplete = (file: File) => {
        setUserData({ signature: file, step: 5 });
        toast.success('نمونه امضای شما ثبت شد');
    };

    const handleOtp2Submit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("گواهی دیجیتال صادر شد");
            setUserData({ step: 6 });
        }, 2000);
    };
    const getStepDescription = () => {
        switch (userData.step) {
            case 1: return "اطلاعات شخصی";
            case 2: return "عکس سلفی";
            case 3: return "فیلم احراز هویت";
            case 4: return "ثبت امضای دیجیتال";
            case 5: return "ارسال کد تایید";
            case 6: return "اسکن کارت و تعیین شعبه ";
            case 7: return "پیش نمایش قرارداد";
            default: return "";
        }
    };

    function handleNationalCardScanComplete(_file: File, _branch: string): void {
        setUserData({ nationalCard: _file, branch: _branch, step: 7 });
        toast.success("تصویر کارت ملی و شعبه ثبت شد");
    }

    return (
        <Box className="my-6 p-4 flex flex-col md:flex-row items-start md:justify-center gap-6">

            <Box className="flex-shrink-0 w-full md:w-64">
                <Sidebar />
            </Box>

            <Box className="rounded-lg shadow-md  w-full">
                <Box className="max-w-9xl w-full mx-auto">
                    <Box className="flex flex-col md:flex-row gap-3">
                        <Box className="w-full">
                            <Card padding="sm" className="min-w-96">
                                <CardHeader>
                                    <CardTitle className="text-center">{getStepDescription()}</CardTitle>
                                </CardHeader>
                                <CardContent >
                                    {userData.step === 1 && (
                                        <PersonalInfoForm />

                                    )}
                                    {userData.step === 2 && (
                                        <SelfieStep />
                                    )}
                                    {userData.step === 3 && (
                                        <VideoStep onComplete={handleVideoRecording} onBack={() => setUserData({ step: 2 })} />
                                    )}

                                    {userData.step === 4 && (
                                        <SignatureStep />
                                    )}
                                    {userData.step === 5 && (
                                        <>
                                            {!passwordSet && <PasswordStep
                                                setPassword={setPassword}
                                                setPasswordSet={setPasswordSet}
                                            />}

                                            {/* When passwordSet is true, render the CertificateStep for certOtp here */}
                                            {passwordSet && (
                                                <Controller
                                                    name="certOtp"
                                                    control={control}
                                                    defaultValue={''}
                                                    render={({ field }) => (
                                                        <CertificateStep otp={field.value ?? ''} setOtp={field.onChange} onIssue={() => ((field.value ?? '').length === 5 ? handleOtp2Submit() : setError('certOtp', { type: 'manual', message: 'کد تایید را کامل وارد کنید' }))} loading={loading} />
                                                    )}
                                                />
                                            )}
                                        </>
                                    )}
                                    {userData.step === 6 && <NationalCardScanner onComplete={handleNationalCardScanComplete} onBack={() => setUserData({ step: 5 })} />}

                                    {userData.step === 7 && (
                                        <ContractPage />
                                    )}

                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
