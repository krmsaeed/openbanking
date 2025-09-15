"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Box } from "@/components/ui";
import { otpFormSchema, type PaymentOtpFormData } from "@/lib/schemas/payment";
import { useOtpTimer } from '@/hooks/useOtpTimer';

interface PaymentOTPFormProps {
    cardNumber: string;
    onVerify: () => void;
    onResend: () => void;
    loading?: boolean;
}

export function PaymentOTPForm({ cardNumber, onVerify, onResend, loading }: PaymentOTPFormProps) {
    const { secondsLeft, reset, formatTime } = useOtpTimer(120);
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

    // فوکوس اولیه روی اولین ورودی (چپ به راست)
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // timer handled by useOtpTimer

    const handleDigitChange = (rawValue: string, index: number) => {
        const value = rawValue.replace(/\D/g, '').slice(0, 1);
        const fieldName = `digit${index + 1}` as keyof PaymentOtpFormData;
        setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        const currentOtp = inputRefs.current.map((el) => el?.value || '').join('');
        if (currentOtp.length === 6) {
            // Let the validation handle it
        }
    };

    // formatTime provided by useOtpTimer

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
                <form
                    onSubmit={handleSubmit(() => {
                        onVerify();
                    })}
                    className="space-y-6"
                >
                    <Box className="flex justify-center gap-2" dir="ltr">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                            <Input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                maxLength={1}
                                inputMode="numeric"
                                dir="ltr"
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
                    </Box>

                    {/* resend/timer moved into buttons row for stable layout */}

                    <Box className="flex gap-4 items-center">
                        <div className="flex-1 flex items-center justify-center">
                            {secondsLeft > 0 ? (
                                <div
                                    className="text-sm text-gray-500"
                                    style={{ minWidth: 140, fontVariantNumeric: 'tabular-nums', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}
                                >
                                    ارسال مجدد رمز در {formatTime()}
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onResend();
                                        reset(120);
                                    }}
                                    className="text-blue-600"
                                    style={{ background: 'transparent', border: 'none', padding: 0, minWidth: 140 }}
                                    aria-label="ارسال مجدد رمز"
                                >
                                    {/* link-like appearance: no bg/border, simple text; no hover-bg/scale */}
                                    ارسال مجدد رمز
                                </button>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={!isValid || loading}
                        >
                            {loading ? 'در حال پردازش...' : 'تأیید پرداخت'}
                        </Button>
                    </Box>
                </form>
            </CardContent>
        </Card>
    );
}
