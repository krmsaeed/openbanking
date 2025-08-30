"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input } from "@/components/ui";
import { otpFormSchema, type PaymentOtpFormData } from "@/lib/schemas/payment";

interface PaymentOTPFormProps {
    cardNumber: string;
    onVerify: () => void;
    onBack: () => void;
    onResend: () => void;
    loading?: boolean;
}

export function PaymentOTPForm({ cardNumber, onVerify, onBack, onResend, loading }: PaymentOTPFormProps) {
    const [timer, setTimer] = useState(120);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { isValid }
    } = useForm<PaymentOtpFormData>({
        resolver: zodResolver(otpFormSchema),
        mode: 'onChange'
    });

    const digits = watch(['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6']);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleDigitChange = (value: string, index: number) => {
        const fieldName = `digit${index + 1}` as keyof PaymentOtpFormData;
        setValue(fieldName, value);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    }; const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const maskedCardNumber = cardNumber.replace(/\d(?=\d{4})/g, '*');

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-gray-900">
                    تأیید رمز دوم
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                    رمز دوم ارسال شده به کارت {maskedCardNumber} را وارد کنید
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onVerify)} className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <Input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                maxLength={1}
                                className="w-10 h-10 text-center text-lg font-bold"
                                value={digits[index] || ''}
                                onChange={(e) => handleDigitChange(e.target.value, index)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
                                        inputRefs.current[index - 1]?.focus();
                                    }
                                }}
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        {timer > 0 ? (
                            <p className="text-sm text-gray-600">
                                ارسال مجدد رمز در {formatTime(timer)}
                            </p>
                        ) : (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    onResend();
                                    setTimer(120);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                ارسال مجدد رمز
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onBack}
                            className="flex-1"
                        >
                            <ArrowRightIcon className="w-4 h-4 ml-2" />
                            بازگشت
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={!isValid || loading}
                        >
                            {loading ? 'در حال پردازش...' : 'تأیید پرداخت'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
