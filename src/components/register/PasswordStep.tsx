'use client';

import LoadingButton from '@/components/ui/core/LoadingButton';
import { Input } from '@/components/ui/forms';
import { useUser } from '@/contexts/UserContext';
import { passwordStepSchema, type PasswordStepForm } from '@/lib/schemas/personal';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Box } from '../ui';
import { List, ListItem } from '../ui/list';
import CertificateStep from './CertificateStep';

export default function PasswordStep() {
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
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
                    setUserData({ password, ENFirstName, ENLastName });
                    setShowOtp(true);
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
            {!showOtp ? (
                <Box className="space-y-6">
                    <Box className="rounded-xl bg-gray-100 p-4 dark:bg-gray-800">
                        <List className="text-error-800 space-y-1 text-center text-sm">
                            <ListItem className="text-bold dark- text-error-500 text-lg">
                                در نگهداری رمز عبور خود دقت کنید{' '}
                            </ListItem>
                            <ListItem>نام و نام خانوادگی را به صورت حروف لاتین وارد کنید</ListItem>
                            <ListItem>رمز عبور باید حداقل 8 کاراکتر باشد</ListItem>
                        </List>
                    </Box>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                                    className="text-left"
                                    dir="ltr"
                                    maxLength={200}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    text-dark
                                    data-form-type="other"
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
                                    className="text-left"
                                    dir="ltr"
                                    maxLength={200}
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
                                    className="text-left"
                                    dir="ltr"
                                    autoComplete="new-password"
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    data-form-type="other"
                                    error={errors.password?.message}
                                    startAdornment={
                                        <Box onClick={() => setShowPassword(!showPassword)}>
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
                                    error={errors.confirmPassword?.message}
                                    startAdornment={
                                        <Box onClick={() => setShowPassword(!showPassword)}>
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
                                className="w-full"
                            >
                                تعیین رمز عبور
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
                                .then((res) => {
                                    const { data } = res.data;
                                    if (data.body.success) {
                                        toast.success('عملیات موفق');
                                        setUserData({ step: 6 });
                                    } else {
                                        toast.error('عملیات ناموفق');
                                    }
                                })
                                .catch((error) => {
                                    console.error('OTP verification failed', error);
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
