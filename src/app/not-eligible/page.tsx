"use client";

import Link from "next/link";
import { XCircleIcon, ArrowLeftIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function NotEligiblePage() {
    const reasons = [
        "سابقه اعتباری نامناسب",
        "عدم تطبیق درآمد با حداقل مورد نیاز",
        "مدارک ارائه شده ناکافی",
        "عدم پاسخگویی در بررسی‌های اولیه"
    ];

    const nextSteps = [
        {
            title: "بهبود وضعیت اعتباری",
            description: "تسویه بدهی‌های معوق و بهبود رکورد اعتباری"
        },
        {
            title: "افزایش درآمد قابل اثبات",
            description: "ارائه مدارک معتبر درآمد بیشتر"
        },
        {
            title: "تکمیل مدارک",
            description: "ارائه مدارک کامل و به‌روز شده"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircleIcon className="h-10 w-10 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        عدم واجد شرایط دریافت تسهیلات
                    </h1>
                    <p className="text-gray-600 text-lg">
                        متأسفانه در حال حاضر شرایط لازم برای دریافت تسهیلات را ندارید
                    </p>
                </div>

                <div className="grid gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-red-700">
                                دلایل عدم واجد شرایط بودن
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {reasons.map((reason, index) => (
                                    <li key={index} className="flex items-center space-x-3 space-x-reverse">
                                        <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                        <span className="text-gray-700">{reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-blue-700">
                                راه‌کارهای پیشنهادی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {nextSteps.map((step, index) => (
                                    <div key={index} className="border-r-4 border-blue-500 pr-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {step.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {step.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-green-700">
                                راه‌های ارتباطی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <PhoneIcon className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">تماس تلفنی</p>
                                        <p className="text-gray-600 text-sm">021-12345678</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    <EnvelopeIcon className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-gray-900">ایمیل پشتیبانی</p>
                                        <p className="text-gray-600 text-sm">support@en-bank.com</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/credit-assessment">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            <ArrowLeftIcon className="h-4 w-4 ml-2" />
                            درخواست مجدد
                        </Button>
                    </Link>

                    <Link href="/dashboard">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto"
                        >
                            بازگشت به داشبورد
                        </Button>
                    </Link>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        می‌توانید پس از بهبود شرایط، مجدداً درخواست دهید
                    </p>
                </div>
            </div>
        </div>
    );
}
