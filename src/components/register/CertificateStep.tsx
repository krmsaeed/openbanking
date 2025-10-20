'use client';
import { MultiOTPInput } from '@/components/forms';
import { Typography } from '@/components/ui';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { CheckIcon } from '@heroicons/react/24/outline';

interface Props {
    otp: string;
    setOtp: (v: string) => void;
    onIssue: () => void;
    onSend?: () => void;
    loading?: boolean;
}

export default function CertificateStep({ otp, setOtp, onIssue, loading }: Props) {
    return (
        <div className="space-y-6">
            <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="text-center text-sm text-purple-800">
                    <span dir="ltr">. کد تایید جدید ارسال شد</span>
                </p>
            </div>
            <MultiOTPInput value={otp} onChange={setOtp} length={6} />
            <LoadingButton
                onClick={onIssue}
                loading={loading}
                className="w-full"
                disabled={otp.length < 6 || loading}
            >
                {!loading && <CheckIcon className="h-5 w-5 text-white" />}
                <Typography variant="body1" className="text-xs font-medium text-white">
                    {loading ? 'در حال ارسال...' : 'مرحله بعد'}
                </Typography>
            </LoadingButton>
        </div>
    );
}
