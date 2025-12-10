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

    const onChangeRef = useRef(onChange);
    const onSubmitRef = useRef(onSubmit);

    useEffect(() => {
        onChangeRef.current = onChange;
        onSubmitRef.current = onSubmit;
    }, [onChange, onSubmit]);

    useEffect(() => {
        if (value) {
            const newDigits = Array(length).fill('');
            for (let i = 0; i < Math.min(value.length, length); i++) {
                newDigits[i] = value[i];
            }

            setDigits(newDigits);
        } else if (!value) {
            setDigits(Array(length).fill(''));
        }
    }, [value, length]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {}, [digits]);

    const startWebOTPRef = useRef<(() => void) | undefined>(undefined);

    useEffect(() => {
        if (!('OTPCredential' in window)) {
            return;
        }

        let abortController: AbortController | null = null;
        let mounted = true;

        const startWebOTP = async () => {
            try {
                abortController?.abort();
                abortController = new AbortController();
                const credential = await navigator.credentials.get({
                    otp: { transport: ['sms'] },
                    signal: abortController.signal,
                } as CredentialRequestOptions & { otp: { transport: string[] } });

                if (!mounted) {
                    return;
                }

                if (credential && 'code' in credential && typeof credential.code === 'string') {
                    const rawCode = credential.code;
                    // received raw code

                    // Normalize Persian/Arabic-Indic digits to ASCII before extracting numbers
                    const code = convertPersianToEnglish(rawCode);
                    // normalized code

                    // extract digit sequences (now ASCII)
                    const matches = code.match(/\d+/g) || [];
                    let numericCode = '';

                    if (matches.length > 0) {
                        for (let i = 0; i < matches.length; i++) {
                            if (matches[i].length === length) {
                                numericCode = matches[i];
                                break;
                            }
                        }
                        if (!numericCode) {
                            numericCode = matches.reduce((a, b) => (a.length > b.length ? a : b));
                        }
                    }

                    if (numericCode && numericCode.length > 0) {
                        const codeToUse = numericCode.substring(0, length);

                        const newDigits = codeToUse.split('');

                        // Update state and trigger re-render BEFORE calling onChange
                        setDigits(newDigits);

                        const notifyParent = () => {
                            try {
                                onChangeRef.current(codeToUse);
                            } catch (err) {
                                console.log('🚀 ~ notifyParent ~ err:', err);
                                // ignore
                            }
                        };
                        const tryFocusThenNotify = (attempt = 0) => {
                            const maxAttempts = 10;
                            try {
                                const firstRef = inputRefs.current[0];
                                if (firstRef) {
                                    firstRef.focus?.();
                                }

                                const active = document.activeElement as HTMLElement | null;
                                const activeInside =
                                    !!active &&
                                    active.tagName === 'INPUT' &&
                                    (active.getAttribute('inputmode') === 'numeric' ||
                                        (active.getAttribute('autocomplete') || '').includes(
                                            'one-time-code'
                                        ) ||
                                        active.classList.contains('otp-input'));

                                if (activeInside || attempt >= maxAttempts) {
                                    // Either focused or ran out of retries — notify parent
                                    notifyParent();
                                } else {
                                    // retry after a brief delay (allow modal to finish animation)
                                    setTimeout(() => tryFocusThenNotify(attempt + 1), 50);
                                }
                            } catch {
                                notifyParent();
                            }
                        };

                        if (typeof requestAnimationFrame === 'function') {
                            requestAnimationFrame(() => tryFocusThenNotify());
                        } else {
                            setTimeout(() => tryFocusThenNotify(), 0);
                        }

                        if (onSubmitRef.current) {
                            setTimeout(() => {
                                onSubmitRef.current?.();
                            }, 200);
                        }
                    }
                }
            } catch (error) {
                if (mounted && error instanceof Error && error.name !== 'AbortError') {
                }
            }
        };

        startWebOTPRef.current = () => {
            startWebOTP().catch(() => {});
        };

        startWebOTP().catch(() => {});

        return () => {
            mounted = false;
            if (abortController) abortController.abort();
        };
    }, [length]);

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
        <Box className={`flex w-full justify-between ${className || ''}`} dir="ltr">
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
                    ref={(el: OTPInputRef | null) => {
                        inputRefs.current[index] = el;
                    }}
                />
            ))}
        </Box>
    );
}
