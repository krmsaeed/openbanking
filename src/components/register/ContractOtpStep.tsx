'use client';
import { Box, Input } from '@/components/ui';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Controller, Control, FieldErrors, UseFormSetError, UseFormGetValues } from 'react-hook-form';
import CertificateStep from './CertificateStep';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import httpClient from '@/lib/httpClient';
import { useState } from 'react';

type PasswordFormData = {
    password: string;
};

interface ContractOtpStepProps {
    control: Control<PasswordFormData>;
    errors: FieldErrors<PasswordFormData>;
    setError: UseFormSetError<PasswordFormData>;
    getValues: UseFormGetValues<PasswordFormData>;
    otp: string;
    setOtp: (otp: string) => void;
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    userData: { processId: number | null };
    setOtpLoading: (loading: boolean) => void;
    onIssue: () => void;
    loading: boolean;
    isValid: boolean;
}

export default function ContractOtpStep({
    control,
    errors,
    otp,
    setOtp,
    showPassword,
    setShowPassword,
    userData,
    setOtpLoading,
    onIssue,
    loading,
    isValid,
}: ContractOtpStepProps) {
    const [timeLeft, setTimeLeft] = useState(120)
    const onResend = () => {
        setOtpLoading(true);
        httpClient
            .post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'SignCustomerLoanContract',
                body: {
                    accept: true,
                    tryagain: true
                }
            })
            .then(() => {
                showDismissibleToast('کد تایید مجدد ارسال شد', 'success');
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
    };
    return (
        <Box className="rounded-lg bg-gray-100 p-4 space-y-4">
            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <Box className="relative">
                        <Input
                            {...field}
                            type={showPassword ? 'text' : 'password'}
                            label="رمز عبور"
                            placeholder="رمز عبور خود را وارد کنید"
                            value={field.value}
                            onChange={(e) => {
                                const original = e.target.value;
                                const filtered = original.replace(/\D/g, '');
                                field.onChange(filtered);
                            }}
                            required
                            fullWidth
                            maxLength={8}
                            className="text-left"
                            dir="ltr"
                            error={`${errors.password?.message ?? ''}`}
                            startAdornment={
                                <Box
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="cursor-pointer"
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </Box>
                            }
                        />
                    </Box>
                )}
            />
            <CertificateStep
                otp={otp}
                setOtp={setOtp}
                onResend={onResend}
                onIssue={onIssue}
                loading={loading}
                timeLeft={timeLeft}
                setTimeLeft={setTimeLeft}

            />
            <Box className="space-y-2">
                <LoadingButton
                    onClick={onIssue}
                    loading={loading}
                    disabled={otp.length !== 6 || !isValid || loading}
                />
            </Box>
        </Box>
    );
}