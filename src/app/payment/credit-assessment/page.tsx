"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCardIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Loading, Box, Typography } from "@/components/ui";

export default function CreditAssessmentPayment() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const amountTomans = 150000;

    const handlePay = async () => {
        setLoading(true);
        const amount = amountTomans;
        setTimeout(() => {
            setLoading(false);
            router.push(`/payment/gateway?amount=${amount}&merchant=${encodeURIComponent("پرداخت نوین")}`);
        }, 600);
    };

    return (
        <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <Box className="max-w-md w-full">
                <Card padding="lg">
                    <CardHeader>
                        <Box className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CreditCardIcon className="h-6 w-6 text-white" />
                        </Box>
                        <Typography variant="h6" className="text-center">پرداخت هزینه اعتبارسنجی</Typography>
                        <Typography variant="body2" color="secondary" className="text-center">
                            برای ادامه استفاده از خدمات، لطفاً هزینه اعتبارسنجی را پرداخت کنید
                        </Typography>
                    </CardHeader>
                    <CardContent>
                        <Box className="space-y-6">
                            <Box className="p-4 bg-white rounded-xl border border-gray-200">
                                <Box className="flex items-center justify-between">
                                    <Box>
                                        <Typography variant="caption" color="secondary">مبلغ قابل پرداخت</Typography>
                                        <Typography variant="h4" className="text-gray-900 mt-1">
                                            {amountTomans.toLocaleString("fa-IR")} <Typography as="span" variant="body2">تومان</Typography>
                                        </Typography>
                                    </Box>
                                    <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
                                </Box>
                                <Typography variant="caption" color="secondary" className="mt-3 block">
                                    پرداخت امن از طریق درگاه بانکی انجام می‌شود.
                                </Typography>
                            </Box>

                            <Button
                                onClick={handlePay}
                                disabled={loading}
                                size="lg"
                                className="w-full"
                            >
                                {loading ? <Loading size="sm" className="ml-2" /> : null}
                                انتقال به درگاه بانکی و پرداخت
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => router.push("/login")}
                                className="w-full"
                            >
                                انصراف
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
