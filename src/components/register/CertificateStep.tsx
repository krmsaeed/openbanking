'use client';
import { MultiOTPInput } from '@/components/forms';
import { Box, Typography } from '@/components/ui';
import { Button } from '@/components/ui/core/Button';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

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
    resendLoading?: boolean;
}
const Spinner = ({ className }: { className?: string }) => (
    <svg
        className={cn('animate-spin', className)}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
);
export default function CertificateStep({
    otp,
    setOtp,
    onIssue,
    onResend,
    loading,
    timeLeft,
    setTimeLeft,
    resendLoading,
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
        <Box className="space-y-2 ">
            <MultiOTPInput
                value={otp}
                onChange={setOtp}
                length={6}
                onSubmit={onIssue}
                disabled={loading}
                className=' mt-2 '
            />
            <Box className=" flex justify-end">
                {canResend && onResend && (
                    <Button
                        onClick={handleResend}
                        variant="secondary"
                        className="h-8 mt-2"
                        disabled={loading || resendLoading}
                    >

                        {!resendLoading ? (
                            ' ارسال مجدد کد'
                        ) : (
                            <Spinner className="mr-2" />
                        )}
                    </Button>
                )}
            </Box>
            {!canResend && (
                <Box className=" flex items-center justify-end gap-2 px-3">
                    {resendLoading ? (
                        <Box className="flex items-center text-purple-700 text-md">
                            <Spinner className="ml-1" />
                            در حال ارسال
                        </Box>
                    ) : (
                        <>
                            <Typography
                                variant="p"
                                className="text-center text-sm font-bold text-purple-600"
                            >
                                زمان باقیمانده:
                            </Typography>
                            <Typography className="text-purple-700 w-5">{formatTime(timeLeft)}</Typography>
                        </>
                    )}
                </Box>
            )}
        </Box>
    );
}
