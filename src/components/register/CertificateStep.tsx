'use client';
import React from 'react';
import { MultiOTPInput } from '@/components/forms';
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
                تایید
            </LoadingButton>
        </div>
    );
}
