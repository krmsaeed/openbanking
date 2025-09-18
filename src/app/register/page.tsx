"use client";
import { useState, useEffect } from "react";
import { Controller } from 'react-hook-form';
// Link removed: unused
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LoginFormData } from "@/lib/schemas/common";
import { z } from "zod";
import toast from "react-hot-toast";
import { verificationService } from "@/services/verification";
import { convertPersianToEnglish } from '@/lib/utils';
import Sidebar from '@/components/register/Sidebar';
import PersonalInfoForm from '@/components/register/PersonalInfoForm';
import NationalCardPreview from '@/components/register/NationalCardPreview';
// NationalCardScanner removed from final step (not used here)
import SelfieStep from '@/components/register/SelfieStep';
import VideoStep from '@/components/register/VideoStep';
import SignatureStep from '@/components/register/SignatureStep';
import CertificateStep from '@/components/register/CertificateStep';
import PasswordStep from '@/components/register/PasswordStep';
// Input not used directly in this file
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/Card";
import { Box } from "@/components/ui";
import FinalConfirmation from '@/components/register/FinalConfirmation';
import NationalCardScanner from "@/components/register/NationalCardScanner";

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
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'طول رمز باید حداقل 8 کاراکتر باشد' });
        }
        if (pw !== cpw) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: 'رمز و تاییدیه مطابقت ندارند' });
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
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [step1Data, setStep1Data] = useState<LoginFormData | null>(null);
    const [step2Data, setStep2Data] = useState<{ birthDate: string; postalCode: string } | null>(null);
    const [showNationalCardTemplate, setShowNationalCardTemplate] = useState(false);
    const [showOtp1, setShowOtp1] = useState(false);
    const [videoSample, setVideoSample] = useState<File | undefined>(undefined);
    const [signatureSample, setSignatureSample] = useState<File | undefined>(undefined);
    const [selfieSample, setSelfieSample] = useState<File | undefined>(undefined);
    const [passwordSet, setPasswordSet] = useState(false);

    const {
        control,
        handleSubmit: handleRegisterSubmit,
        formState: { errors: registerErrors },
        setValue,
        getValues,
        watch,
        trigger,
        setError,
    } = useForm<ExtendedRegistrationForm>({
        resolver: zodResolver(extendedRegistrationSchema),
        mode: "onBlur",
    });

    const setErrorAny = (name: string, error: { type: string; message?: string }) => {
        (setError as unknown as (n: string, e: { type: string; message?: string }) => void)(name, error);
    };

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

    const onRegisterSubmit = async (data: RegistrationForm) => {
        setStep1Data({ nationalCode: data.nationalCode, phoneNumber: data.phoneNumber });
        setStep2Data({ birthDate: data.birthDate, postalCode: data.postalCode });
        toast.success("اطلاعات ثبت شد");

        setShowOtp1(true);
        setValue('otp', '');
        setValue('certOtp', '');
        setValue('password', '');
        setValue('confirmPassword', '');
    };

    const handleVerifyOtpAfterPersonal = async () => {
        const phone = step1Data?.phoneNumber;
        const otpVal = getValues('otp') as string | undefined;
        if (!phone) {
            setError('phoneNumber', { type: 'manual', message: 'شماره همراه موجود نیست' });
            return;
        }
        if (!otpVal || otpVal.length < 5) {
            setError('otp', { type: 'manual', message: 'کد تایید را کامل وارد کنید' });
            return;
        }
        // show the national card preview when moving to step 2 so the preview component
        // receives the collected data (nationalCode, birthDate)
        setShowNationalCardTemplate(true);
        setStep(2);
    };

    // Extracted: send OTP to the registered phone number (invoked by user action)
    // send OTP function intentionally omitted here (handled elsewhere) to avoid automatic sends

    const handleNationalCardConfirm = () => {
        setShowNationalCardTemplate(false);
        setStep(8);
    };
    // scanned card/branch state removed - final step now shows downloadable contract instead
    const handleSelfiePhoto = (file: File) => {
        setSelfieSample(file);
        toast.success("عکس سلفی ثبت شد");
        setStep(4);
    };
    const handleVideoRecording = (file: File) => {
        setVideoSample(file);
        toast.success("فیلم احراز هویت ثبت شد؛");
        setStep(5);
    };
    const handleSignatureComplete = (file: File) => {
        setSignatureSample(file);
        toast.success('نمونه امضای شما ثبت شد');
        setStep(6);
    };

    const handleOtp2Submit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("گواهی دیجیتال صادر شد");
            setStep(7);
        }, 2000);
    };

    const handleDigitalSignature = async () => {
        setLoading(true);
        try {
            if (signatureSample && videoSample) {
                const payload: Parameters<typeof verificationService.submitVerification>[0] = {
                    signature: signatureSample,
                    video: videoSample,
                    selfie: selfieSample,
                    type: 'register',
                    userInfo: {
                        phone: step1Data?.phoneNumber,
                        name: '',
                    }
                };

                toast.success('در حال ارسال نمونه امضا و ویدیو برای احراز هویت');
                const resp = await verificationService.submitVerification(payload);
                if (!resp.success) {
                    toast.error(resp.message || 'خطا در ارسال اطلاعات احراز هویت');
                    setLoading(false);
                    router.push("/");
                    return;
                } else {
                    toast.success('نمونه امضا و ویدیو با موفقیت ارسال شد');
                }
            }

            toast.success("امضای دیجیتال تأیید شد");
            setTimeout(() => {
                toast.success("ثبت‌نام با موفقیت انجام شد! خوش آمدید!");
                router.push("/");
            }, 1500);
        } catch (err) {
            console.error('Verification submit error:', err);
            toast.error('خطا در ارسال اطلاعات احراز هویت');
        } finally {
            setLoading(false);
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return "اطلاعات شخصی";
            case 2: return "بررسی اطلاعات کارت ملی";
            case 3: return "عکس سلفی";
            case 4: return "فیلم احراز هویت";
            case 5: return "ثبت امضای دیجیتال";
            case 6: return <span dir="ltr">{passwordSet ? "ارسال کد تایید" : "ایجاد رمز عبور"}</span>;
            case 7: return "اسکن کارت و تعیین شعبه ";
            case 8: return "پیش نمایش قرارداد";
            default: return "";
        }
    };

    function handleNationalCardScanComplete(_file: File, _branch: string): void {
        // mark parameters as used to satisfy linters (actual handling may be implemented later)
        void _file;
        void _branch;
        // For now, just show a toast and move to the next step (selfie)
        toast.success("تصویر کارت ملی و شعبه ثبت شد");
        setShowNationalCardTemplate(false);
        setStep(8);
    }

    return (
        <Box className="my-6 p-4 flex flex-col md:flex-row items-start md:justify-center gap-6">

            <Box className="flex-shrink-0 w-full md:w-64">
                <Sidebar step={step} onSelect={setStep} />
            </Box>

            <Box className="rounded-lg shadow-md border border-gray-100 w-full">
                <Box className="max-w-9xl w-full mx-auto px-2">
                    <Box className="flex flex-col md:flex-row gap-3">
                        <Box className="w-full">
                            <Card padding="sm" className="min-w-96">
                                <CardHeader>
                                    <CardTitle className="text-center">{getStepDescription()}</CardTitle>
                                </CardHeader>
                                <CardContent >
                                    {step === 1 && (
                                        <>
                                            {!showOtp1 && <PersonalInfoForm control={control} errors={registerErrors} onSubmit={handleRegisterSubmit(onRegisterSubmit)} />}

                                            {showOtp1 && (
                                                <div className="mt-4">
                                                    <Controller
                                                        name="otp"
                                                        control={control}
                                                        defaultValue={''}
                                                        render={({ field }) => (
                                                            <CertificateStep otp={field.value ?? ''} setOtp={field.onChange} onIssue={() => ((field.value ?? '').length === 5 ? handleVerifyOtpAfterPersonal() : setError('otp', { type: 'manual', message: 'کد تایید را کامل وارد کنید' }))} loading={loading} />
                                                        )}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {step === 2 && (
                                        <NationalCardPreview
                                            nationalCode={step1Data?.nationalCode || (getValues('nationalCode') as string) || ''}
                                            birthDate={step2Data?.birthDate || (getValues('birthDate') as string) || ''}
                                            show={showNationalCardTemplate}
                                            onConfirm={handleNationalCardConfirm}
                                            onBack={() => { if (showNationalCardTemplate) setShowNationalCardTemplate(false); setStep(1); }}
                                        />
                                    )}

                                    {step === 3 && (
                                        <SelfieStep onPhotoCapture={handleSelfiePhoto} onBack={() => setStep(2)} />
                                    )}

                                    {step === 4 && (
                                        <VideoStep onComplete={handleVideoRecording} onBack={() => setStep(3)} />
                                    )}

                                    {step === 5 && (
                                        <SignatureStep onComplete={handleSignatureComplete} onCancel={() => { }} />
                                    )}

                                    {step === 6 && (
                                        <>
                                            <PasswordStep
                                                password={watch('password') || ''}
                                                confirmPassword={watch('confirmPassword') || ''}
                                                onPasswordChange={(v) => setValue('password', v)}
                                                onConfirmChange={(v) => setValue('confirmPassword', v)}
                                                trigger={trigger as unknown as (names?: string | string[]) => Promise<boolean>}
                                                setError={setErrorAny}
                                                resetPasswords={() => { setValue('password', ''); setValue('confirmPassword', ''); }}
                                                passwordSet={passwordSet}
                                                setPasswordSet={setPasswordSet}
                                            />

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
                                    {step === 7 && <NationalCardScanner onComplete={handleNationalCardScanComplete} onBack={() => setStep(6)} />}

                                    {step === 8 && (
                                        <FinalConfirmation onConfirm={handleDigitalSignature} loading={loading} />
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
