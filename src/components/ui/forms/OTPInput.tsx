"use client";

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { cn, convertPersianToEnglish } from '@/lib/utils';

interface OTPInputProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
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
    ({ value, onChange, onKeyDown, className, maxLength = 1, disabled, autoFocus }, ref) => {
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
                onKeyDown={onKeyDown}
                className={cn(
                    "w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-colors",
                    className
                )}
                maxLength={maxLength}
                disabled={disabled}
                autoFocus={autoFocus}
            />
        );
    }
);

OTPInput.displayName = "OTPInput";

export { OTPInput };
