"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Box } from "@/components/ui";
import { otpSchema, type LoginOtpFormData } from "@/lib/schemas/login";
import { useOtpTimer } from '@/hooks/useOtpTimer';

interface OTPFormProps {
    phoneNumber: string;
    onVerify: (otp: string) => void;
    onResend: () => void;
    loading?: boolean;
}

export function OTPForm({ phoneNumber, onVerify, onResend, loading }: OTPFormProps) {
    const { secondsLeft, reset, formatTime } = useOtpTimer(120);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { isValid }
    } = useForm<LoginOtpFormData>({
        resolver: zodResolver(otpSchema),
        mode: 'onChange'
    });

    const otpValue = watch('otp');

    // useOtpTimer starts automatically on mount

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = (otpValue || '').split('');
        newOtp[index] = value;

        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }

        setValue('otp', newOtp.join(''));
    };


    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-gray-900">
                    تأیید کد امنیتی
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                    کد ۵ رقمی ارسال شده به شماره {phoneNumber} را وارد کنید
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit((data) => onVerify(data.otp))} className="space-y-6">
                    <input type="hidden" {...register('otp')} />

                    <Box className="flex justify-center gap-3">
                        {[0, 1, 2, 3, 4].map((index) => (
                            <Input
                                key={index}
                                ref={(el) => { inputRefs.current[index] = el }}
                                type="text"
                                maxLength={1}
                                className="w-12 h-12 text-center text-lg font-bold"
                                value={(otpValue || '')[index] || ''}
                                onChange={(e) => handleOtpChange(e.target.value, index)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
                                        inputRefs.current[index - 1]?.focus();
                                    }
                                }}
                            />
                        ))}
                    </Box>
                    <Box className="flex gap-4">
                        {secondsLeft > 0 ? (
                            <div className="flex-1 text-gray-600 text-sm text-center" style={{ minWidth: 140, fontVariantNumeric: 'tabular-nums', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}>
                                {formatTime()}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => { onResend(); reset(120); }}
                                className={`flex-1 text-blue-600 focus:outline-none px-0 py-0 text-sm`}
                                style={{ background: 'transparent', border: 'none', padding: 0, minWidth: 140, display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}
                            >
                                <span style={{ fontVariantNumeric: 'tabular-nums', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}>
                                    ارسال مجدد
                                </span>
                            </button>
                        )}
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={!isValid || loading}
                        >
                            {loading ? 'در حال بررسی...' : 'تأیید و ورود'}
                        </Button>
                    </Box>
                </form>
            </CardContent>
        </Card>
    );
}
