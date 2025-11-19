'use client';

import LoadingButton from '@/components/ui/core/LoadingButton';
import { Input } from '@/components/ui/forms';
import { useUser } from '@/contexts/UserContext';
import { passwordStepSchema, type PasswordStepForm } from '@/lib/schemas/personal';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Box } from '../ui';
import { List, ListItem } from '../ui/list';
import CertificateStep from './CertificateStep';
export default function PasswordStep() {
    const router = useRouter();
    const { userData, setUserData, clearUserData } = useUser();
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
                body: {
                    ENFirstName: ENFirstName.trim(),
                    ENLastName: ENLastName.trim(),
                    password: password.trim(),
                },
            })
            .then((response) => {
                const { data } = response.data;
                if (data.body.success) {
                    setUserData({
                        password: password.trim(),
                        ENFirstName: ENFirstName.trim(),
                        ENLastName: ENLastName.trim(),
                    });
                    setShowOtp(true);
                } else {
                    const errorMessage = 'مجوز احراز هویت با خطا مواجه . لطفا دوباره تلاش کنید.';
                    toast.error(errorMessage);
                    router.push('/');
                }
            })
            .catch((error) => {
                const message = error.response?.data?.data?.digitalMessageException?.message;
                toast.error(message || 'عدم برقراری ارتباط با سرور', {
                    duration: 5000,
                });
                clearUserData();
                router.push('/');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleResendOTP = () => {
        setIsLoading(true);
        axios
            .post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'CertificateRequest',
                body: {
                    ENFirstName: userData.ENFirstName,
                    ENLastName: userData.ENLastName,
                    password: userData.password,
                },
            })
            .then((response) => {
                const { data } = response.data;
                if (data.body.success) {
                    toast.success('کد تایید مجدد ارسال شد');
                } else {
                    toast.error('خطا در ارسال مجدد کد');
                }
            })
            .catch((error) => {
                const message = error.response?.data?.data?.digitalMessageException?.message;
                toast.error(message || 'عدم برقراری ارتباط با سرور');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    const [showPassword, setShowPassword] = useState(false);

    return !showOtp ? (
        <Box className="space-y-3">
            <Box className="rounded-xl bg-gray-100 dark:bg-gray-800">
                <List className="text-error-800 rounded-lg bg-gray-200 p-2 text-center text-sm shadow-sm">
                    <ListItem className="text-bold text-error-500 mb-0 pb-0 text-lg">
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
                <Box className={`relative ${isLoading ? 'pointer-events-none opacity-60' : ''}`}>
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
                                        onClick={() => !isLoading && setShowPassword(!showPassword)}
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
                                        onClick={() => !isLoading && setShowPassword(!showPassword)}
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
                    <LoadingButton type="submit" loading={isLoading} disabled={isLoading} />
                </Box>
            </form>
        </Box>
    ) : (
        <CertificateStep
            otp={otp}
            setOtp={setOtp}
            onResend={handleResendOTP}
            onIssue={() => {
                if (otp.length === 6) {
                    setOtpLoading(true);
                    axios
                        .post('/api/bpms/send-message', {
                            serviceName: 'virtual-open-deposit',
                            formName: 'CertificateOtpVerify',
                            processId: userData.processId,
                            body: {
                                otpCode: otp.trim(),
                                password: userData.password,
                            },
                        })
                        .then(() => {
                            setUserData({ step: 6 });
                        })
                        .catch((error) => {
                            const message =
                                error.response?.data?.data?.digitalMessageException?.message;
                            toast.error(message || 'عدم برقراری ارتباط با سرور', {
                                duration: 5000,
                            });
                            router.push('/');
                            setUserData({});
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
    );
}
