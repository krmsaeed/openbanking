"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircleIcon,
    BuildingLibraryIcon,
    BanknotesIcon,
    DocumentTextIcon,
    ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/core/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/core/Card";

export default function Dashboard() {
    const router = useRouter();
    const [balance] = useState(2450000);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('fa-IR') + ' ریال';
    };

    const handleLogout = () => {
        router.push("/");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            پنل کاربری بانک اقتصاد نوین
                        </h1>
                        <p className="text-gray-600">
                            سعید عزیز خوش آمدید
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                    >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 ml-2" />
                        خروج از حساب
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                <BanknotesIcon className="h-6 w-6 text-white" />
                            </div>
                            <CardTitle>
                                موجودی حساب
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(balance)}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                حساب پس‌انداز - شماره: ۱۲۳۴۵۶۷۸۹
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center mb-4">
                                <DocumentTextIcon className="h-6 w-6 text-white" />
                            </div>
                            <CardTitle>
                                اعتبارسنجی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 mb-4">
                                درخواست تسهیلات بانکی
                            </p>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => router.push("/credit-assessment")}
                            >
                                شروع اعتبارسنجی
                            </Button>
                        </CardContent>
                    </Card>


                </div>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 ml-2" />
                            وضعیت حساب
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center">
                                <BuildingLibraryIcon className="w-8 h-8 text-green-600 ml-3" />
                                <div>
                                    <p className="font-semibold text-green-800">
                                        حساب فعال
                                    </p>
                                    <p className="text-sm text-green-700">
                                        اطلاعات شما تأیید شده است
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                                مراحل تکمیل شده:
                            </h4>
                            <div className="space-y-2">
                                {[
                                    'تکمیل اطلاعات شخصی',
                                    'ثبت امضای دیجیتال',
                                    'تأیید هویت با عکس سلفی',
                                    'فعال‌سازی حساب'
                                ].map((item, index) => (
                                    <div key={index} className="flex items-center">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500 ml-2" />
                                        <span className="text-sm text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
