"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Box, Typography } from "@/components/ui";
import { otpSchema, type LoginOtpFormData } from "@/lib/schemas/login";

interface OTPFormProps {
    phoneNumber: string;
    onVerify: (otp: string) => void;
    onBack: () => void;
    onResend: () => void;
    loading?: boolean;
}

export function OTPForm({ phoneNumber, onVerify, onBack, onResend, loading }: OTPFormProps) {
    const [timer, setTimer] = useState(120);
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

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = (otpValue || '').split('');
        newOtp[index] = value;

        if (value && index < 4) {
            inputRefs.current[index + 1]?.focus();
        }

        setValue('otp', newOtp.join(''));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

                    <Box className="text-center">
                        {timer > 0 ? (
                            <Typography variant="body2" color="secondary">
                                ارسال مجدد کد در {formatTime(timer)}
                            </Typography>
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
                                ارسال مجدد کد
                            </Button>
                        )}
                    </Box>

                    <Box className="flex gap-4">
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
