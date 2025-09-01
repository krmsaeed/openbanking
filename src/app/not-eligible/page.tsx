"use client";
import Link from "next/link";
import { XCircleIcon, ArrowLeftIcon, PhoneIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardContent, CardHeader, CardTitle, Box, Typography, List, ListItem } from "@/components/ui";

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
        <Box className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
            <Box className="w-full max-w-2xl">
                <Box className="text-center mb-8">
                    <Box className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircleIcon className="h-10 w-10 text-red-600" />
                    </Box>
                    <Typography variant="h1" className="text-3xl font-bold text-gray-900 mb-2">
                        عدم واجد شرایط دریافت تسهیلات
                    </Typography>
                    <Typography variant="body1" color="secondary" className="text-lg">
                        متأسفانه در حال حاضر شرایط لازم برای دریافت تسهیلات را ندارید
                    </Typography>
                </Box>

                <Box className="grid gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-red-700">
                                دلایل عدم واجد شرایط بودن
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <List variant="unordered" spacing="md" marker={false}>
                                {reasons.map((reason, index) => (
                                    <ListItem key={index} className="flex items-center space-x-3 space-x-reverse">
                                        <Box className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></Box>
                                        <Typography variant="body2" color="secondary">{reason}</Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-blue-700">
                                راه‌کارهای پیشنهادی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Box className="space-y-4">
                                {nextSteps.map((step, index) => (
                                    <Box key={index} className="border-r-4 border-blue-500 pr-4">
                                        <Typography variant="h6" className="font-semibold text-gray-900 mb-1">
                                            {step.title}
                                        </Typography>
                                        <Typography variant="body2" color="secondary">
                                            {step.description}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl text-green-700">
                                راه‌های ارتباطی
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Box className="grid md:grid-cols-2 gap-4">
                                <Box className="flex items-center space-x-3 space-x-reverse">
                                    <PhoneIcon className="h-5 w-5 text-green-600" />
                                    <Box>
                                        <Typography variant="body2" weight="medium">تماس تلفنی</Typography>
                                        <Typography variant="caption" color="secondary">021-12345678</Typography>
                                    </Box>
                                </Box>
                                <Box className="flex items-center space-x-3 space-x-reverse">
                                    <EnvelopeIcon className="h-5 w-5 text-green-600" />
                                    <Box>
                                        <Typography variant="body2" weight="medium">ایمیل پشتیبانی</Typography>
                                        <Typography variant="caption" color="secondary">support@en-bank.com</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box className="flex flex-col sm:flex-row gap-4 justify-center">
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
                </Box>
                <Box className="mt-8 text-center">
                    <Typography variant="body2" color="secondary">
                        می‌توانید پس از بهبود شرایط، مجدداً درخواست دهید
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
