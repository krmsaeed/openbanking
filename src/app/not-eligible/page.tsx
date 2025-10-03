'use client';
import Link from 'next/link';
import {
    XCircleIcon,
    ArrowLeftIcon,
    PhoneIcon,
    EnvelopeIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Box,
    Typography,
    List,
    ListItem,
} from '@/components/ui';

export default function NotEligiblePage() {
    const reasons = [
        'سابقه اعتباری نامناسب',
        'عدم تطبیق درآمد با حداقل مورد نیاز',
        'مدارک ارائه شده ناکافی',
        'عدم پاسخگویی در بررسی‌های اولیه',
    ];

    const nextSteps = [
        {
            title: 'بهبود وضعیت اعتباری',
            description: 'تسویه بدهی‌های معوق و بهبود رکورد اعتباری',
        },
        {
            title: 'افزایش درآمد قابل اثبات',
            description: 'ارائه مدارک معتبر درآمد بیشتر',
        },
        {
            title: 'تکمیل مدارک',
            description: 'ارائه مدارک کامل و به‌روز شده',
        },
    ];

    return (
        <Box className="my-10 flex items-center justify-center rounded-lg border border-gray-100 bg-white from-red-50 p-4 shadow-md">
            <Box className="w-full max-w-2xl">
                <Box className="mb-5 text-center">
                    <Box className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircleIcon className="h-10 w-10 text-red-500" />
                    </Box>
                    <Typography
                        variant="h4"
                        className="mb-2 text-center text-3xl font-bold text-gray-900"
                    >
                        عدم واجد شرایط دریافت تسهیلات
                    </Typography>
                    <Typography variant="p" className="text-secondary text-center text-lg">
                        متأسفانه در حال حاضر شرایط لازم برای دریافت تسهیلات را ندارید
                    </Typography>
                </Box>

                <Box className="mb-8 grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-red-600">
                                دلایل عدم واجد شرایط بودن
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <List variant="unordered" spacing="md" marker={false}>
                                {reasons.map((reason, index) => (
                                    <ListItem
                                        key={index}
                                        className="flex items-center gap-2 space-x-2 space-x-reverse"
                                    >
                                        <Box className="rounded-full bg-red-500 p-2">
                                            <XMarkIcon className="w-3.5` h-3.5` font-bold text-white" />
                                        </Box>
                                        <Typography variant="p" className="text-secondary">
                                            {reason}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-primary-700 text-xl">
                                راه‌کارهای پیشنهادی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Box className="space-y-4">
                                {nextSteps.map((step, index) => (
                                    <Box
                                        key={index}
                                        className="border-primary-500 rounded-none border-r-3 pr-4"
                                    >
                                        <Typography
                                            variant="h6"
                                            className="mb-1 text-right font-semibold text-gray-900"
                                        >
                                            {step.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="secondary"
                                            className="text-right"
                                        >
                                            {step.description}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardTitle className="text-xl text-green-700">راه‌های ارتباطی</CardTitle>
                        <CardContent>
                            <Box className="grid gap-4 md:grid-cols-2">
                                <Box className="flex items-center space-x-3 space-x-reverse">
                                    <PhoneIcon className="h-5 w-5 text-green-600" />
                                    <Box>
                                        <Typography variant="body2" weight="medium">
                                            تماس تلفنی
                                        </Typography>
                                        <Typography variant="caption" color="secondary">
                                            021-12345678
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box className="flex items-center space-x-3 space-x-reverse">
                                    <EnvelopeIcon className="h-5 w-5 text-green-600" />
                                    <Box>
                                        <Typography variant="body2" weight="medium">
                                            ایمیل پشتیبانی
                                        </Typography>
                                        <Typography variant="caption" color="secondary">
                                            support@en-bank.com
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Link href="/credit-assessment">
                        <Button variant="outline" size="lg" className="w-full sm:w-auto">
                            <ArrowLeftIcon className="ml-2 h-4 w-4" />
                            درخواست مجدد
                        </Button>
                    </Link>

                    <Link href="/">
                        <Button size="lg" className="w-full sm:w-auto">
                            بازگشت به داشبورد
                        </Button>
                    </Link>
                </Box>
                <Box className="mt-8 text-center">
                    <Typography variant="body2" color="secondary" className="text-center">
                        می‌توانید پس از بهبود شرایط، مجدداً درخواست دهید
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
