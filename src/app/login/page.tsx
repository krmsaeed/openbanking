'use client';

import ThemeToggle from '@/components/ThemeToggle';
import { Box, Button, Card, Input, Typography } from '@/components/ui';
import { useUser } from '@/contexts/UserContext';
import { setCookie } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';

const loginSchema = z.object({
    code: z.string().min(1, ' کدملی الزامی است'),
    username: z.string().min(1, 'نام کاربری الزامی است'),
    password: z.string().min(1, 'رمز عبور الزامی است'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { setUserData } = useUser();
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
        mode: 'onBlur',
        defaultValues: {
            code: '4199928340',
            username: 'demo',
            password: 'demo',
        },
    });

    const onSubmit = async () => {
        setIsLoading(true);

        await axios
            .post('/api/bpms/login')
            .then((response) => {
                const data = response.data;
                if (!data?.access_token) {
                    throw new Error('اطلاعات ورود نامعتبر است');
                }
                setCookie('access_token', data.access_token);
                setCookie('national_id', getValues('code'));
                setUserData({ nationalCode: getValues('code'), step: 1 });
                toast.success('ورود موفقیت‌آمیز بود');
                router.push('/register');
            })
            .catch((error) => {
                const message = error?.response?.data?.error ?? error.message;
                toast.error(message || 'خطا در ورود به سیستم');
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <Box className="container flex min-h-screen items-center justify-center px-4 py-8">
            <Box className="w-full max-w-md">
                <Card className="space-y-6 p-6 md:p-8">
                    <ThemeToggle className="absolute top-4 right-4 z-10" />
                    {/* Header */}
                    <Box className="space-y-2 text-center">
                        <Typography variant="h4" className="text-gray-900 dark:text-gray-100">
                            ورود به سیستم
                        </Typography>
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
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
                                {...register('code')}
                                className="w-full"
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

                        {/* Password Input */}
                        <Box className="space-y-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
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

                        {/* Forgot Password Link */}
                        {/* <Box className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => router.push('/forgot-password')}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm"
                            >
                                فراموشی رمز عبور؟
                            </button>
                        </Box> */}

                        {/* Submit Button */}
                        <Button
                            variant="primary"
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'در حال ورود...' : 'ورود'}
                        </Button>
                    </form>

                    {/* Register Link */}
                    {/* <Box className="text-center">
                        <Typography variant="body2" className="text-gray-600 dark:text-gray-400">
                            حساب کاربری ندارید؟{' '}
                            <button
                                onClick={() => router.push('/register')}
                                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                            >
                                ثبت‌نام کنید
                            </button>
                        </Typography>
                    </Box> */}
                </Card>
            </Box>
        </Box>
    );
}
