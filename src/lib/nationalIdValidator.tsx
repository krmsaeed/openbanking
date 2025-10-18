'use client';

import { useEffect } from 'react';

import { Box } from '@/components/ui';
import { cleanNationalId, isValidNationalId } from '@/lib/utils';

export { cleanNationalId, isValidNationalId } from '@/lib/utils';

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
            <Box className="flex w-full max-w-lg flex-col items-center justify-center gap-4 rounded-2xl bg-red-50 p-4 shadow-sm">
                <Box className="font-medium text-red-600">کد ملی نامعتبر است</Box>
                <Box className="text-sm text-red-500">
                    لطفاً لینک را بررسی کنید یا کد ملی را اصلاح کنید.
                </Box>
            </Box>
        );
    }

    return null;
}

export default NationalIdValidation;
