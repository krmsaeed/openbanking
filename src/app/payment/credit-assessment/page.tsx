"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCardIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Loading } from "@/components/ui";

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <Card padding="lg">
                    <CardHeader>
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CreditCardIcon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-center">پرداخت هزینه اعتبارسنجی</CardTitle>
                        <CardDescription className="text-center">
                            برای ادامه استفاده از خدمات، لطفاً هزینه اعتبارسنجی را پرداخت کنید
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="p-4 bg-white rounded-xl border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500">مبلغ قابل پرداخت</div>
                                        <div className="text-2xl font-bold text-gray-900 mt-1">
                                            {amountTomans.toLocaleString("fa-IR")} <span className="text-base font-normal">تومان</span>
                                        </div>
                                    </div>
                                    <ShieldCheckIcon className="w-8 h-8 text-emerald-600" />
                                </div>
                                <p className="text-xs text-gray-500 mt-3">
                                    پرداخت امن از طریق درگاه بانکی انجام می‌شود.
                                </p>
                            </div>

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
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
