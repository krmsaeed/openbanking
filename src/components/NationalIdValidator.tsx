"use client";

import React, { useEffect } from 'react';

export function cleanNationalId(input: string): string {
    return (input || '').replace(/\D/g, '').trim();
}

// implement Iranian national code checksum validation
export function isValidNationalId(code: string): boolean {
    if (!code) return false;
    const v = cleanNationalId(code);
    if (v.length !== 10) return false;
    // reject repetitive numbers like 0000000000, 1111111111, etc.
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
            <div className="w-full max-w-lg flex flex-col items-center justify-center gap-4 p-4 rounded-2xl shadow-sm bg-red-50">
                <div className="text-red-600 font-medium">کد ملی نامعتبر است</div>
                <div className="text-sm text-red-500">لطفاً لینک را بررسی کنید یا کد ملی را اصلاح کنید.</div>
            </div>
        );
    }

    return null;
}

export default NationalIdValidation;
