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
import { Button, Card, CardContent, CardHeader, CardTitle, Box, Typography, List, ListItem, Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui";

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
                return 'پرداخت نشده';
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
        <Box className="min-h-screen bg-gray-50 py-8">
            <Box className="max-w-6xl mx-auto px-4">
                <Box className="flex items-center justify-between mb-8">
                    <Box>
                        <Typography variant="h1" className="text-3xl font-bold text-gray-900 mb-2">
                            لیست اقساط تسهیلات
                        </Typography>
                        <Typography variant="body1" color="secondary">
                            قرارداد {contractInfo.contractNumber} - {contractInfo.customerName}
                        </Typography>
                    </Box>
                    <Link href="/">
                        <Button variant="outline">
                            <ArrowLeftIcon className="h-4 w-4 ml-2" />
                            بازگشت
                        </Button>
                    </Link>
                </Box>

                <Box className="grid md:grid-cols-4 gap-6 mb-8">
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
                </Box>

                {overdueCount > 0 && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="pt-6">
                            <Box className="flex items-center space-x-3 space-x-reverse">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                                <Box>
                                    <Typography variant="h6" className="font-bold text-red-800">توجه: اقساط معوق</Typography>
                                    <Typography variant="body2" className="text-red-700 mt-1">
                                        شما {overdueCount} قسط معوق دارید. مجموع جریمه تأخیر: {totalPenalty.toLocaleString('fa-IR')} ریال
                                    </Typography>
                                </Box>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                    پرداخت فوری
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BanknotesIcon className="h-5 w-5 text-blue-600 ml-2" />
                            جدول اقساط
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table variant="hover" size="md" responsive>
                            <TableHeader>
                                <TableRow>
                                    <TableCell as="th" variant="header" weight="medium">قسط</TableCell>
                                    <TableCell as="th" variant="header" weight="medium">تاریخ سررسید</TableCell>
                                    <TableCell as="th" variant="header" weight="medium">مبلغ قسط</TableCell>
                                    <TableCell as="th" variant="header" weight="medium">جریمه</TableCell>
                                    <TableCell as="th" variant="header" weight="medium">تاریخ پرداخت</TableCell>
                                    <TableCell as="th" variant="header" weight="medium">وضعیت</TableCell>
                                    <TableCell as="th" variant="header" weight="medium" align="center">عملیات</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {installments.map((installment) => (
                                    <TableRow
                                        key={installment.id}
                                        variant={selectedInstallment === installment.id ? 'selected' : 'default'}
                                        interactive
                                        onClick={() => setSelectedInstallment(installment.id)}
                                    >
                                        <TableCell weight="medium">
                                            قسط {installment.id}
                                        </TableCell>
                                        <TableCell>
                                            {installment.dueDate}
                                        </TableCell>
                                        <TableCell variant="numeric" weight="bold">
                                            {installment.amount} ریال
                                        </TableCell>
                                        <TableCell>
                                            {installment.penalty !== "0" ? (
                                                <Typography variant="body2" color="error" weight="medium">
                                                    {installment.penalty} ریال
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="secondary">-</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {installment.payDate || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <Box className="flex items-center space-x-2 space-x-reverse">
                                                {getStatusIcon(installment.status)}
                                                <Typography
                                                    variant="caption"
                                                    weight="medium"
                                                    className={`px-2 py-1 rounded-full ${getStatusColor(installment.status)}`}
                                                >
                                                    {getStatusText(installment.status)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell variant="action">
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Box className="grid md:grid-cols-2 gap-6 mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">راهنمای پرداخت</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <List variant="unordered" spacing="sm" marker={false}>
                                <ListItem className="flex items-center space-x-2 space-x-reverse">
                                    <Box className="w-2 h-2 bg-blue-500 rounded-full"></Box>
                                    <Typography variant="body2" color="secondary">اقساط تا تاریخ ۵ هر ماه قابل پرداخت هستند</Typography>
                                </ListItem>
                                <ListItem className="flex items-center space-x-2 space-x-reverse">
                                    <Box className="w-2 h-2 bg-red-500 rounded-full"></Box>
                                    <Typography variant="body2" color="secondary">پس از تاریخ سررسید، جریمه تأخیر محاسبه می‌شود</Typography>
                                </ListItem>
                                <ListItem className="flex items-center space-x-2 space-x-reverse">
                                    <Box className="w-2 h-2 bg-green-500 rounded-full"></Box>
                                    <Typography variant="body2" color="secondary">امکان پرداخت زودهنگام با تخفیف موجود است</Typography>
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">اطلاعات تماس</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Box className="space-y-3 text-sm">
                                <Box>
                                    <span className="font-medium text-gray-900">پشتیبانی: </span>
                                    <span className="text-gray-700">021-12345678</span>
                                </Box>
                                <Box>
                                    <span className="font-medium text-gray-900">کد مشتری: </span>
                                    <span className="text-gray-700">123456</span>
                                </Box>
                                <Box>
                                    <span className="font-medium text-gray-900">شماره حساب: </span>
                                    <span className="text-gray-700">627412-1234567890</span>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
