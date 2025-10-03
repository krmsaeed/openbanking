'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Button, Card, CardHeader, CardContent, Loading, Box, Typography } from '@/components/ui';

export default function CreditAssessmentPayment() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const amountTomans = 150000;

    const handlePay = async () => {
        setLoading(true);
        const amount = amountTomans;
        setTimeout(() => {
            setLoading(false);
            router.push(
                `/payment/gateway?amount=${amount}&merchant=${encodeURIComponent('پرداخت نوین')}`
            );
        }, 600);
    };

    return (
        <Box className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <Box className="w-full max-w-md">
                <Card padding="lg">
                    <CardHeader>
                        <Box className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                            <CreditCardIcon className="h-6 w-6 text-white" />
                        </Box>
                        <Typography variant="h6" className="text-center">
                            پرداخت هزینه اعتبارسنجی
                        </Typography>
                        <Typography variant="body2" color="secondary" className="text-center">
                            برای ادامه استفاده از خدمات، لطفاً هزینه اعتبارسنجی را پرداخت کنید
                        </Typography>
                    </CardHeader>
                    <CardContent>
                        <Box className="space-y-6">
                            <Box className="rounded-xl border border-gray-200 bg-white p-4">
                                <Box className="flex items-center justify-between">
                                    <Box>
                                        <Typography variant="caption" color="secondary">
                                            مبلغ قابل پرداخت
                                        </Typography>
                                        <Typography variant="h4" className="mt-1 text-gray-900">
                                            {amountTomans.toLocaleString('fa-IR')}{' '}
                                            <Typography as="span" variant="body2">
                                                تومان
                                            </Typography>
                                        </Typography>
                                    </Box>
                                    <ShieldCheckIcon className="h-8 w-8 text-emerald-600" />
                                </Box>
                                <Typography
                                    variant="caption"
                                    color="secondary"
                                    className="mt-3 block"
                                >
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
                                onClick={() => router.push('/login')}
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
