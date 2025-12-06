'use client';
import { MultiOTPInput } from '@/components/forms';
import { Box, Typography } from '@/components/ui';
import { Button } from '@/components/ui/core/Button';
import { useEffect, useState } from 'react';

interface Props {
    otp: string;
    setOtp: (v: string) => void;
    onIssue: () => void;
    onResend?: () => void;
    loading?: boolean;
    children?: React.ReactNode;
    passwordInput?: React.ReactNode;
    isValid?: boolean;
    timeLeft: number;
    setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
}

export default function CertificateStep({
    otp,
    setOtp,
    onIssue,
    onResend,
    loading,
    timeLeft,
    setTimeLeft,
}: Props) {
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timeLeft <= 0) {
            setCanResend(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, setTimeLeft]);

    const handleResend = () => {
        if (onResend) {
            onResend();
            setCanResend(false);
            setOtp('');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Box className="space-y-6">
            <Box className="mb-6 rounded-xl border border-purple-200 bg-purple-50 p-4">
                <Typography variant="p" className="text-center text-sm text-purple-800">
                    <Typography variant="span" dir="ltr">
                        لطفا کد تایید پیامک شده را وارد کنید
                    </Typography>
                </Typography>
                {!canResend && (
                    <Box className="mt-2 flex items-center justify-center gap-2">
                        <Typography
                            variant="p"
                            className="text-center text-sm font-bold text-purple-600"
                        >
                            زمان باقیمانده:
                        </Typography>
                        <Typography className="text-purple-700">{formatTime(timeLeft)}</Typography>
                    </Box>
                )}
                <Box className="mt-2 flex justify-center">
                    {canResend && onResend && (
                        <Button
                            onClick={handleResend}
                            variant="secondary"
                            className=""
                            disabled={loading}
                        >
                            ارسال مجدد کد
                        </Button>
                    )}
                </Box>
            </Box>
            <MultiOTPInput
                value={otp}
                onChange={setOtp}
                length={6}
                onSubmit={onIssue}
                disabled={loading}
            />
        </Box>
    );
}
