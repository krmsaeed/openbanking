"use client";
import React from 'react';
import { MultiOTPInput } from '@/components/forms';
import { Button } from '@/components/ui/core/Button';
import { Loading } from '@/components/ui/feedback/Loading';

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
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-800 text-center"><span dir='ltr'>. کد تایید جدید ارسال شد</span></p>
            </div>
            <MultiOTPInput value={otp} onChange={setOtp} length={5} />
            <Button onClick={onIssue} variant='primary' size="lg" className="w-full" disabled={otp.length < 5}>{loading && (<Loading size="sm" className='ml-1' />)} تایید
            </Button>

        </div>
    );
}
