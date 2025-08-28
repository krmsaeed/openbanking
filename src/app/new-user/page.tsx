"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import {
    Button,
    Input,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    FormField,
    useToast,
    IdentityVerification
} from "@/components/ui";

export default function NewUserRegistration() {
    const router = useRouter();
    const { success, error, info } = useToast();
    const [step, setStep] = useState(1); // 1: اطلاعات پایه، 2: احراز هویت

    // اطلاعات پایه کاربر
    const [userInfo, setUserInfo] = useState({
        firstName: "",
        lastName: "",
        nationalCode: "",
        mobile: "",
        email: "",
        birthDate: ""
    });

    // فایل‌های احراز هویت
    const [verificationVideo, setVerificationVideo] = useState<File | null>(null);

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields = ['firstName', 'lastName', 'nationalCode', 'mobile'];
        const missingFields = requiredFields.filter(field => !userInfo[field as keyof typeof userInfo]);

        if (missingFields.length > 0) {
            error("لطفاً تمام فیلدهای ضروری را پر کنید");
            return;
        }

        // بررسی کد ملی (ساده)
        if (userInfo.nationalCode.length !== 10) {
            error("کد ملی باید 10 رقم باشد");
            return;
        }

        // بررسی شماره موبایل
        if (!/^09\d{9}$/.test(userInfo.mobile)) {
            error("شماره موبایل معتبر نیست");
            return;
        }

        success("اطلاعات پایه تأیید شد");
        setStep(2);
    };

    const handleIdentityVerificationComplete = (selfie: File | null, video: File | null) => {
        if (!video) {
            error("فیلم احراز هویت ضروری است");
            return;
        }

        setVerificationVideo(video);
        success("احراز هویت تکمیل شد!");

        // شبیه‌سازی ارسال داده‌ها
        setTimeout(() => {
            info("در حال پردازش اطلاعات...");
            setTimeout(() => {
                success("حساب کاربری با موفقیت ایجاد شد!");
                router.push("/verification?type=new-user");
            }, 2000);
        }, 1000);
    };

    const handleIdentityVerificationCancel = () => {
        setStep(1);
    };

    if (step === 2) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => setStep(1)}
                            className="mb-4"
                        >
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                            بازگشت به اطلاعات پایه
                        </Button>

                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">احراز هویت</h1>
                            <p className="text-gray-600">
                                برای تأیید هویت خود، لطفاً مراحل زیر را تکمیل کنید
                            </p>
                        </div>

                        {/* نمایش اطلاعات کاربر */}
                        <Card padding="sm" className="mb-6">
                            <CardContent>
                                <div className="text-sm text-gray-600">
                                    <p><span className="font-medium">نام:</span> {userInfo.firstName} {userInfo.lastName}</p>
                                    <p><span className="font-medium">کد ملی:</span> {userInfo.nationalCode}</p>
                                    <p><span className="font-medium">موبایل:</span> {userInfo.mobile}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <IdentityVerification
                        onComplete={handleIdentityVerificationComplete}
                        onCancel={handleIdentityVerificationCancel}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <Button
                    variant="ghost"
                    onClick={() => router.push('/register')}
                    className="mb-8"
                >
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                    بازگشت
                </Button>

                <Card padding="lg">
                    <CardHeader>
                        <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <UserPlusIcon className="h-6 w-6 text-white" />
                        </div>

                        <CardTitle className="text-center">
                            ایجاد حساب جدید
                        </CardTitle>
                        <CardDescription className="text-center">
                            اطلاعات پایه خود را وارد کنید
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleStep1Submit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="نام" required>
                                    <Input
                                        type="text"
                                        placeholder="نام خود را وارد کنید"
                                        value={userInfo.firstName}
                                        onChange={(e) => setUserInfo(prev => ({
                                            ...prev,
                                            firstName: e.target.value
                                        }))}
                                    />
                                </FormField>

                                <FormField label="نام خانوادگی" required>
                                    <Input
                                        type="text"
                                        placeholder="نام خانوادگی"
                                        value={userInfo.lastName}
                                        onChange={(e) => setUserInfo(prev => ({
                                            ...prev,
                                            lastName: e.target.value
                                        }))}
                                    />
                                </FormField>
                            </div>

                            <FormField label="کد ملی" required>
                                <Input
                                    type="text"
                                    placeholder="کد ملی 10 رقمی"
                                    maxLength={10}
                                    value={userInfo.nationalCode}
                                    onChange={(e) => setUserInfo(prev => ({
                                        ...prev,
                                        nationalCode: e.target.value.replace(/\D/g, '')
                                    }))}
                                />
                            </FormField>

                            <FormField label="شماره موبایل" required>
                                <Input
                                    type="tel"
                                    placeholder="09123456789"
                                    maxLength={11}
                                    value={userInfo.mobile}
                                    onChange={(e) => setUserInfo(prev => ({
                                        ...prev,
                                        mobile: e.target.value.replace(/\D/g, '')
                                    }))}
                                />
                            </FormField>

                            <FormField label="ایمیل (اختیاری)">
                                <Input
                                    type="email"
                                    placeholder="example@email.com"
                                    value={userInfo.email}
                                    onChange={(e) => setUserInfo(prev => ({
                                        ...prev,
                                        email: e.target.value
                                    }))}
                                />
                            </FormField>

                            <FormField label="تاریخ تولد (اختیاری)">
                                <Input
                                    type="date"
                                    value={userInfo.birthDate}
                                    onChange={(e) => setUserInfo(prev => ({
                                        ...prev,
                                        birthDate: e.target.value
                                    }))}
                                />
                            </FormField>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-medium text-blue-900 mb-2">مرحله بعد: احراز هویت</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• ضبط ویدیو با خواندن متن تأیید</li>
                                    <li>• تأیید نهایی هویت</li>
                                </ul>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                            >
                                ادامه به احراز هویت
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
