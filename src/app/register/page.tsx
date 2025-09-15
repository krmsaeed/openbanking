"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationFormSchema, type RegistrationFormData } from "@/lib/schemas/common";
import { z } from "zod";
import toast from "react-hot-toast";
import { verificationService } from "@/services/verification";
import {
    UserIcon, CheckCircleIcon, CameraIcon, PencilIcon,
    CalendarIcon, EyeIcon, LockClosedIcon,
    DocumentCheckIcon, KeyIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/core/Button";
import { Input } from "@/components/ui/forms";
import { PersianCalendar, MultiOTPInput, NationalCardTemplate, CameraSelfie } from "@/components/forms";
import { VideoRecorder } from "@/components/new-user";
import { SignatureCapture } from "../../components/ui/specialized/SignatureCapture";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/core/Card";
import { Loading } from "@/components/ui/feedback/Loading";

const personalInfoSchema = registrationFormSchema;
type PersonalInfoForm = RegistrationFormData;

const step2Schema = z.object({
    birthDate: z.string().min(1, "تاریخ تولد الزامی است"),
    postalCode: z.string().length(10, "کد پستی باید 10 رقم باشد").regex(/^\d+$/, "کد پستی باید فقط شامل اعداد باشد"),
});
type Step2Form = z.infer<typeof step2Schema>;

export default function Register() {
    const router = useRouter();
    const [step, setStep] = useState(4);
    const [loading, setLoading] = useState(false);

    const [step1Data, setStep1Data] = useState<RegistrationFormData | null>(null);
    const [step2Data, setStep2Data] = useState<{ birthDate: string; postalCode: string } | null>(null);
    const [showNationalCardTemplate, setShowNationalCardTemplate] = useState(false);
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [otp1, setOtp1] = useState<string>('');
    const [otp2, setOtp2] = useState<string>('');
    const [videoSample, setVideoSample] = useState<File | undefined>(undefined);
    const [signatureSample, setSignatureSample] = useState<File | undefined>(undefined);
    const [selfieSample, setSelfieSample] = useState<File | undefined>(undefined);
    const [showSignatureCapture, setShowSignatureCapture] = useState(false);

    const {
        control: step1Control,
        handleSubmit: handleStep1Submit,
        formState: { errors: step1Errors },
    } = useForm<PersonalInfoForm>({
        resolver: zodResolver(personalInfoSchema),
        mode: "onBlur",
    });

    const {
        control: step2Control,
        handleSubmit: handleStep2FormSubmit,
        formState: { errors: step2Errors },
    } = useForm<Step2Form>({
        resolver: zodResolver(step2Schema),
        mode: "onChange",
    });

    const onPersonalInfoSubmit = (data: PersonalInfoForm) => {
        setStep1Data(data);
        toast.success("اطلاعات شخصی ثبت شد");
        setStep(2);
    };

    const handleStep2Submit = (data: Step2Form) => {
        setStep2Data(data);
        setShowNationalCardTemplate(true);
        toast.success("تاریخ تولد و کد پستی ثبت شد");
        return data;
    };

    const handleNationalCardConfirm = () => {
        setShowNationalCardTemplate(false);
        setStep(3);
    };

    const handleSelfiePhoto = (file: File) => {
        // store selfie for later submission
        setSelfieSample(file);
        toast.success("عکس سلفی ثبت شد");
        setStep(4);
    };

    const handleVideoRecording = (file: File) => {
        setVideoSample(file);
        setShowSignatureCapture(true);
        toast.success("فیلم احراز هویت ثبت شد؛");
    };

    const handleSignatureComplete = (file: File) => {
        setSignatureSample(file);
        setShowSignatureCapture(false);
        toast.success('نمونه امضای شما ثبت شد');
        setStep(5);
    };

    void videoSample;
    void signatureSample;
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

    const handleOtp1Submit = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success("کد تایید اول تأیید شد");
            setStep(7);
        }, 2000);
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
                        email: step1Data?.email,
                        phone: step1Data?.phoneNumber,
                        name: `${step1Data?.firstName || ''} ${step1Data?.lastName || ''}`,
                    }
                };

                toast.success('در حال ارسال نمونه امضا و ویدیو برای احراز هویت');
                const resp = await verificationService.submitVerification(payload);
                if (!resp.success) {
                    toast.error(resp.message || 'خطا در ارسال اطلاعات احراز هویت');
                    setLoading(false);
                    return;
                } else {
                    toast.success('نمونه امضا و ویدیو با موفقیت ارسال شد');
                }
            }

            toast.success("امضای دیجیتال تأیید شد");
            setTimeout(() => {
                toast.success("ثبت‌نام با موفقیت انجام شد! خوش آمدید!");
                router.push("/dashboard");
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
            case 1: return "اطلاعات شخصی خود را وارد کنید";
            case 2: return showNationalCardTemplate ? "اطلاعات کارت ملی خود را بررسی کنید" : "تاریخ تولد و کد پستی را وارد کنید";
            case 3: return "عکس سلفی خود را بگیرید";
            case 4: return "فیلم احراز هویت ضبط کنید";
            case 5: return "امضای دیجیتال را ثبت کنید";
            case 6: return "رمز عبور خود را تنظیم کنید";
            case 7: return <span dir="ltr">{"کد تایید ارسال شده را وارد کنید"}</span>;
            case 8: return <span dir="ltr">{"برای صدور گواهی دیجیتال، کد تایید را وارد کنید"}</span>;
            case 9: return "امضای دیجیتال را تأیید کنید";
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
                                    case 4: return "امضای دیجیتال";
                                    case 6: return "کد تایید";
                                    case 7: return "گواهی دیجیتال";
                                    case 8: return "امضای دیجیتال";
                                    case 9: return "تنظیم رمز عبور";
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
                                        <form onSubmit={handleStep1Submit(onPersonalInfoSubmit)} className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Controller
                                                    name="firstName"
                                                    control={step1Control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="نام"
                                                            placeholder="نام را وارد کنید"
                                                            required
                                                            error={step1Errors.firstName?.message}
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="lastName"
                                                    control={step1Control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="نام خانوادگی"
                                                            placeholder="نام خانوادگی را وارد کنید"
                                                            required
                                                            error={step1Errors.lastName?.message}
                                                        />
                                                    )}
                                                />
                                            </div>

                                            <Controller
                                                name="nationalCode"
                                                control={step1Control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="کد ملی"
                                                        placeholder="0123456789"
                                                        maxLength={10}
                                                        required
                                                        error={step1Errors.nationalCode?.message}
                                                        type="tel"
                                                        dir="ltr"
                                                        className="text-center"
                                                    />
                                                )}
                                            />

                                            <Controller
                                                name="phoneNumber"
                                                control={step1Control}
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
                                                        error={step1Errors.phoneNumber?.message}
                                                    />
                                                )}
                                            />

                                            <Controller
                                                name="email"
                                                control={step1Control}
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="ایمیل (اختیاری)"
                                                        type="email"
                                                        placeholder="example@gmail.com"
                                                        dir="ltr"
                                                        className="text-center"
                                                        error={step1Errors.email?.message}
                                                    />
                                                )}
                                            />

                                            <Button type="submit" size="lg" className="w-full mt-8">
                                                ادامه
                                            </Button>
                                        </form>
                                    )}

                                    {step === 2 && !showNationalCardTemplate && (
                                        <form onSubmit={handleStep2FormSubmit(handleStep2Submit)} className="space-y-6">
                                            <div>
                                                <Controller
                                                    name="birthDate"
                                                    control={step2Control}
                                                    defaultValue=""
                                                    render={({ field }) => (
                                                        <PersianCalendar
                                                            label="تاریخ تولد"
                                                            placeholder="تاریخ تولد را انتخاب کنید"
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            required
                                                            className="w-full"
                                                        />
                                                    )}
                                                />
                                                {step2Errors.birthDate?.message && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {step2Errors.birthDate.message}
                                                    </p>
                                                )}
                                            </div>

                                            <Controller
                                                name="postalCode"
                                                control={step2Control}
                                                defaultValue=""
                                                render={({ field }) => (
                                                    <Input
                                                        {...field}
                                                        label="کد پستی"
                                                        placeholder="1234567890"
                                                        maxLength={10}
                                                        type="tel"
                                                        dir="ltr"
                                                        className="text-center"
                                                        required
                                                        error={step2Errors.postalCode?.message}
                                                    />
                                                )}
                                            />

                                            <Button
                                                type="submit"
                                                size="lg"
                                                className="w-full mt-8"
                                            >
                                                ادامه
                                            </Button>
                                        </form>
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
                                            <SignatureCapture
                                                onComplete={handleSignatureComplete}
                                                onCancel={() => setShowSignatureCapture(false)}
                                            />
                                        </div>
                                    )}

                                    {step === 6 && !showSignatureCapture && (
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

                                    {step === 7 && (
                                        <div className="space-y-6">
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                                <h3 className="font-medium text-blue-900 mb-2">کد تایید</h3>
                                                <p className="text-sm text-blue-800">
                                                    <span dir="ltr">کد تایید ۵ رقمی به شماره {step1Data?.phoneNumber} ارسال شد.</span>
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

                                    {step === 8 && (
                                        <div className="space-y-6">
                                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                                                <h3 className="font-medium text-purple-900 mb-2">صدور گواهی دیجیتال</h3>
                                                <p className="text-sm text-purple-800">
                                                    <span dir="ltr">برای صدور گواهی دیجیتال، کد تایید جدید ارسال شد.</span>
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

                                    {step === 9 && (
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
