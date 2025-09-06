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
import { Box, Typography } from "@/components/ui";

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
        <Box className="min-h-screen bg-gray-50 p-6">
            <Box className="max-w-4xl mx-auto">
                <Box className="flex items-center justify-between mb-8">
                    <Box>
                        <Typography variant="h3" className="text-gray-900">
                            پنل کاربری بانک اقتصاد نوین
                        </Typography>
                        <Typography variant="body1" color="secondary" className="mt-2">
                            سعید عزیز خوش آمدید
                        </Typography>
                    </Box>
                    <Button
                        variant="outline"
                        onClick={handleLogout}
                    >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 ml-2" />
                        خروج از حساب
                    </Button>
                </Box>

                <Box className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <Box className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                <BanknotesIcon className="h-6 w-6 text-white" />
                            </Box>
                            <CardTitle>
                                موجودی حساب
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Typography variant="h5" className="text-gray-900">
                                {formatCurrency(balance)}
                            </Typography>
                            <Typography variant="caption" color="secondary" className="mt-2">
                                حساب پس‌انداز - شماره: ۱۲۳۴۵۶۷۸۹
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Box className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center mb-4">
                                <DocumentTextIcon className="h-6 w-6 text-white" />
                            </Box>
                            <CardTitle className="text-center">
                                اعتبارسنجی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Typography variant="body2" color="secondary" className="mb-4">
                                درخواست تسهیلات بانکی
                            </Typography>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => router.push("/credit-assessment")}
                            >
                                شروع اعتبارسنجی
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Typography variant="h6" className="flex items-center">
                                <DocumentTextIcon className="w-5 h-5 text-purple-600 ml-2" />
                                قرارداد تسهیلات
                            </Typography>
                        </CardHeader>
                        <CardContent>
                            <Typography variant="body2" color="secondary" className="mb-4">
                                مشاهده و تأیید قرارداد
                            </Typography>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => router.push("/contract")}
                            >
                                مشاهده قرارداد
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <Typography variant="h6" className="flex items-center">
                                <BanknotesIcon className="w-5 h-5 text-green-600 ml-2" />
                                لیست اقساط
                            </Typography>
                        </CardHeader>
                        <CardContent>
                            <Typography variant="body2" color="secondary" className="mb-4">
                                مشاهده و پرداخت اقساط
                            </Typography>
                            <Button
                                size="sm"
                                className="w-full"
                                onClick={() => router.push("/installments")}
                            >
                                مشاهده اقساط
                            </Button>
                        </CardContent>
                    </Card>


                </Box>

                <Card className="mb-8">
                    <CardHeader>
                        <Typography variant="h6" className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 ml-2" />
                            وضعیت حساب
                        </Typography>
                    </CardHeader>
                    <CardContent>
                        <Box className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                            <Box className="flex items-center">
                                <BuildingLibraryIcon className="w-8 h-8 text-green-600 ml-3" />
                                <Box>
                                    <Typography variant="subtitle2" className="font-semibold text-green-800">
                                        حساب فعال
                                    </Typography>
                                    <Typography variant="body2" className="text-green-700">
                                        اطلاعات شما تأیید شده است
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box>
                            <Typography variant="h6" className="font-medium text-gray-900 mb-3">
                                مراحل تکمیل شده:
                            </Typography>
                            <Box className="space-y-2">
                                {[
                                    'تکمیل اطلاعات شخصی',
                                    'ثبت امضای دیجیتال',
                                    'تأیید هویت با عکس سلفی',
                                    'فعال‌سازی حساب'
                                ].map((item, index) => (
                                    <Box key={index} className="flex items-center">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500 ml-2" />
                                        <Typography variant="body2" className="text-gray-700">{item}</Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

            </Box>
        </Box>
    );
}
