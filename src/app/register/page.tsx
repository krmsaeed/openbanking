"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationFormSchema, type RegistrationFormData } from "@/lib/schemas/common";
import toast from "react-hot-toast";
import {
    UserIcon, CheckCircleIcon, CameraIcon, PencilIcon,
    CalendarIcon, EyeIcon, LockClosedIcon,
    DocumentCheckIcon, KeyIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/core/Button";
import { Input } from "@/components/ui/forms";
import { PersianCalendar, MultiOTPInput, NationalCardTemplate, CameraSelfie } from "@/components/forms";
import { VideoRecorder } from "@/components/new-user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/core/Card";
import { Loading } from "@/components/ui/feedback/Loading";

const personalInfoSchema = registrationFormSchema;
type PersonalInfoForm = RegistrationFormData;

export default function Register() {
    const router = useRouter();
    const [step, setStep] = useState(2);
    const [loading, setLoading] = useState(false);

    // Step data states
    const [step1Data, setStep1Data] = useState<RegistrationFormData | null>(null);
    const [step2Data, setStep2Data] = useState<{ birthDate: string; postalCode: string } | null>(null);
    const [showNationalCardTemplate, setShowNationalCardTemplate] = useState(false);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [otp1, setOtp1] = useState<string>('');
    const [otp2, setOtp2] = useState<string>('');

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<PersonalInfoForm>({
        resolver: zodResolver(personalInfoSchema),
        mode: "onBlur",
    });

    // Step 1: Personal Info
    const onPersonalInfoSubmit = (data: PersonalInfoForm) => {
        console.log("Form data:", data);
        console.log("Registration data saved:", data);
        setStep1Data(data);
        toast.success("اطلاعات شخصی ثبت شد");
        setStep(2);
    };

    // Step 2: Birth Date & Postal Code
    const handleStep2Submit = (data: { birthDate: string; postalCode: string }) => {
        setStep2Data(data);
        setShowNationalCardTemplate(true);
        toast.success("تاریخ تولد و کد پستی ثبت شد");
    };

    // Handle National Card Template Confirmation
    const handleNationalCardConfirm = () => {
        setShowNationalCardTemplate(false);
        setStep(3);
    };

    // Step 3: Selfie Photo
    const handleSelfiePhoto = (file: File) => {
        console.log('Selfie photo captured:', file);
        toast.success("عکس سلفی ثبت شد");
        setStep(4);
    };

    // Step 4: Video Recording
    const handleVideoRecording = (file: File) => {
        console.log('Video recorded:', file);
        toast.success("فیلم احراز هویت ثبت شد");
        setStep(5);
    };

    // Step 5: Set Password
    const handlePasswordSubmit = () => {
        if (password !== confirmPassword) {
            toast.error("رمز عبور و تایید آن باید یکسان باشد");
            return;
        }
        if (password.length < 8) {
            toast.error("رمز عبور باید حداقل ۸ کاراکتر باشد");
            return;
        }
        toast.success("رمز عبور تنظیم شد");
        setStep(6);
    };

    // Step 6: First OTP
    const handleOtp1Submit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("کد تایید اول تأیید شد");
            setStep(7);
        }, 2000);
    };

    // Step 7: Second OTP for Digital Certificate
    const handleOtp2Submit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("گواهی دیجیتال صادر شد");
            setStep(8);
        }, 2000);
    };

    // Step 8: Final Digital Signature
    const handleDigitalSignature = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("امضای دیجیتال تأیید شد");
            setTimeout(() => {
                toast.success("ثبت‌نام با موفقیت انجام شد! خوش آمدید!");
                router.push("/dashboard");
            }, 1500);
        }, 2000);
    };

    const getStepDescription = () => {
        switch (step) {
            case 1: return "اطلاعات شخصی خود را وارد کنید";
            case 2: return showNationalCardTemplate ? "اطلاعات کارت ملی خود را بررسی کنید" : "تاریخ تولد و کد پستی را وارد کنید";
            case 3: return "عکس سلفی خود را بگیرید";
            case 4: return "فیلم احراز هویت ضبط کنید";
            case 5: return "رمز عبور خود را تنظیم کنید";
            case 6: return "کد تایید ارسال شده را وارد کنید";
            case 7: return "برای صدور گواهی دیجیتال، کد تایید را وارد کنید";
            case 8: return "امضای دیجیتال را تأیید کنید";
            default: return "";
        }
    };

    const getStepColor = () => {
        if (step === 2 && showNationalCardTemplate) {
            return 'bg-green-600';
        }
        const colors = [
            'bg-blue-600', 'bg-indigo-600', 'bg-yellow-600',
            'bg-red-600', 'bg-purple-600', 'bg-pink-600', 'bg-orange-600', 'bg-gray-600'
        ];
        return colors[step - 1] || 'bg-blue-600';
    };

    return (
        <div className="my-8 p-6  flex justify-center  gap-4 ">

            <div className="flex-shrink-0 w-64">

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">
                        مراحل ثبت‌نام
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((stepNumber) => {
                            const isCompleted = stepNumber < step;
                            const isCurrent = stepNumber === step;

                            const getStepIconByNumber = (num: number) => {
                                switch (num) {
                                    case 1: return <UserIcon className="h-5 w-5" />;
                                    case 2: return <CalendarIcon className="h-5 w-5" />;
                                    case 3: return <EyeIcon className="h-5 w-5" />;
                                    case 4: return <CameraIcon className="h-5 w-5" />;
                                    case 5: return <LockClosedIcon className="h-5 w-5" />;
                                    case 6: return <KeyIcon className="h-5 w-5" />;
                                    case 7: return <DocumentCheckIcon className="h-5 w-5" />;
                                    case 8: return <PencilIcon className="h-5 w-5" />;
                                    default: return <UserIcon className="h-5 w-5" />;
                                }
                            };

                            const getStepTitle = (num: number) => {
                                switch (num) {
                                    case 1: return "اطلاعات شخصی";
                                    case 2: return "تاریخ تولد و کد پستی";
                                    case 3: return "عکس سلفی";
                                    case 4: return "فیلم احراز هویت";
                                    case 5: return "تنظیم رمز عبور";
                                    case 6: return "کد تایید";
                                    case 7: return "گواهی دیجیتال";
                                    case 8: return "امضای دیجیتال";
                                    default: return "";
                                }
                            };

                            return (
                                <div key={stepNumber} className="relative flex items-center">
                                    <div className="flex items-center w-full">
                                        <div
                                            className={`
                                                        w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 flex-shrink-0 relative z-10
                                                        ${isCompleted
                                                    ? 'bg-green-600 text-white'
                                                    : isCurrent
                                                        ? `${getStepColor()} text-white shadow-lg ring-4 ring-opacity-20 ${getStepColor().replace('bg-', 'ring-')}`
                                                        : 'bg-gray-200 text-gray-500'
                                                }
                                                    `}
                                        >
                                            {isCompleted ? (
                                                <CheckCircleIcon className="h-6 w-6" />
                                            ) : (
                                                getStepIconByNumber(stepNumber)
                                            )}
                                        </div>
                                        <div className="mr-4 flex-1">
                                            <div
                                                className={`
                                                            text-sm font-medium transition-colors duration-300
                                                            ${isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'}
                                                        `}
                                            >
                                                {getStepTitle(stepNumber)}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                مرحله {stepNumber}
                                            </div>
                                        </div>
                                    </div>
                                    {stepNumber < 8 && (
                                        <div
                                            className={`
                                                        absolute right-6 top-12 w-0.5 h-8 transition-all duration-300 z-0
                                                        ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                                                    `}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div className="rounded-lg shadow-md border border-gray-100">
                <div className="max-w-6xl w-full mx-auto">

                    <div className="flex gap-8">
                        <div className="flex-1">
                            <Card padding="lg">
                                <CardHeader>
                                    <CardTitle className="text-center">
                                        ثبت نام در بانک اقتصاد نوین
                                    </CardTitle>
                                    <CardDescription className="text-center">
                                        {getStepDescription()}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    {step === 1 && (
                                        <form onSubmit={handleSubmit(onPersonalInfoSubmit)} className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Controller
                                                    name="firstName"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="نام"
                                                            placeholder="نام را وارد کنید"
                                                            required
                                                            error={errors.firstName?.message}
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="lastName"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="نام خانوادگی"
                                                            placeholder="نام خانوادگی را وارد کنید"
                                                            required
                                                            error={errors.lastName?.message}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <Controller
                                                name="nationalCode"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="کد ملی"
                                                        placeholder="0123456789"
                                                        maxLength={10}
                                                        required
                                                        error={errors?.nationalCode?.message}
                                                        type="tel"
                                                        dir="ltr"
                                                        className="text-center"
                                                    />
                                                )}
                                            />

                                            <Controller
                                                name="phoneNumber"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="شماره تلفن همراه"
                                                        type="tel"
                                                        placeholder="09123456789"
                                                        maxLength={11}
                                                        className="text-center"
                                                        dir="ltr"
                                                        required
                                                        error={errors.phoneNumber?.message}
                                                    />
                                                )}
                                            />

                                            <Controller
                                                name="email"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="ایمیل (اختیاری)"
                                                        type="email"
                                                        placeholder="example@gmail.com"
                                                        dir="ltr"
                                                        className="text-center"
                                                        error={errors.email?.message}
                                                    />
                                                )}
                                            />

                                            <Button type="submit" size="lg" className="w-full mt-8">
                                                ادامه
                                            </Button>
                                        </form>
                                    )}

                                    {step === 2 && !showNationalCardTemplate && (
                                        <div className="">
                                            <PersianCalendar
                                                label="تاریخ تولد"
                                                placeholder="تاریخ تولد را انتخاب کنید"
                                                value={step2Data?.birthDate || ''}
                                                onChange={(value) => setStep2Data(prev => ({ ...prev, birthDate: value, postalCode: prev?.postalCode || '' }))}
                                                required
                                                className="w-full"
                                            />

                                            <Input
                                                label="کد پستی"
                                                placeholder="1234567890"
                                                value={step2Data?.postalCode || ''}
                                                onChange={(e) => setStep2Data(prev => ({ ...prev, postalCode: e.target.value, birthDate: prev?.birthDate || '' }))}
                                                maxLength={10}
                                                type="tel"
                                                dir="ltr"
                                                className="text-center"
                                                required
                                            />

                                            <Button
                                                onClick={() => step2Data?.birthDate && step2Data?.postalCode ? handleStep2Submit(step2Data) : toast.error("لطفاً تمام فیلدها را پر کنید")}
                                                size="lg"
                                                className="w-full mt-8"
                                            >
                                                ادامه
                                            </Button>
                                        </div>
                                    )}

                                    {step === 2 && showNationalCardTemplate && (
                                        <div className="space-y-6">
                                            <NationalCardTemplate
                                                firstName={step1Data?.firstName || ''}
                                                lastName={step1Data?.lastName || ''}
                                                nationalCode={step1Data?.nationalCode || ''}
                                                birthDate={step2Data?.birthDate || ''}
                                                onConfirm={handleNationalCardConfirm}
                                            />
                                        </div>
                                    )}

                                    {step === 3 && (
                                        <div className="space-y-6">
                                            <CameraSelfie
                                                onPhotoCapture={handleSelfiePhoto}
                                                onCancel={() => setStep(2)}
                                            />
                                        </div>
                                    )}

                                    {step === 4 && (
                                        <div className="space-y-6">
                                            <VideoRecorder
                                                onComplete={handleVideoRecording}
                                                onCancel={() => setStep(3)}
                                            />
                                        </div>
                                    )}

                                    {step === 5 && (
                                        <div className="space-y-6">
                                            <Input
                                                label="رمز عبور"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="رمز عبور را وارد کنید"
                                                required
                                            />
                                            <Input
                                                label="تایید رمز عبور"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="رمز عبور را مجدداً وارد کنید"
                                                required
                                            />
                                            <Button onClick={handlePasswordSubmit} size="lg" className="w-full">
                                                ادامه
                                            </Button>
                                        </div>
                                    )}

                                    {step === 6 && (
                                        <div className="space-y-6">
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                                <h3 className="font-medium text-blue-900 mb-2">کد تایید</h3>
                                                <p className="text-sm text-blue-800">
                                                    کد تایید ۵ رقمی به شماره {step1Data?.phoneNumber} ارسال شد.
                                                </p>
                                            </div>
                                            <MultiOTPInput
                                                value={otp1}
                                                onChange={setOtp1}
                                                length={5}
                                            />
                                            <Button
                                                onClick={() => otp1.length === 5 ? handleOtp1Submit() : toast.error("کد تایید را کامل وارد کنید")}
                                                size="lg"
                                                className="w-full"
                                                disabled={loading}
                                            >
                                                تایید کد
                                            </Button>
                                            {loading && (
                                                <div className="flex justify-center py-4">
                                                    <Loading size="sm" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {step === 7 && (
                                        <div className="space-y-6">
                                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                                                <h3 className="font-medium text-purple-900 mb-2">صدور گواهی دیجیتال</h3>
                                                <p className="text-sm text-purple-800">
                                                    برای صدور گواهی دیجیتال، کد تایید جدید ارسال شد.
                                                </p>
                                            </div>
                                            <MultiOTPInput
                                                value={otp2}
                                                onChange={setOtp2}
                                                length={5}
                                            />
                                            <Button
                                                onClick={() => otp2.length === 5 ? handleOtp2Submit() : toast.error("کد تایید را کامل وارد کنید")}
                                                size="lg"
                                                className="w-full"
                                                disabled={loading}
                                            >
                                                صدور گواهی
                                            </Button>
                                            {loading && (
                                                <div className="flex justify-center py-4">
                                                    <Loading size="sm" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {step === 8 && (
                                        <div className="space-y-6">
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                                                <h3 className="font-medium text-green-900 mb-2">امضای دیجیتال</h3>
                                                <p className="text-sm text-green-800">
                                                    گواهی دیجیتال شما با موفقیت صادر شد. برای تکمیل فرآیند، امضای دیجیتال را تأیید کنید.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={handleDigitalSignature}
                                                size="lg"
                                                className="w-full"
                                                disabled={loading}
                                            >
                                                تایید امضای دیجیتال
                                            </Button>
                                            {loading && (
                                                <div className="flex justify-center py-4">
                                                    <Loading size="sm" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {step === 1 && (
                                        <div className="text-center mt-6">
                                            <p className="text-sm text-gray-600">
                                                قبلاً ثبت نام کرده‌اید؟{" "}
                                                <Link
                                                    href="/login"
                                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    وارد شوید
                                                </Link>
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
