"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, FormField, Select } from "@/components/ui";
import { cardFormSchema, type CardFormData } from "@/lib/schemas/payment";

interface PaymentFormProps {
    amount: string;
    onNext: (data: CardFormData) => void;
    loading?: boolean;
}

export function PaymentForm({ amount, onNext, loading }: PaymentFormProps) {
    const [captcha, setCaptcha] = useState(generateCaptcha());

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

    function generateCaptcha(): string {
        return Math.random().toString(36).substring(2, 7).toUpperCase();
    }

    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCardNumber(e.target.value);
        setValue('cardNumber', formatted);
    };

    const refreshCaptcha = () => {
        setCaptcha(generateCaptcha());
        setValue('captchaInput', '');
    };

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
                <form onSubmit={handleSubmit(onNext)} className="space-y-6">
                    <FormField
                        label="شماره کارت"
                        required
                        error={errors.cardNumber?.message}
                    >
                        <Input
                            value={cardNumber || ''}
                            onChange={handleCardNumberChange}
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                        />
                    </FormField>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            label="ماه انقضا"
                            required
                            error={errors.expiryMonth?.message}
                        >
                            <Select {...register("expiryMonth")}>
                                <option value="">ماه</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                        {String(i + 1).padStart(2, '0')}
                                    </option>
                                ))}
                            </Select>
                        </FormField>

                        <FormField
                            label="سال انقضا"
                            required
                            error={errors.expiryYear?.message}
                        >
                            <Select {...register("expiryYear")}>
                                <option value="">سال</option>
                                {Array.from({ length: 10 }, (_, i) => {
                                    const year = new Date().getFullYear() + i;
                                    return (
                                        <option key={year} value={String(year).slice(-2)}>
                                            {year}
                                        </option>
                                    );
                                })}
                            </Select>
                        </FormField>
                    </div>

                    <FormField
                        label="CVV2"
                        required
                        error={errors.cvv2?.message}
                    >
                        <Input
                            {...register("cvv2")}
                            type="password"
                            placeholder="123"
                            maxLength={3}
                        />
                    </FormField>

                    <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">
                                کد امنیتی *
                            </label>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={refreshCaptcha}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <ArrowPathIcon className="w-4 h-4 ml-1" />
                                تجدید
                            </Button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white px-4 py-2 border-2 border-dashed border-gray-300 rounded font-mono text-lg font-bold tracking-wider select-none">
                                {captcha}
                            </div>
                            <Input
                                {...register("captchaInput")}
                                placeholder="کد امنیتی را وارد کنید"
                                className="flex-1"
                            />
                        </div>
                        {errors.captchaInput && (
                            <p className="text-red-500 text-xs mt-1">{errors.captchaInput.message}</p>
                        )}
                    </div>

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
