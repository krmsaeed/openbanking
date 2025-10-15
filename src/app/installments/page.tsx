'use client';

import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    List,
    ListItem,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    Typography,
} from '@/components/ui';
import {
    ArrowLeftIcon,
    BanknotesIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ClockIcon,
    CreditCardIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function InstallmentsPage() {
    const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);

    const contractInfo = {
        contractNumber: 'TC-2025-001234',
        customerName: 'محمد احمدی',
        facilityAmount: '50,000,000',
        totalInstallments: 12,
        paidInstallments: 5,
        remainingAmount: '20,833,335',
    };

    const installments = [
        {
            id: 1,
            dueDate: '۱۴۰۴/۰۷/۰۵',
            amount: '4,583,333',
            status: 'paid',
            payDate: '۱۴۰۴/۰۷/۰۳',
            penalty: '0',
        },
        {
            id: 2,
            dueDate: '۱۴۰۴/۰۸/۰۵',
            amount: '4,583,333',
            status: 'paid',
            payDate: '۱۴۰۴/۰۸/۰۴',
            penalty: '0',
        },
        {
            id: 3,
            dueDate: '۱۴۰۴/۰۹/۰۵',
            amount: '4,583,333',
            status: 'paid',
            payDate: '۱۴۰۴/۰۹/۰۶',
            penalty: '25,000',
        },
        {
            id: 4,
            dueDate: '۱۴۰۴/۱۰/۰۵',
            amount: '4,583,333',
            status: 'paid',
            payDate: '۱۴۰۴/۱۰/۰۲',
            penalty: '0',
        },
        {
            id: 5,
            dueDate: '۱۴۰۴/۱۱/۰۵',
            amount: '4,583,333',
            status: 'paid',
            payDate: '۱۴۰۴/۱۱/۰۵',
            penalty: '0',
        },
        {
            id: 6,
            dueDate: '۱۴۰۴/۱۲/۰۵',
            amount: '4,583,333',
            status: 'overdue',
            payDate: null,
            penalty: '137,500',
        },
        {
            id: 7,
            dueDate: '۱۴۰۵/۰۱/۰۵',
            amount: '4,583,333',
            status: 'current',
            payDate: null,
            penalty: '0',
        },
        {
            id: 8,
            dueDate: '۱۴۰۵/۰۲/۰۵',
            amount: '4,583,333',
            status: 'upcoming',
            payDate: null,
            penalty: '0',
        },
        {
            id: 9,
            dueDate: '۱۴۰۵/۰۳/۰۵',
            amount: '4,583,333',
            status: 'upcoming',
            payDate: null,
            penalty: '0',
        },
        {
            id: 10,
            dueDate: '۱۴۰۵/۰۴/۰۵',
            amount: '4,583,333',
            status: 'upcoming',
            payDate: null,
            penalty: '0',
        },
        {
            id: 11,
            dueDate: '۱۴۰۵/۰۵/۰۵',
            amount: '4,583,333',
            status: 'upcoming',
            payDate: null,
            penalty: '0',
        },
        {
            id: 12,
            dueDate: '۱۴۰۵/۰۶/۰۵',
            amount: '4,583,333',
            status: 'upcoming',
            payDate: null,
            penalty: '0',
        },
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

    const totalPenalty = installments.reduce(
        (sum, inst) => sum + parseInt(inst.penalty.replace(/,/g, '')),
        0
    );
    const overdueCount = installments.filter((inst) => inst.status === 'overdue').length;

    return (
        <Box className="min-h-screen bg-gray-50 py-8">
            <Box className="mx-auto max-w-6xl px-4">
                <Box className="mb-8 flex items-center justify-between">
                    <Box>
                        <Typography variant="h3" className="mb-2 font-bold text-gray-900">
                            لیست اقساط تسهیلات
                        </Typography>
                        <Typography variant="body1" color="secondary">
                            قرارداد {contractInfo.contractNumber} - {contractInfo.customerName}
                        </Typography>
                    </Box>
                    <Button as="link" href="/" variant="primary">
                        <ArrowLeftIcon className="ml-2 h-4 w-4" />
                        بازگشت
                    </Button>
                </Box>

                <Box className="mb-8 grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-600">مبلغ کل تسهیلات</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-primary-600 text-2xl font-bold">
                                {contractInfo.facilityAmount} ریال
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-600">
                                اقساط پرداخت شده
                            </CardTitle>
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
                            <p className="text-2xl font-bold text-orange-600">
                                {contractInfo.remainingAmount} ریال
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm text-gray-600">اقساط معوق</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-error-600 text-2xl font-bold">{overdueCount} قسط</p>
                        </CardContent>
                    </Card>
                </Box>

                {overdueCount > 0 && (
                    <Card className="bg-error-100 mb-6 border-red-200">
                        <Box className="flex items-center justify-between space-x-3 space-x-reverse">
                            <Box className="flex items-center gap-3">
                                <ExclamationTriangleIcon className="h-6 w-6 flex-shrink-0 text-red-600" />
                                <Box>
                                    <Typography variant="h6" className="font-bold text-gray-700">
                                        توجه: اقساط معوق
                                    </Typography>
                                    <Typography variant="body2" className="mt-1 text-gray-700">
                                        شما {overdueCount} قسط معوق دارید. مجموع جریمه تأخیر:{' '}
                                        {totalPenalty.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                            <Button size="sm" className="bg-error text-dark-700">
                                پرداخت فوری
                            </Button>
                        </Box>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <BanknotesIcon className="ml-2 h-5 w-5 text-blue-600" />
                            جدول اقساط
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table variant="hover" size="md" responsive>
                            <TableHeader>
                                <TableRow>
                                    <TableCell
                                        as="th"
                                        variant="header"
                                        className="text-md text-center font-bold text-gray-800"
                                    >
                                        ردیف
                                    </TableCell>
                                    <TableCell
                                        as="th"
                                        variant="header"
                                        className="text-md text-center font-bold text-gray-800"
                                    >
                                        تاریخ سررسید
                                    </TableCell>
                                    <TableCell
                                        as="th"
                                        variant="header"
                                        className="text-md text-center font-bold text-gray-800"
                                    >
                                        مبلغ قسط
                                    </TableCell>
                                    <TableCell
                                        as="th"
                                        variant="header"
                                        className="text-md text-center font-bold text-gray-800"
                                    >
                                        جریمه
                                    </TableCell>
                                    <TableCell
                                        as="th"
                                        variant="header"
                                        className="text-md text-center font-bold text-gray-800"
                                    >
                                        تاریخ پرداخت
                                    </TableCell>
                                    <TableCell
                                        as="th"
                                        variant="header"
                                        className="text-md text-center font-bold text-gray-800"
                                    >
                                        وضعیت
                                    </TableCell>
                                    <TableCell
                                        as="th"
                                        variant="header"
                                        className="text-md text-center font-bold text-gray-800"
                                        align="center"
                                    >
                                        عملیات
                                    </TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {installments.map((installment) => (
                                    <TableRow
                                        key={installment.id}
                                        variant={
                                            selectedInstallment === installment.id
                                                ? 'selected'
                                                : 'default'
                                        }
                                        interactive
                                        onClick={() => setSelectedInstallment(installment.id)}
                                    >
                                        <TableCell weight="medium" className="text-center">
                                            {' '}
                                            {installment.id}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {installment.dueDate}
                                        </TableCell>
                                        <TableCell className="flex gap-1 text-center">
                                            <Typography variant="body2" color="text" weight="bold">
                                                {installment.amount}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text"
                                                className="text-xs"
                                            >
                                                ریال
                                            </Typography>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {installment.penalty !== '0' ? (
                                                <Typography
                                                    variant="body2"
                                                    color="error"
                                                    weight="medium"
                                                >
                                                    {installment.penalty} ریال
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="secondary">
                                                    -
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {installment.payDate || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Box className="flex items-center space-x-2 space-x-reverse">
                                                {getStatusIcon(installment.status)}
                                                <Typography
                                                    variant="caption"
                                                    weight="medium"
                                                    className={`rounded-full px-2 py-1 text-gray-700 ${getStatusColor(installment.status)}`}
                                                >
                                                    {getStatusText(installment.status)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell variant="action" className="text-center">
                                            {(installment.status === 'current' ||
                                                installment.status === 'overdue') && (
                                                <Button size="sm" variant="secondary">
                                                    <CreditCardIcon className="ml-1 h-4 w-4" />
                                                    پرداخت
                                                </Button>
                                            )}
                                            {installment.status === 'paid' && (
                                                <Button size="sm" variant="success">
                                                    <DocumentTextIcon className="ml-1 h-4 w-4" />
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

                <Box className="mt-8 grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">راهنمای پرداخت</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <List variant="unordered" spacing="sm" marker={false}>
                                <ListItem className="flex items-center space-x-2 space-x-reverse">
                                    <Box className="h-2 w-2 rounded-full bg-blue-500"></Box>
                                    <Typography variant="body2" color="secondary">
                                        اقساط تا تاریخ ۵ هر ماه قابل پرداخت هستند
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex items-center space-x-2 space-x-reverse">
                                    <Box className="h-2 w-2 rounded-full bg-red-500"></Box>
                                    <Typography variant="body2" color="secondary">
                                        پس از تاریخ سررسید، جریمه تأخیر محاسبه می‌شود
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex items-center space-x-2 space-x-reverse">
                                    <Box className="h-2 w-2 rounded-full bg-green-500"></Box>
                                    <Typography variant="body2" color="secondary">
                                        امکان پرداخت زودهنگام با تخفیف موجود است
                                    </Typography>
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
