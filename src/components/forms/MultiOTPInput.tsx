'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from '../ui/core';
import { OTPInput } from '../ui/forms/OTPInput';

interface MultiOTPInputProps {
    length: number;
    value: string;
    onChange: (value: string) => void;
    onSubmit?: () => void;
    disabled?: boolean;
    className?: string;
}

export function MultiOTPInput({
    length,
    value,
    onChange,
    onSubmit,
    disabled,
    className,
}: MultiOTPInputProps) {
    const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const newDigits = Array(length).fill('');
        for (let i = 0; i < Math.min(value.length, length); i++) {
            newDigits[i] = value[i];
        }
        setDigits(newDigits);
    }, [value, length]);

    const handleDigitChange = (index: number, digit: string) => {
        const newDigits = [...digits];
        newDigits[index] = digit;
        setDigits(newDigits);

        const newValue = newDigits.join('');
        onChange(newValue);

        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const currentValue = digits.join('');
            if (currentValue.length === length && onSubmit) {
                onSubmit();
            }
        } else if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (startIndex: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text').replace(/\s+/g, '');
        if (!paste) return;
        const chars = paste.split('').filter((c) => /\d/.test(c));
        if (chars.length === 0) return;

        const newDigits = [...digits];
        let lastFilled = startIndex;
        for (let i = 0; i < chars.length && startIndex + i < length; i++) {
            newDigits[startIndex + i] = chars[i];
            lastFilled = startIndex + i;
        }

        setDigits(newDigits);
        onChange(newDigits.join(''));

        const next = Math.min(lastFilled + 1, length - 1);
        inputRefs.current[next]?.focus();
    };

    return (
        <Box className={`flex justify-center gap-2 ${className || ''}`} dir="ltr">
            {digits.map((digit, index) => (
                <OTPInput
                    key={index}
                    value={digit}
                    onChange={(value: string) => handleDigitChange(index, value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>
                        handleKeyDown(index, e)
                    }
                    onPaste={(e) => handlePaste(index, e)}
                    disabled={disabled}
                    autoFocus={index === 0}
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                    ref={(el: HTMLInputElement | null) => {
                        inputRefs.current[index] = el;
                    }}
                />
            ))}
        </Box>
    );
}
