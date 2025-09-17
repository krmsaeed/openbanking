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
import { authService } from '@/services/auth';
import { Button } from "@/components/ui/core/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/Card";
import { Loading } from '@/components/ui/feedback/Loading';
import { Box, Typography } from "@/components/ui";
import Image from 'next/image';
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
    const [loadingOtp1, setLoadingOtp1] = useState(false);
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

    // helper wrapper so child components can call setError with plain string names
    const setErrorAny = (name: string, error: { type: string; message?: string }) => {
        // single cast boundary for react-hook-form setError
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

        // Show inline OTP UI (do NOT auto-send request). User must click ارسال to request code.
        setShowOtp1(true);
        // initialize otp/password fields in the form
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
    const handleSendOtp = async () => {
        const phone = step1Data?.phoneNumber;
        if (!phone) {
            setError('phoneNumber', { type: 'manual', message: 'شماره همراه موجود نیست' });
            return;
        }

        try {
            setLoadingOtp1(true);
            const resp = await authService.sendOtp(phone);
            if (resp && resp.success) {
                toast.success('کد تایید به شماره همراه ارسال شد');
            } else {
                toast('کد تایید ارسال شد (شبیه‌سازی)');
            }
        } catch (err) {
            console.error('sendOtp error', err);
            setError('otp', { type: 'manual', message: 'ارسال کد ناموفق بود' });
        } finally {
            setLoadingOtp1(false);
        }
    };

    const handleNationalCardConfirm = () => {
        setShowNationalCardTemplate(false);
        setStep(3);
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
            setStep(8);
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
            case 3: return "فیلم احراز هویت";
            case 4: return "عکس سلفی";
            case 5: return "ثبت امضای دیجیتال";
            case 6: return "اسکن کارت و تعیین شعبه ";
            case 7: return <span dir="ltr">{"ارسال کد تایید"}</span>;
            case 8: return "پیش نمایش قرارداد";
            default: return "";
        }
    };

    function handleNationalCardScanComplete(file: File, branch: string): void {
        // For now, just show a toast and move to the next step (selfie)
        toast.success("تصویر کارت ملی و شعبه ثبت شد");
        setShowNationalCardTemplate(false);
        setStep(7);
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

                                            {/* Inline OTP after personal info (no new step) */}
                                            {showOtp1 && (
                                                <div className="mt-4">
                                                    <Controller
                                                        name="otp"
                                                        control={control}
                                                        defaultValue={''}
                                                        render={({ field }) => (
                                                            <>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <Button onClick={handleSendOtp} variant="outline">ارسال کد</Button>
                                                                </div>
                                                                <CertificateStep otp={field.value ?? ''} setOtp={field.onChange} onIssue={() => ((field.value ?? '').length === 5 ? handleVerifyOtpAfterPersonal() : setError('otp', { type: 'manual', message: 'کد تایید را کامل وارد کنید' }))} loading={loadingOtp1} />
                                                                {registerErrors.otp?.message && (<p className="mt-2 text-sm text-red-600">{registerErrors.otp?.message}</p>)}
                                                            </>
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

                                    {step === 6 && <NationalCardScanner onComplete={handleNationalCardScanComplete} onBack={() => setStep(5)} />}
                                    {step === 7 && (
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

                                    {step === 8 && (
                                        <Box className="space-y-6">
                                            <Box className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                                <Typography variant="h3" className="font-medium text-green-900 mb-2 text-center">امضای دیجیتال</Typography>
                                                <Typography variant="body1" className="text-sm text-green-800 text-center">گواهی دیجیتال شما با موفقیت صادر شد. در این مرحله می‌توانید قرارداد بانکی را دانلود کنید.</Typography>
                                            </Box>

                                            <Box className="bg-white border rounded p-4 text-right">
                                                <Typography variant="body2" className="text-sm text-right">قرارداد بانکی</Typography>
                                                <Typography variant="body2" className="text-sm mt-2 text-right">لطفا فایل قرارداد را دانلود و نگهداری کنید.</Typography>

                                                <div className="mt-4 flex justify-center">
                                                    <div className="w-80 h-56 overflow-hidden rounded border">
                                                        <Image src={'/bank-contract-preview.jpg'} alt="contract preview" width={640} height={420} style={{ objectFit: 'contain' }} />
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex gap-2 justify-center">
                                                    <a href={'/bank-contract-preview.jpg'} download className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded">دانلود تصویر قرارداد</a>
                                                    <a href={'/bank-contract.pdf'} download className="inline-flex items-center justify-center px-4 py-2 bg-secondary text-white rounded">دانلود قرارداد (PDF)</a>
                                                </div>
                                            </Box>

                                            <Button onClick={handleDigitalSignature} size="lg" className="w-full" disabled={loading}>{loading && (<Loading size="sm" className="ml-1" />)} تایید امضای دیجیتال</Button>

                                        </Box>
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
