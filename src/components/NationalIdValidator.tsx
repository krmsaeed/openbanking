'use client';

import React, { useEffect } from 'react';

import { convertPersianToEnglish } from '@/lib/utils';

export function cleanNationalId(input: string): string {
    const normalized = convertPersianToEnglish(input || '');
    return normalized.replace(/\D/g, '').trim();
}

export function isValidNationalId(code: string): boolean {
    if (!code) return false;
    const v = cleanNationalId(code);
    if (v.length !== 10) return false;

    if (/^(\d)\1{9}$/.test(v)) return false;

    const digits = v.split('').map((d) => parseInt(d, 10));
    const check = digits[9];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += digits[i] * (10 - i);
    }
    const remainder = sum % 11;
    if (remainder < 2) return check === remainder;
    return check === 11 - remainder;
}

export function NationalIdValidation({
    value,
    renderError = true,
    onValid,
    onInvalid,
}: {
    value?: string | null;
    renderError?: boolean;
    onValid?: (cleaned: string) => void;
    onInvalid?: () => void;
}) {
    useEffect(() => {
        const v = value ?? '';
        const cleaned = cleanNationalId(v);
        if (isValidNationalId(cleaned)) {
            onValid?.(cleaned);
        } else {
            onInvalid?.();
        }
    }, [value, onValid, onInvalid]);

    if (!renderError) return null;

    const v = value ?? '';
    const cleaned = cleanNationalId(v);
    if (!isValidNationalId(cleaned)) {
        return (
            <div className="flex w-full max-w-lg flex-col items-center justify-center gap-4 rounded-2xl bg-red-50 p-4 shadow-sm">
                <div className="font-medium text-red-600">کد ملی نامعتبر است</div>
                <div className="text-sm text-red-500">
                    لطفاً لینک را بررسی کنید یا کد ملی را اصلاح کنید.
                </div>
            </div>
        );
    }

    return null;
}

export default NationalIdValidation;
