"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CalendarDaysIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    ArrowLeftIcon,
    CreditCardIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function InstallmentsPage() {
    const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);

    const contractInfo = {
        contractNumber: "TC-2025-001234",
        customerName: "محمد احمدی",
        facilityAmount: "50,000,000",
        totalInstallments: 12,
        paidInstallments: 5,
        remainingAmount: "20,833,335"
    };

    const installments = [
        { id: 1, dueDate: "۱۴۰۴/۰۷/۰۵", amount: "4,583,333", status: "paid", payDate: "۱۴۰۴/۰۷/۰۳", penalty: "0" },
        { id: 2, dueDate: "۱۴۰۴/۰۸/۰۵", amount: "4,583,333", status: "paid", payDate: "۱۴۰۴/۰۸/۰۴", penalty: "0" },
        { id: 3, dueDate: "۱۴۰۴/۰۹/۰۵", amount: "4,583,333", status: "paid", payDate: "۱۴۰۴/۰۹/۰۶", penalty: "25,000" },
        { id: 4, dueDate: "۱۴۰۴/۱۰/۰۵", amount: "4,583,333", status: "paid", payDate: "۱۴۰۴/۱۰/۰۲", penalty: "0" },
        { id: 5, dueDate: "۱۴۰۴/۱۱/۰۵", amount: "4,583,333", status: "paid", payDate: "۱۴۰۴/۱۱/۰۵", penalty: "0" },
        { id: 6, dueDate: "۱۴۰۴/۱۲/۰۵", amount: "4,583,333", status: "overdue", payDate: null, penalty: "137,500" },
        { id: 7, dueDate: "۱۴۰۵/۰۱/۰۵", amount: "4,583,333", status: "current", payDate: null, penalty: "0" },
        { id: 8, dueDate: "۱۴۰۵/۰۲/۰۵", amount: "4,583,333", status: "upcoming", payDate: null, penalty: "0" },
        { id: 9, dueDate: "۱۴۰۵/۰۳/۰۵", amount: "4,583,333", status: "upcoming", payDate: null, penalty: "0" },
        { id: 10, dueDate: "۱۴۰۵/۰۴/۰۵", amount: "4,583,333", status: "upcoming", payDate: null, penalty: "0" },
        { id: 11, dueDate: "۱۴۰۵/۰۵/۰۵", amount: "4,583,333", status: "upcoming", payDate: null, penalty: "0" },
        { id: 12, dueDate: "۱۴۰۵/۰۶/۰۵", amount: "4,583,333", status: "upcoming", payDate: null, penalty: "0" }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
            case 'overdue':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
            case 'current':
                return <ClockIcon className="h-5 w-5 text-blue-600" />;
            default:
                return <CalendarDaysIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'paid':
                return 'پرداخت شده';
            case 'overdue':
                return 'معوق';
            case 'current':
                return 'قسط جاری';
            default:
                return 'آینده';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'overdue':
                return 'bg-red-100 text-red-800';
            case 'current':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const totalPenalty = installments.reduce((sum, inst) => sum + parseInt(inst.penalty.replace(/,/g, '')), 0);
    const overdueCount = installments.filter(inst => inst.status === 'overdue').length;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            لیست اقساط تسهیلات
                        </h1>
                        <p className="text-gray-600">
                            قرارداد {contractInfo.contractNumber} - {contractInfo.customerName}
                        </p>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline">
                            <ArrowLeftIcon className="h-4 w-4 ml-2" />
                            بازگشت
                        </Button>
                    </Link>
                </div>

                {/* خلاصه قرارداد */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-600">مبلغ کل تسهیلات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-blue-600">{contractInfo.facilityAmount} ریال</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-600">اقساط پرداخت شده</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-green-600">
                                {contractInfo.paidInstallments} از {contractInfo.totalInstallments}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-600">مانده بدهی</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-orange-600">{contractInfo.remainingAmount} ریال</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-600">اقساط معوق</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600">{overdueCount} قسط</p>
                        </CardContent>
                    </Card>
                </div>

                {/* هشدار اقساط معوق */}
                {overdueCount > 0 && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <div className="flex items-center space-x-3 space-x-reverse">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                                <div>
                                    <h3 className="font-bold text-red-800">توجه: اقساط معوق</h3>
                                    <p className="text-red-700 text-sm mt-1">
                                        شما {overdueCount} قسط معوق دارید. مجموع جریمه تأخیر: {totalPenalty.toLocaleString('fa-IR')} ریال
                                    </p>
                                </div>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                    پرداخت فوری
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* جدول اقساط */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BanknotesIcon className="h-5 w-5 text-blue-600 ml-2" />
                            جدول اقساط
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">قسط</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">تاریخ سررسید</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">مبلغ قسط</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">جریمه</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">تاریخ پرداخت</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">وضعیت</th>
                                        <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">عملیات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {installments.map((installment) => (
                                        <tr
                                            key={installment.id}
                                            className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedInstallment === installment.id ? 'bg-blue-50' : ''
                                                }`}
                                            onClick={() => setSelectedInstallment(installment.id)}
                                        >
                                            <td className="py-4 px-4">
                                                <span className="font-medium text-gray-900">
                                                    قسط {installment.id}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-700">
                                                {installment.dueDate}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="font-bold text-gray-900">
                                                    {installment.amount} ریال
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {installment.penalty !== "0" ? (
                                                    <span className="text-red-600 font-medium">
                                                        {installment.penalty} ریال
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-gray-700">
                                                {installment.payDate || '-'}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center space-x-2 space-x-reverse">
                                                    {getStatusIcon(installment.status)}
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(installment.status)}`}>
                                                        {getStatusText(installment.status)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                {(installment.status === 'current' || installment.status === 'overdue') && (
                                                    <Button size="sm" variant="outline">
                                                        <CreditCardIcon className="h-4 w-4 ml-1" />
                                                        پرداخت
                                                    </Button>
                                                )}
                                                {installment.status === 'paid' && (
                                                    <Button size="sm" variant="ghost">
                                                        <DocumentTextIcon className="h-4 w-4 ml-1" />
                                                        رسید
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* اطلاعات تکمیلی */}
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">راهنمای پرداخت</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-center space-x-2 space-x-reverse">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>اقساط تا تاریخ ۵ هر ماه قابل پرداخت هستند</span>
                                </li>
                                <li className="flex items-center space-x-2 space-x-reverse">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span>پس از تاریخ سررسید، جریمه تأخیر محاسبه می‌شود</span>
                                </li>
                                <li className="flex items-center space-x-2 space-x-reverse">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>امکان پرداخت زودهنگام با تخفیف موجود است</span>
                                </li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">اطلاعات تماس</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-900">پشتیبانی: </span>
                                    <span className="text-gray-700">021-12345678</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">کد مشتری: </span>
                                    <span className="text-gray-700">123456</span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">شماره حساب: </span>
                                    <span className="text-gray-700">627412-1234567890</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
