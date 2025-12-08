'use client';

import LoadingButton from '@/components/ui/core/LoadingButton';
import { Input } from '@/components/ui/forms';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { useUser } from '@/contexts/UserContext';
import { passwordStepSchema, type PasswordStepForm } from '@/lib/schemas/personal';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Box, Typography } from '../ui';
import { List, ListItem } from '../ui/list';
import CertificateStep from './CertificateStep';
export default function PasswordStep() {
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const {
        control,
        formState: { errors },
        setError,
        getValues,
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
        setUserData({ ...userData, password });
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
            .then(() => {
                setShowOtp(true);
                setTimeLeft(120);
            })
            .catch(async (error) => {
                const message = await resolveCatalogMessage(
                    error.response?.data,
                    'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
                );
                showDismissibleToast(message, 'error');
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
                formName: 'CertificateOtpVerify',
                body: {
                    ENFirstName: getValues('ENFirstName'),
                    ENLastName: getValues('ENLastName'),
                    password: getValues('password'),
                    tryAgain: true,
                },
            })
            .then(() => {
                setShowOtp(false);
            })
            .catch(async (error) => {
                const message = await resolveCatalogMessage(
                    error.response?.data,
                    'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
                );
                showDismissibleToast(message, 'error');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    const [showPassword, setShowPassword] = useState(false);
    const onIssue = () => {
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
                .catch(async (error) => {
                    const message = await resolveCatalogMessage(
                        error.response?.data,
                        'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
                    );
                    showDismissibleToast(message, 'error');
                })
                .finally(() => {
                    setOtpLoading(false);
                });
        } else {
            showDismissibleToast('کد تایید را کامل وارد کنید', 'error');
        }
    };
    return !showOtp ? (
        <Box className="space-y-3">
            <Box className="rounded-xl bg-gray-100 ">
                <List marker={false} className="text-error-800 rounded-lg bg-gray-200 p-2 text-center text-sm shadow-sm">
                    <ListItem className="text-bold text-error-500 mb-0 pb-0 text-lg">
                        در نگهداری رمز عبور خود دقت کنید{' '}
                    </ListItem>
                    <ListItem className="text-md mb-0 pb-0">
                        نام و نام خانوادگی را به صورت حروف لاتین وارد کنید
                    </ListItem>
                    <ListItem className="text-md mb-0 pb-0">
                        رمز عبور باید 8 رقم و فقط عدد باشد
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
                                onChange={(e) => {
                                    const original = e.target.value;
                                    const filtered = original.replace(/[^a-zA-Z ]/g, '');
                                    if (original !== filtered) {
                                        setError('ENFirstName', {
                                            type: 'manual',
                                            message: 'فقط حروف انگلیسی مجاز است',
                                        });
                                    } else {
                                        setError('ENFirstName', { type: 'manual', message: '' });
                                    }
                                    field.onChange(filtered);
                                }}
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
                                onChange={(e) => {
                                    const original = e.target.value;
                                    const filtered = original.replace(/[^a-zA-Z ]/g, '');
                                    if (original !== filtered) {
                                        setError('ENLastName', {
                                            type: 'manual',
                                            message: 'فقط حروف انگلیسی مجاز است',
                                        });
                                    } else {
                                        setError('ENLastName', { type: 'manual', message: '' });
                                    }
                                    field.onChange(filtered);
                                }}
                            />
                        )}
                    />
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                type={showPassword ? 'tel' : 'password'}
                                inputMode="numeric"
                                pattern="\\d{8}"
                                label="رمز عبور"
                                placeholder="رمز عبور را وارد کنید"
                                required
                                fullWidth
                                maxLength={8}
                                className="mb-2 text-left"
                                dir="ltr"
                                autoComplete="new-password"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                data-form-type="other"
                                disabled={isLoading}
                                error={errors.password?.message}
                                onChange={(e) => {
                                    const original = e.target.value;
                                    const filtered = original.replace(/\D/g, '');
                                    if (original !== filtered) {
                                        setError('password', {
                                            type: 'manual',
                                            message: 'فقط عدد مجاز است',
                                        });
                                    } else {
                                        setError('password', { type: 'manual', message: '' });
                                    }
                                    field.onChange(filtered.replace(/\D/g, ''));
                                }}
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
                                type={showPassword ? 'tel' : 'password'}
                                inputMode="numeric"
                                pattern="\\d{8}"
                                required
                                fullWidth
                                maxLength={8}
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
                                onChange={(e) => {
                                    const original = e.target.value;
                                    const filtered = original.replace(/\D/g, '');
                                    if (original !== filtered) {
                                        setError('confirmPassword', {
                                            type: 'manual',
                                            message: 'فقط عدد مجاز است',
                                        });
                                    } else {
                                        setError('confirmPassword', {
                                            type: 'manual',
                                            message: '',
                                        });
                                    }
                                    field.onChange(filtered.replace(/\D/g, ''));
                                }}
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
        <Box className="space-y-4">
            <Box className="text-center text-sm bg-gray-200 p-3 rounded-lg shadow-sm">
                <Typography variant="span" className='text-purple-800'>
                    لطفا کد تایید پیامک شده را وارد کنید
                </Typography>
            </Box>
            <CertificateStep
                otp={otp}
                setOtp={setOtp}
                onResend={handleResendOTP}
                onIssue={onIssue}
                loading={otpLoading}
                resendLoading={isLoading}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}
            />
            <Box className="space-y-2">
                <LoadingButton
                    onClick={onIssue}
                    loading={otpLoading}
                    disabled={otp.length !== 6 || otpLoading}
                />
            </Box>
        </Box>
    );
}
