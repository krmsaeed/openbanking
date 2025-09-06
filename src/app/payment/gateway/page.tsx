"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { PaymentForm, PaymentOTPForm } from "@/components/payment";
import { Box } from "@/components/ui";
import { type CardFormData } from "@/lib/schemas/payment";
import { Loading } from "@/components/ui/feedback/Loading";

function PaymentGatewayContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const amount = searchParams.get("amount") || "150,000";

    const [step, setStep] = useState(1);
    const [cardNumber, setCardNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePaymentSubmit = async (data: CardFormData) => {
        setLoading(true);
        try {
            setCardNumber(data.cardNumber);
            toast.success("رمز دوم ارسال شد");
            setStep(2);
        } catch {
            toast.error("خطا در پردازش پرداخت");
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerify = async () => {
        setLoading(true);
        try {
            toast.success("پرداخت با موفقیت انجام شد!");
            router.push("/dashboard");
        } catch {
            toast.error("رمز دوم صحیح نیست");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = () => {
        toast.success("رمز دوم مجدد ارسال شد");
    };

    return (
        <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <Box className="w-full max-w-md">
                {step === 1 && (
                    <PaymentForm
                        amount={amount}
                        onNext={handlePaymentSubmit}
                        loading={loading}
                    />
                )}

                {step === 2 && (
                    <PaymentOTPForm
                        cardNumber={cardNumber}
                        onVerify={handleOTPVerify}
                        onBack={() => setStep(1)}
                        onResend={handleResendOTP}
                        loading={loading}
                    />
                )}
            </Box>
        </Box>
    );
}

export default function PaymentGateway() {
    return (
        <Suspense fallback={<Loading />}>
            <PaymentGatewayContent />
        </Suspense>
    );
}
