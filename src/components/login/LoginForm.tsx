'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Input,
    FormField,
} from '@/components/ui';
import { loginFormSchema, type LoginFormData } from '@/lib/schemas/common';

interface LoginFormProps {
    onNext: (data: LoginFormData) => void;
    loading?: boolean;
}

export function LoginForm({ onNext, loading }: LoginFormProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
        mode: 'onChange',
    });

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="text-center text-2xl font-bold text-gray-900">
                    ورود به حساب کاربری
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                    برای ورود، کد ملی و شماره موبایل خود را وارد کنید
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onNext)} className="space-y-6">
                    <FormField label="کد ملی" required error={errors.nationalCode?.message ?? ''}>
                        <Controller
                            name="nationalCode"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    placeholder="کد ملی ۱۰ رقمی"
                                    maxLength={10}
                                    {...field}
                                />
                            )}
                        />
                    </FormField>

                    <FormField
                        label="شماره موبایل"
                        required
                        error={errors.phoneNumber?.message ?? ''}
                    >
                        <Controller
                            name="phoneNumber"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="tel"
                                    placeholder="09xxxxxxxxx"
                                    maxLength={11}
                                    {...field}
                                />
                            )}
                        />
                    </FormField>

                    <Button type="submit" className="w-full" disabled={!isValid || loading}>
                        {loading ? 'در حال ارسال...' : 'ارسال کد تأیید'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
