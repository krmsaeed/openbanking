'use client';

import { cn, convertPersianToEnglish } from '@/lib/utils';
import { forwardRef, useImperativeHandle, useRef } from 'react';

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
    autoComplete?: string;
    className?: string;
    maxLength?: number;
    disabled?: boolean;
    autoFocus?: boolean;
}

export interface OTPInputRef {
    focus: () => void;
    blur: () => void;
}

const OTPInput = forwardRef<OTPInputRef, OTPInputProps>(
    (
        {
            value,
            onChange,
            onKeyDown,
            onPaste,
            autoComplete,
            className,
            maxLength = 1,
            disabled,
            autoFocus,
        },
        ref
    ) => {
        const inputRef = useRef<HTMLInputElement>(null);

        useImperativeHandle(ref, () => ({
            focus: () => inputRef.current?.focus(),
            blur: () => inputRef.current?.blur(),
        }));

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const originalValue = e.target.value;
            const convertedValue = convertPersianToEnglish(originalValue);

            if (!/^\d*$/.test(convertedValue)) return;

            if (convertedValue.length > maxLength) return;

            onChange(convertedValue);
        };

        return (
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={value}
                onChange={handleChange}
                onPaste={onPaste}
                autoComplete={autoComplete ?? 'one-time-code'}
                onKeyDown={onKeyDown}
                className={cn(
                    'h-12 w-12 rounded-xl border border-gray-100 text-center text-lg font-bold transition-colors focus:ring-2',
                    className
                )}
                maxLength={maxLength}
                disabled={disabled}
                autoFocus={autoFocus}
            />
        );
    }
);

OTPInput.displayName = 'OTPInput';

export { OTPInput };
