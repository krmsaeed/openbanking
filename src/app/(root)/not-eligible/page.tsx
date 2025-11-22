'use client';
import ThemeToggle from '@/components/ThemeToggle';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    List,
    ListItem,
    Typography,
} from '@/components/ui';
import {
    EnvelopeIcon,
    ExclamationTriangleIcon,
    PhoneIcon,
    XCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function NotEligiblePage() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorContent = () => {
        switch (error) {
            case 'missing_params':
                return {
                    title: 'اطلاعات ناکافی',
                    description: 'لینک ورود شما ناقص است و توکن یا کد ملی را شامل نمی‌شود',
                    icon: ExclamationTriangleIcon,
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-500',
                    reasons: ['توکن احراز هویت موجود نیست', 'کد ملی ارائه نشده است'],
                };
            case 'invalid_national_id':
                return {
                    title: 'کد ملی نامعتبر',
                    description: 'کد ملی ارائه شده معتبر نیست',
                    icon: ExclamationTriangleIcon,
                    iconBg: 'bg-yellow-100',
                    iconColor: 'text-yellow-500',
                    reasons: ['فرمت کد ملی صحیح نیست', 'کد ملی چک‌سام صحیحی ندارد'],
                };
            case 'not_authenticated':
                return {
                    title: 'عدم احراز هویت',
                    description: 'برای دسترسی به این سرویس باید احراز هویت شده باشید',
                    icon: ExclamationTriangleIcon,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-500',
                    reasons: ['توکن احراز هویت موجود نیست', 'جلسه شما منقضی شده است'],
                };
            default:
                return {
                    title: 'عدم واجد شرایط دریافت تسهیلات',
                    description: 'متأسفانه در حال حاضر شرایط لازم برای دریافت تسهیلات را ندارید',
                    icon: XCircleIcon,
                    iconBg: 'bg-red-100',
                    iconColor: 'text-red-500',
                    reasons: [
                        'سابقه اعتباری نامناسب',
                        'عدم تطبیق درآمد با حداقل مورد نیاز',
                        'مدارک ارائه شده ناکافی',
                        'عدم پاسخگویی در بررسی‌های اولیه',
                    ],
                };
        }
    };

    const content = getErrorContent();
    const IconComponent = content.icon;

    const reasons = content.reasons;

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
        <Box className="relative my-10 flex items-center justify-center rounded-lg bg-white from-red-50 p-4 shadow-md">
            <ThemeToggle className="absolute top-2 right-1" />
            <Box className="w-full max-w-5xl">
                <Box className="mb-5 text-center">
                    <Box
                        className={`mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-full ${content.iconBg}`}
                    >
                        <IconComponent className={`${content.iconColor} m-0.5`} />
                    </Box>
                    <Typography
                        variant="h4"
                        className="mb-2 text-center text-3xl font-bold text-gray-900"
                    >
                        {content.title}
                    </Typography>
                    <Typography variant="p" className="text-secondary text-center text-lg">
                        {content.description}
                    </Typography>
                </Box>

                <Box className="mb-8 grid gap-6">
                    <Card>
                        <CardHeader>
                            <Typography
                                className={`mx-auto text-center text-xl font-bold ${error && error !== 'service_error' ? 'text-yellow-600' : 'text-red-600'}`}
                            >
                                {' '}
                                {error && error !== 'service_error'
                                    ? 'علت خطا'
                                    : 'دلایل عدم واجد شرایط بودن'}
                            </Typography>
                        </CardHeader>
                        <CardContent>
                            <List marker={false} className="w-full">
                                {reasons.map((reason, index) => (
                                    <ListItem key={index}>
                                        <Box className="flex items-center">
                                            <XMarkIcon className="m-1 h-5 w-5 rounded-full bg-red-500 font-bold text-white" />
                                            <Typography
                                                variant="p"
                                                className="text-error-800 w-full"
                                            >
                                                {reason}
                                            </Typography>
                                        </Box>
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
                                            variant="p"
                                            className="mb-1 text-right text-lg font-semibold"
                                        >
                                            {step.title}
                                        </Typography>
                                        <Typography
                                            variant="p"
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
                <Box className="my-8 text-center">
                    <Typography variant="body2" className="text-center text-gray-800">
                        می‌توانید پس از بهبود شرایط، مجدداً درخواست دهید
                    </Typography>
                </Box>
                <Box className="flex flex-col justify-center gap-4 sm:flex-row">
                    {/* <Link href="/">
                        <Button variant="outline" size="md" className="w-full sm:w-auto">
                            <ArrowLeftIcon className="ml-2 h-4 w-4" />
                            درخواست مجدد
                        </Button>
                    </Link> */}

                    <Link href="/">
                        <Button size="lg" className="w-full sm:w-auto">
                            درخواست مجدد
                        </Button>
                    </Link>
                </Box>
            </Box>
        </Box>
    );
}
