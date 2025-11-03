'use client';

import HomeLoader from '@/components/HomeLoader';
import ThemeToggle from '@/components/ThemeToggle';
import { Box, Card, Input, Typography } from '@/components/ui';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { useUser } from '@/contexts/UserContext';
import { convertPersianToEnglish, isValidNationalId, setCookie } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

const loginSchema = z.object({
    code: z
        .string()
        .min(1, 'کد ملی الزامی است')
        .transform((val) => convertPersianToEnglish(val))
        .pipe(
            z
                .string()
                .length(10, 'کد ملی باید 10 رقم باشد')
                .refine((val) => isValidNationalId(val), {
                    message: 'کد ملی وارد شده معتبر نیست',
                })
        ),
    username: z.string().min(1, 'نام کاربری الزامی است'),
    password: z.string().min(1, 'رمز عبور الزامی است'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { setUserData } = useUser();
    const isStage = process.env.IS_STAGE;

    const {
        register,
        handleSubmit,
        getValues,
        setValue,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: {
            code: '',
            username: 'demo',
            password: 'demo',
        },
    });

    const handleNationalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const converted = convertPersianToEnglish(e.target.value);
        setValue('code', converted, { shouldValidate: true });
    };

    const onSubmit = async () => {
        setIsLoading(true);

        try {
            const loginResponse = await axios.post('/api/bpms/login');
            const { access_token } = loginResponse.data;

            if (!access_token) {
                throw new Error('اطلاعات ورود نامعتبر است');
            }

            setCookie('access_token', access_token);
            setCookie('national_id', getValues('code'));

            try {
                const response = await axios.post('/api/bpms/send-message', {
                    serviceName: 'virtual-open-deposit',
                    body: { code: getValues('code') },
                });

                const { data } = response.data;

                setUserData({
                    nationalCode: getValues('code'),
                    step: 1,
                    processId: data?.processId,
                    isCustomer: data?.body?.isCustomer,
                    isDeposit: data?.body?.isDeposit,
                });

                router.push('/register');
            } catch (secondRequestError) {
                const message =
                    secondRequestError instanceof Error
                        ? secondRequestError.message
                        : 'خطا در بررسی اطلاعات';
                toast.error(message);
            }
        } catch (error) {
            console.log('🚀 ~ page.tsx:102 ~ onSubmit ~ error:', error);
            toast.error('عملیات ناموفق');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen w-full items-center justify-center">
            {!isStage ? (
                <HomeLoader />
            ) : (
                <Box className="container flex min-h-screen items-center justify-center">
                    <Box className="w-full max-w-md">
                        <Card className="space-y-6" padding="md">
                            <ThemeToggle className="absolute top-2 right-2 z-10" />
                            {/* Header */}
                            <Box className="space-y-2 text-center">
                                <Typography
                                    variant="h4"
                                    className="text-gray-900 dark:text-gray-100"
                                >
                                    ورود به سیستم
                                </Typography>
                                <Typography
                                    variant="body2"
                                    className="text-gray-600 dark:text-gray-400"
                                >
                                    لطفاً اطلاعات خود را وارد کنید
                                </Typography>
                            </Box>

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <Box className="space-y-2">
                                    <Input
                                        id="code"
                                        type="text"
                                        label="کد ملی"
                                        required
                                        placeholder="کد ملی را وارد کنید"
                                        disabled={isLoading}
                                        {...register('code', {
                                            required: 'کد ملی الزامی است',
                                            onChange: handleNationalCodeChange,
                                        })}
                                        className="w-full"
                                        error={errors.code?.message}
                                    />
                                </Box>
                                <Box className="space-y-2">
                                    <Input
                                        id="username"
                                        label="نام کاربری"
                                        required
                                        type="text"
                                        placeholder="نام کاربری خود را وارد کنید"
                                        {...register('username')}
                                        error={errors.username?.message}
                                        disabled={isLoading}
                                        className="w-full"
                                    />
                                </Box>

                                <Box className="space-y-2">
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        رمز عبور
                                    </label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="رمز عبور خود را وارد کنید"
                                        {...register('password')}
                                        error={errors.password?.message}
                                        disabled={isLoading}
                                        className="w-full"
                                    />
                                </Box>
                                <LoadingButton
                                    type="submit"
                                    title="ورود"
                                    loading={isLoading}
                                    disabled={isLoading}
                                />
                            </form>
                        </Card>
                    </Box>
                </Box>
            )}
        </main>
    );
}
