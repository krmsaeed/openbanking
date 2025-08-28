"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { UserIcon, ArrowRightIcon, CheckCircleIcon, CameraIcon, PencilIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/core/Button";
import { Input } from "@/components/ui/forms/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/core/Card";
import { Loading } from "@/components/ui/feedback/Loading";
import { IdentityVerification } from "@/components/ui/specialized/IdentityVerification";
import { SignatureCapture } from "@/components/ui/specialized/SignatureCapture";

// Schema for form validation
const personalInfoSchema = z.object({
    firstName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
    nationalId: z.string().length(10, "کد ملی باید ۱۰ رقم باشد").regex(/^\d+$/, "کد ملی باید فقط شامل عدد باشد"),
    phoneNumber: z.string().regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد"),
    email: z.string().email("ایمیل وارد شده معتبر نیست").optional().or(z.literal("")),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

export default function Register() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [identityVerified, setIdentityVerified] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
    } = useForm<PersonalInfoForm>({
        resolver: zodResolver(personalInfoSchema),
        mode: "onBlur",
    });

    const handleNext = () => {
        if (step === 1) {
            handleSubmit(onPersonalInfoSubmit)();
        }
    };

    const onPersonalInfoSubmit = (data: PersonalInfoForm) => {
        toast.success("اطلاعات شخصی ثبت شد");
        setStep(2);
    };

    const handleSignatureComplete = (signatureFile: File) => {
        setSignatureFile(signatureFile);
        toast.success("امضا ثبت شد");
        setStep(3);
    };

    const handleIdentityVerification = (selfieFile: File | null, videoFile: File | null) => {
        if (!videoFile) {
            toast.error("لطفاً فیلم هویت‌سنجی را ارسال کنید");
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setIdentityVerified(true);
            setLoading(false);
            toast.success("احراز هویت با موفقیت انجام شد!");

            setTimeout(() => {
                toast.success("ثبت‌نام با موفقیت انجام شد! خوش آمدید!");
                router.push("/dashboard");
            }, 1500);
        }, 3000);
    };

    const getStepTitle = () => {
        switch (step) {
            case 1:
                return "اطلاعات شخصی";
            case 2:
                return "ثبت امضا";
            case 3:
                return "احراز هویت";
            default:
                return "";
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 1:
                return "اطلاعات شخصی خود را وارد کنید";
            case 2:
                return "امضای الکترونیک خود را ثبت کنید";
            case 3:
                return "برای تکمیل ثبت‌نام، احراز هویت انجام دهید";
            default:
                return "";
        }
    };

    const getStepIcon = () => {
        switch (step) {
            case 1:
                return <UserIcon className="h-6 w-6 text-white" />;
            case 2:
                return <PencilIcon className="h-6 w-6 text-white" />;
            case 3:
                return <CameraIcon className="h-6 w-6 text-white" />;
            default:
                return <UserIcon className="h-6 w-6 text-white" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-lg w-full">

                <Button
                    variant="ghost"
                    onClick={() => {
                        if (step === 1) {
                            router.push("/");
                        } else if (step === 2) {
                            setStep(1);
                        } else {
                            setStep(2);
                        }
                    }}
                    className="mb-8"
                    disabled={loading}
                >
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                    بازگشت
                </Button>

                <Card padding="lg">
                    <CardHeader>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${step === 1 ? "bg-blue-600" : step === 2 ? "bg-orange-600" : "bg-green-600"
                            }`}>
                            {getStepIcon()}
                        </div>

                        <CardTitle className="text-center">
                            ثبت نام در بانک اقتصاد نوین
                        </CardTitle>
                        <CardDescription className="text-center">
                            {getStepDescription()}
                        </CardDescription>

                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center mt-6">
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step > 1 ? <CheckCircleIcon className="w-4 h-4" /> : "1"}
                                </div>
                                <div className={`w-16 h-1 mx-2 transition-colors ${step >= 2 ? 'bg-orange-600' : 'bg-gray-200'
                                    }`} />
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step > 2 ? <CheckCircleIcon className="w-4 h-4" /> : "2"}
                                </div>
                                <div className={`w-16 h-1 mx-2 transition-colors ${step >= 3 ? 'bg-green-600' : 'bg-gray-200'
                                    }`} />
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {identityVerified ? <CheckCircleIcon className="w-4 h-4" /> : "3"}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {step === 1 && (
                            <form onSubmit={handleSubmit(onPersonalInfoSubmit)} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Input
                                            {...register("firstName")}
                                            label="نام"
                                            placeholder="نام را وارد کنید"
                                            required
                                        />
                                        {errors.firstName && (
                                            <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Input
                                            {...register("lastName")}
                                            label="نام خانوادگی"
                                            placeholder="نام خانوادگی را وارد کنید"
                                            required
                                        />
                                        {errors.lastName && (
                                            <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Input
                                        {...register("nationalId")}
                                        label="کد ملی"
                                        placeholder="0123456789"
                                        maxLength={10}
                                        required
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "");
                                            e.target.value = value;
                                        }}
                                    />
                                    {errors.nationalId && (
                                        <p className="text-red-500 text-xs mt-1">{errors.nationalId.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        {...register("phoneNumber")}
                                        label="شماره تلفن همراه"
                                        type="tel"
                                        placeholder="09123456789"
                                        maxLength={11}
                                        className="text-left"
                                        required
                                    />
                                    {errors.phoneNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        {...register("email")}
                                        label="ایمیل (اختیاری)"
                                        type="email"
                                        placeholder="example@gmail.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Input
                                        {...register("password")}
                                        label="رمز عبور"
                                        type="password"
                                        placeholder="حداقل ۶ کاراکتر"
                                        required
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full mt-8"
                                >
                                    ادامه به ثبت امضا
                                </Button>
                            </form>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <SignatureCapture
                                    onComplete={handleSignatureComplete}
                                    onCancel={() => setStep(1)}
                                />
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                    <h3 className="font-medium text-blue-900 mb-2">احراز هویت</h3>
                                    <p className="text-sm text-blue-800">
                                        برای تکمیل فرآیند ثبت‌نام، نیاز به ضبط یک فیلم کوتاه برای احراز هویت دارید.
                                    </p>
                                </div>

                                <IdentityVerification
                                    onComplete={handleIdentityVerification}
                                    onCancel={() => setStep(2)}
                                />

                                {loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="text-center">
                                            <Loading size="lg" />
                                            <p className="mt-4 text-sm text-gray-600">
                                                در حال احراز هویت...
                                            </p>
                                        </div>
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
    );
}
