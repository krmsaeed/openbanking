'use client';
import { MultiOTPInput } from '@/components/forms';
import { Box, Typography } from '@/components/ui';
import LoadingButton from '@/components/ui/core/LoadingButton';

interface Props {
    otp: string;
    setOtp: (v: string) => void;
    onIssue: () => void;
    onSend?: () => void;
    loading?: boolean;
}

export default function CertificateStep({ otp, setOtp, onIssue, loading }: Props) {
    return (
        <Box className="space-y-6">
            <Box className="mb-6 rounded-xl border border-purple-200 bg-purple-50 p-4">
                <Typography variant="p" className="text-center text-sm text-purple-800">
                    <Typography variant="span" dir="ltr">
                        . کد تایید جدید ارسال شد
                    </Typography>
                </Typography>
            </Box>
            <MultiOTPInput value={otp} onChange={setOtp} length={6} />
            <LoadingButton
                onClick={onIssue}
                loading={loading}
                disabled={otp.length < 6 || loading}
            />
        </Box>
    );
}
