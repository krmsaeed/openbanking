'use client';

import { MultiOTPInput } from '@/components/forms';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui';
import { useOtpTimer } from '@/hooks/useOtpTimer';
import {
    paymentOTPFormSchema as otpFormSchema,
    type PaymentOtpFormData,
} from '@/lib/schemas/payment';
import { convertPersianToEnglish } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

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
        formState: { isValid },
    } = useForm<PaymentOtpFormData>({
        resolver: zodResolver(otpFormSchema),
        mode: 'onChange',
    });

    const digits = watch(['digit1', 'digit2', 'digit3', 'digit4', 'digit5', 'digit6']);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleDigitChange = (rawValue: string, index: number) => {
        const normalized = convertPersianToEnglish(rawValue || '');
        const value = normalized.replace(/\D/g, '').slice(0, 1);
        const fieldName = `digit${index + 1}` as keyof PaymentOtpFormData;
        setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
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
                <form
                    onSubmit={handleSubmit(() => {
                        onVerify();
                    })}
                    className="space-y-6"
                >
                    <Box className="flex justify-center gap-2" dir="ltr">
                        <MultiOTPInput
                            onChange={() => handleDigitChange}
                            length={5}
                            value={digits.join('')}
                        />
                    </Box>

                    <Box className="flex items-center gap-4">
                        <Box className="flex flex-1 items-center justify-center">
                            {secondsLeft > 0 ? (
                                <div
                                    className="text-sm text-gray-500"
                                    style={{
                                        minWidth: 140,
                                    }}
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
                                    className="text-primary min-w-48"
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                    }}
                                    aria-label="ارسال مجدد رمز"
                                >
                                    ارسال مجدد رمز
                                </button>
                            )}
                        </Box>
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
