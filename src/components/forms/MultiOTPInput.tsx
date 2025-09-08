"use client";

import { useState, useRef, useEffect } from 'react';
import { OTPInput } from '../ui/forms/OTPInput';
import { Box } from "../ui/core";

interface MultiOTPInputProps {
    length: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

export function MultiOTPInput({ length, value, onChange, disabled, className }: MultiOTPInputProps) {
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
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    return (
        <Box className={`flex gap-2 justify-center ${className || ''}`} dir='ltr'>
            {digits.map((digit, index) => (
                <OTPInput
                    key={index}
                    value={digit}
                    onChange={(value: string) => handleDigitChange(index, value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                    disabled={disabled}
                    autoFocus={index === 0}
                    ref={(el: HTMLInputElement | null) => {
                        inputRefs.current[index] = el;
                    }}
                />
            ))}
        </Box>
    );
}
