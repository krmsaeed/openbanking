'use client';

import { useEffect, useRef, useState } from 'react';
import { Box } from '../ui/core';
import { OTPInput, OTPInputRef } from '../ui/forms/OTPInput';
import { convertPersianToEnglish } from '@/lib/utils';

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
    const inputRefs = useRef<(OTPInputRef | null)[]>([]);

    useEffect(() => {
        const newDigits = Array(length).fill('');
        for (let i = 0; i < Math.min(value.length, length); i++) {
            newDigits[i] = value[i];
        }
        setDigits(newDigits);
    }, [value, length]);

    useEffect(() => {
        // Focus first input after component mounts
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (!('OTPCredential' in window)) return;

        const abortController = new AbortController();

        const requestOTP = async () => {
            try {
                const credential = await navigator.credentials.get({
                    otp: { transport: ['sms'] },
                    signal: abortController.signal,
                } as CredentialRequestOptions & { otp: { transport: string[] } });

                if (credential && 'code' in credential && typeof credential.code === 'string') {
                    const matches = credential.code.match(/\d+/g);
                    let numericCode = '';

                    if (matches && matches.length > 0) {
                        for (let i = matches.length - 1; i >= 0; i--) {
                            if (matches[i].length === length) {
                                numericCode = matches[i];
                                break;
                            }
                        }
                        if (!numericCode) {
                            numericCode = matches[matches.length - 1];
                        }
                    }

                    if (numericCode && numericCode.length === length) {
                        const newDigits = numericCode.split('');
                        setDigits(newDigits);
                        onChange(numericCode);


                    }
                }
            } catch (error) {
                console.log('WebOTP error:', error);
            }
        };

        requestOTP();
        return () => abortController.abort();
    }, [length, onChange, onSubmit]);

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

    const handlePaste = (startIndex: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text').replace(/\s+/g, '');
        if (!pastedText) return;

        // Convert Persian/Arabic numbers to English
        const englishText = convertPersianToEnglish(pastedText);
        const chars = englishText.split('').filter((c) => /\d/.test(c));
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
        <Box className={`w-full flex justify-between  ${className || ''}`} dir="ltr">
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
                    ref={(el: OTPInputRef | null) => {
                        inputRefs.current[index] = el;
                    }}
                />
            ))}
        </Box>
    );
}
