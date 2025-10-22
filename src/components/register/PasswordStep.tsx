'use client';

import LoadingButton from '@/components/ui/core/LoadingButton';
import { Input } from '@/components/ui/forms';
import { useUser } from '@/contexts/UserContext';
import { passwordStepSchema, type PasswordStepForm } from '@/lib/schemas/personal';
import { CheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Box, Typography } from '../ui';
import { List, ListItem } from '../ui/list';
import CertificateStep from './CertificateStep';
export default function PasswordStep() {
    const router = useRouter();
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [transitionLoading, setTransitionLoading] = useState(false);
    const {
        control,
        formState: { errors },
        handleSubmit,
    } = useForm<PasswordStepForm>({
        resolver: zodResolver(passwordStepSchema),
        defaultValues: {
            ENFirstName: '',
            ENLastName: '',
            password: '',
            confirmPassword: '',
        },
    });
    const onSubmit = async (data: PasswordStepForm) => {
        const { ENFirstName, ENLastName, password } = data;
        setIsLoading(true);
        axios
            .post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'CertificateRequest',
                body: { ENFirstName, ENLastName, password },
            })
            .then((response) => {
                const { data } = response.data;
                if (data.body.success) {
                    setTransitionLoading(true);
                    // Add a small delay for better UX
                    setTimeout(() => {
                        setUserData({ password, ENFirstName, ENLastName });
                        setShowOtp(true);
                        setTransitionLoading(false);
                    }, 500);
                } else {
                    const errorMessage =
                        data.body.errorMessage || 'خطایی رخ داده است. لطفا دوباره تلاش کنید.';
                    toast.error(errorMessage);
                }
            })
            .catch(() => {
                toast.error('خطایی رخ داده است. لطفا دوباره تلاش کنید.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            {transitionLoading ? (
                <Box className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
                    <Box className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></Box>
                    <Typography variant="h6" className="text-primary text-center">
                        در حال آماده‌سازی مرحله بعدی...
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground text-center">
                        لطفاً کمی صبر کنید
                    </Typography>
                </Box>
            ) : !showOtp ? (
                <Box className="space-y-6">
                    <Box className="rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                        <List className="text-error-800 text-center text-sm">
                            <ListItem className="text-bold text-error-500 text-md mb-0 pb-0">
                                در نگهداری رمز عبور خود دقت کنید{' '}
                            </ListItem>
                            <ListItem className="text-md mb-0 pb-0">
                                نام و نام خانوادگی را به صورت حروف لاتین وارد کنید
                            </ListItem>
                            <ListItem className="text-md mb-0 pb-0">
                                رمز عبور باید حداقل 8 کاراکتر باشد
                            </ListItem>
                        </List>
                    </Box>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Box
                            className={`relative ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
                        >
                            <Controller
                                name="ENFirstName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        label="نام  لاتین"
                                        placeholder="نام  لاتین را وارد کنید"
                                        required
                                        fullWidth
                                        className="mb-2 text-left"
                                        dir="ltr"
                                        maxLength={200}
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        text-dark
                                        data-form-type="other"
                                        disabled={isLoading}
                                        error={errors.ENFirstName?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="ENLastName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        label="نام خانوادگی لاتین"
                                        placeholder="نام خانوادگی لاتین را وارد کنید"
                                        required
                                        fullWidth
                                        autoComplete="new"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        data-form-type="other"
                                        className="mb-2 text-left"
                                        dir="ltr"
                                        maxLength={200}
                                        disabled={isLoading}
                                        error={errors.ENLastName?.message}
                                    />
                                )}
                            />
                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type={showPassword ? 'text' : 'password'}
                                        label="رمز عبور"
                                        placeholder="رمز عبور را وارد کنید"
                                        required
                                        fullWidth
                                        className="mb-2 text-left"
                                        dir="ltr"
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        data-form-type="other"
                                        disabled={isLoading}
                                        error={errors.password?.message}
                                        startAdornment={
                                            <Box
                                                onClick={() =>
                                                    !isLoading && setShowPassword(!showPassword)
                                                }
                                                className={
                                                    isLoading
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : 'cursor-pointer'
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="dark:text-dark h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="dark:text-dark h-5 w-5" />
                                                )}
                                            </Box>
                                        }
                                    />
                                )}
                            />

                            <Controller
                                name="confirmPassword"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        fullWidth
                                        className="text-left"
                                        dir="ltr"
                                        label="تایید رمز عبور"
                                        placeholder="تکرار رمز عبور"
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck={false}
                                        data-form-type="other"
                                        disabled={isLoading}
                                        error={errors.confirmPassword?.message}
                                        startAdornment={
                                            <Box
                                                onClick={() =>
                                                    !isLoading && setShowPassword(!showPassword)
                                                }
                                                className={
                                                    isLoading
                                                        ? 'cursor-not-allowed opacity-50'
                                                        : 'cursor-pointer'
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </Box>
                                        }
                                    />
                                )}
                            />
                        </Box>
                        <Box className="mt-4 flex gap-2">
                            {/* <Button
                                onClick={() => reset({ password: '', confirmPassword: '' })}
                                className="bg-error-200 w-full"
                                disabled={isLoading}
                            >
                                بازنشانی
                            </Button> */}
                            <LoadingButton
                                type="submit"
                                loading={isLoading}
                                disabled={isLoading}
                                className="w-full text-gray-100"
                            >
                                {!isLoading && <CheckIcon className="h-5 w-5 text-white" />}
                                <Typography
                                    variant="body1"
                                    className="text-xs font-medium text-white"
                                >
                                    {isLoading ? 'در حال ارسال...' : 'مرحله بعد'}
                                </Typography>
                            </LoadingButton>
                        </Box>
                    </form>
                </Box>
            ) : (
                <CertificateStep
                    otp={otp}
                    setOtp={setOtp}
                    onIssue={() => {
                        if (otp.length === 6) {
                            setOtpLoading(true);
                            axios
                                .post('/api/bpms/send-message', {
                                    serviceName: 'virtual-open-deposit',
                                    formName: 'CertificateOtpVerify',
                                    processId: userData.processId,
                                    body: {
                                        otpCode: otp,
                                        password: userData.password,
                                    },
                                })
                                .then(() => {
                                    setUserData({ step: 6 });
                                })
                                .catch(() => {
                                    router.push('/login');
                                    toast.error('خطایی رخ داده است');
                                })
                                .finally(() => {
                                    setOtpLoading(false);
                                });
                        } else {
                            toast.error('کد تایید را کامل وارد کنید');
                        }
                    }}
                    loading={otpLoading}
                />
            )}
        </>
    );
}
