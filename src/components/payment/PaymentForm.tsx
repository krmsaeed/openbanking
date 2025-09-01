"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, FormField, Box, Typography } from "@/components/ui";
import { cardFormSchema, type CardFormData } from "@/lib/schemas/payment";
import { convertPersianToEnglish } from "@/lib/utils";

interface PaymentFormProps {
    amount: string;
    onNext: (data: CardFormData) => void;
    loading?: boolean;
}

export function PaymentForm({ amount, onNext, loading }: PaymentFormProps) {
    const [captcha, setCaptcha] = useState(generateCaptcha());
    const [, startTransition] = useTransition();
    const cvvDebounceTimer = useRef<NodeJS.Timeout | null>(null);



    const cardNumberRef = useRef<HTMLInputElement>(null);
    const cvvRef = useRef<HTMLInputElement>(null);
    const monthRef = useRef<HTMLInputElement>(null);
    const yearRef = useRef<HTMLInputElement>(null);
    const captchaRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors, isValid }
    } = useForm<CardFormData>({
        resolver: zodResolver(cardFormSchema),
        mode: 'onChange'
    });

    const cardNumber = watch('cardNumber');
    const cvv2 = watch('cvv2');
    const expiryMonth = watch('expiryMonth');
    const expiryYear = watch('expiryYear');

    const isCardNumberValid = cardNumber && cardNumber.replace(/[-\s]/g, '').length === 16;
    const isCvv2Valid = cvv2 && (cvv2.length === 3 || cvv2.length === 4);
    const isMonthValid = expiryMonth && expiryMonth.length === 2 && parseInt(expiryMonth) >= 1 && parseInt(expiryMonth) <= 12;
    const isYearValid = expiryYear && expiryYear.length === 2;

    function generateCaptcha(): string {
        return Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    const formatCardNumber = (value: string) => {
        const v = value.replace(/[-\s]/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join('-');
        } else {
            return v;
        }
    };

    const handleCardNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target;
        const cursorPosition = input.selectionStart || 0;
        const oldValue = input.value;
        const newValue = formatCardNumber(e.target.value);

        setValue('cardNumber', newValue, { shouldValidate: true, shouldDirty: true });

        setTimeout(() => {
            if (cardNumberRef.current) {
                let newCursorPosition = cursorPosition;

                const digitsBeforeCursor = oldValue.substring(0, cursorPosition).replace(/[^0-9]/g, '').length;
                const dashesBeforeCursorNew = Math.floor((digitsBeforeCursor - 1) / 4);

                newCursorPosition = digitsBeforeCursor + Math.max(0, dashesBeforeCursorNew);

                if (newValue[newCursorPosition - 1] === '-' && cursorPosition > oldValue.lastIndexOf('-', cursorPosition - 1) + 1) {
                    newCursorPosition++;
                }

                newCursorPosition = Math.max(0, Math.min(newCursorPosition, newValue.length));

                cardNumberRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
            }
        }, 0);

        if (newValue.replace(/[-\s]/g, '').length === 16) {
            startTransition(() => {
                setTimeout(() => cvvRef.current?.focus(), 100);
            });
        }
    }, [setValue, startTransition]);

    const debouncedCvvFocus = useCallback(() => {
        if (cvvDebounceTimer.current) {
            clearTimeout(cvvDebounceTimer.current);
        }

        cvvDebounceTimer.current = setTimeout(() => {
            setValue('expiryMonth', '', { shouldValidate: true, shouldDirty: true });
            setValue('expiryYear', '', { shouldValidate: true, shouldDirty: true });

            if (monthRef.current && !monthRef.current.disabled) {
                monthRef.current.focus();
            }
        }, 500); // 500ms تاخیر برای اطمینان از تکمیل CVV
    }, [setValue]);

    const handleCvvChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '');
        setValue('cvv2', value, { shouldValidate: true, shouldDirty: true });

        // پاک کردن timer قبلی در صورت وجود
        if (cvvDebounceTimer.current) {
            clearTimeout(cvvDebounceTimer.current);
        }

        if (value.length === 3) {
            // برای CVV 3 رقمی، تاخیر ایجاد می‌کنیم تا کاربر فرصت وارد کردن رقم چهارم را داشته باشد
            debouncedCvvFocus();
        } else if (value.length === 4) {
            // برای CVV 4 رقمی، فوراً به فیلد بعدی می‌رویم
            startTransition(() => {
                setValue('expiryMonth', '', { shouldValidate: true, shouldDirty: true });
                setValue('expiryYear', '', { shouldValidate: true, shouldDirty: true });

                setTimeout(() => {
                    if (monthRef.current && !monthRef.current.disabled) {
                        monthRef.current.focus();
                    }
                }, 0);
            });
        }
    }, [setValue, startTransition, debouncedCvvFocus]);

    const handleMonthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let value = convertPersianToEnglish(e.target.value).replace(/\D/g, '');

        if (value.length === 1) {
            const firstDigit = parseInt(value);
            if (firstDigit > 1) {
                value = '0' + value;
                setValue('expiryMonth', value, { shouldValidate: true, shouldDirty: true });
                startTransition(() => {
                    setTimeout(() => yearRef.current?.focus(), 0);
                });
                return;
            }
            setValue('expiryMonth', value, { shouldValidate: true, shouldDirty: true });
            return;
        }

        if (value.length === 2) {
            const month = parseInt(value);
            if (month > 12) {
                return;
            } else if (month < 1) {
                value = '01';
            }
            setValue('expiryMonth', value, { shouldValidate: true, shouldDirty: true });
            startTransition(() => {
                setTimeout(() => yearRef.current?.focus(), 0);
            });
            return;
        }

        if (value.length > 2) {
            value = value.substring(0, 2);
            const month = parseInt(value);
            if (month > 12) {
                value = '12';
            }
            setValue('expiryMonth', value, { shouldValidate: true, shouldDirty: true });
            startTransition(() => {
                setTimeout(() => yearRef.current?.focus(), 0);
            });
        }
    }, [setValue, startTransition]);

    const handleYearChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = convertPersianToEnglish(e.target.value).replace(/\D/g, '');
        setValue('expiryYear', value, { shouldValidate: true, shouldDirty: true });

        if (value.length === 2) {
            startTransition(() => {
                setTimeout(() => captchaRef.current?.focus(), 0);
            });
        }
    }, [setValue, startTransition]);

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setValue('captchaInput', '', { shouldValidate: true, shouldDirty: true });
        setTimeout(() => captchaRef.current?.focus(), 0);
    };

    const handleCaptchaChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setValue('captchaInput', e.target.value, { shouldValidate: true, shouldDirty: true });
    }, [setValue]);

    const handleMonthFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        const currentMonth = watch('expiryMonth');

        if (currentMonth && currentMonth.length > 0) {
            // مستقیماً مقادیر input ها را پاک کن
            if (monthRef.current) {
                monthRef.current.value = '';
            }
            if (yearRef.current) {
                yearRef.current.value = '';
            }

            // setValue هم برای react-hook-form
            setValue('expiryMonth', '', { shouldValidate: true, shouldDirty: true });
            setValue('expiryYear', '', { shouldValidate: true, shouldDirty: true });
        }

        startTransition(() => {
            setTimeout(() => {
                e.target.select();
            }, 0);
        });
    }, [watch, setValue, startTransition]);

    const handleMonthKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key;
        const isDigit = /[0-9\u06F0-\u06F9\u0660-\u0669]/.test(key);
        const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];

        if (!isDigit && !allowed.includes(key)) {
            e.preventDefault();
        }
        // منطق محدوده (01..12) در onChange اعمال می‌شود تا با تبدیل فارسی→انگلیسی هماهنگ بماند
    }, []);

    const handleFormSubmit = useCallback((data: CardFormData) => {
        startTransition(() => {
            onNext(data);
        });
    }, [onNext, startTransition]);
    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-gray-900">
                    درگاه پرداخت امن
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                    مبلغ قابل پرداخت: {amount} تومان
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    onSubmit={handleSubmit(handleFormSubmit)}
                    className="space-y-6"
                    autoComplete="off"
                >
                    {/* Register hidden fields for validation */}
                    <input {...register("cardNumber")} type="hidden" />
                    <input {...register("expiryMonth")} type="hidden" />
                    <input {...register("expiryYear")} type="hidden" />

                    {/* Hidden fields to prevent autocomplete */}
                    <input type="text" autoComplete="off" className="hidden" />
                    <input type="password" autoComplete="new-password" className="hidden" />

                    <FormField
                        label="شماره کارت"
                        required
                        error={errors.cardNumber?.message}

                    >
                        <Input
                            ref={cardNumberRef}
                            value={cardNumber || ''}
                            onChange={handleCardNumberChange}
                            placeholder="xxxx-xxxx-xxxx-xxxx"
                            maxLength={19}
                            className="font-mono tracking-wider text-center font-bold outline-none"
                            variant={errors.cardNumber ? "error" : "default"}
                            dir="ltr"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck={false}
                            name={`card_${Date.now()}`}
                        />

                    </FormField>
                    <FormField
                        label="CVV2"
                        required
                        error={errors.cvv2?.message}
                    >
                        <Box className="relative">
                            {/* Hidden honeypot field to confuse browsers */}
                            <input
                                type="password"
                                autoComplete="current-password"
                                className="absolute -left-[9999px] w-px h-px opacity-0 pointer-events-none"
                                tabIndex={-1}
                            />
                            <Input
                                {...register("cvv2", {
                                    onChange: handleCvvChange
                                })}
                                ref={cvvRef}
                                type="text"
                                inputMode="numeric"
                                placeholder="***"
                                maxLength={4}
                                variant={errors.cvv2 ? "error" : "default"}
                                className="outline-none cvv-input pr-12"
                                disabled={!isCardNumberValid}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                role="textbox"
                                data-lpignore="true"
                                data-form-type="other"
                            />


                        </Box>
                    </FormField>
                    <Box className="grid grid-cols-2 gap-4">
                        <FormField
                            label="ماه انقضا"
                            required
                            error={errors.expiryMonth?.message}
                        >
                            {/* Hidden honeypot field for month */}
                            <input
                                type="text"
                                autoComplete="username"
                                className="absolute -left-[9999px] w-px h-px opacity-0 pointer-events-none"
                                tabIndex={-1}
                            />
                            <Input
                                ref={monthRef}
                                type="text"
                                inputMode="numeric"
                                placeholder="ماه"
                                maxLength={2}
                                value={expiryMonth || ''}
                                onChange={handleMonthChange}
                                onFocus={handleMonthFocus}
                                onKeyDown={handleMonthKeyDown}
                                variant={errors.expiryMonth ? "error" : "default"}
                                className="outline-none"
                                disabled={!isCvv2Valid}
                                autoComplete="new-password"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                data-lpignore="true"
                                data-form-type="other"
                                name={`month_${Date.now()}`}
                                role="textbox"
                            />
                        </FormField>

                        <FormField
                            label="سال انقضا"
                            required
                            error={errors.expiryYear?.message}
                        >
                            {/* Hidden honeypot field for year */}
                            <input
                                type="text"
                                autoComplete="email"
                                className="absolute -left-[9999px] w-px h-px opacity-0 pointer-events-none"
                                tabIndex={-1}
                            />
                            <Input
                                ref={yearRef}
                                type="text"
                                inputMode="numeric"
                                placeholder="سال"
                                maxLength={2}
                                value={expiryYear || ''}
                                onChange={handleYearChange}
                                variant={errors.expiryYear ? "error" : "default"}
                                className="outline-none"
                                disabled={!isMonthValid}
                                autoComplete="one-time-code"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                data-lpignore="true"
                                data-form-type="other"
                                name={`year_${Date.now()}`}
                                role="textbox"
                            />
                        </FormField>
                    </Box>



                    <Box variant="secondary" size="md" className="rounded-lg">
                        <Box className="flex items-center justify-between mb-2">
                            <Typography variant="body2" weight="medium" color="secondary">
                                کد امنیتی *
                            </Typography>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={refreshCaptcha}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <ArrowPathIcon className="w-4 h-4 ml-1" />
                                تازه‌سازی
                            </Button>
                        </Box>
                        <Box className="flex items-start gap-4">
                            <Box className="bg-white px-4 py-2 border-2 border-dashed border-gray-300 rounded font-mono text-lg font-bold tracking-wider select-none">
                                {captcha}
                            </Box>
                            <Box className="relative flex-1">
                                <Input
                                    {...register("captchaInput", {
                                        onChange: handleCaptchaChange
                                    })}
                                    ref={captchaRef}
                                    placeholder="کد امنیتی را وارد کنید"
                                    className="outline-none pr-12"
                                    variant={errors.captchaInput ? "error" : "default"}
                                    disabled={!isYearValid}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                />


                            </Box>
                        </Box>

                    </Box>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={!isValid || loading}
                    >
                        {loading ? 'در حال پردازش...' : 'درخواست رمز دوم'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
