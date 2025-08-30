"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, FormField } from "@/components/ui";
import { loginSchema, type LoginFormData } from "@/lib/schemas/login";

interface LoginFormProps {
    onNext: (data: LoginFormData) => void;
    loading?: boolean;
}

export function LoginForm({ onNext, loading }: LoginFormProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange'
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
                    <FormField
                        label="کد ملی"
                        required
                        error={errors.nationalId?.message}
                    >
                        <Input
                            {...register("nationalId")}
                            placeholder="کد ملی ۱۰ رقمی"
                            maxLength={10}
                        />
                    </FormField>

                    <FormField
                        label="شماره موبایل"
                        required
                        error={errors.phoneNumber?.message}
                    >
                        <Input
                            {...register("phoneNumber")}
                            placeholder="09xxxxxxxxx"
                            maxLength={11}
                        />
                    </FormField>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={!isValid || loading}
                    >
                        {loading ? 'در حال ارسال...' : 'ارسال کد تأیید'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
