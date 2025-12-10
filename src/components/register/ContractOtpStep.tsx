'use client';
import { Box, Input, Label, Typography } from '@/components/ui';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import httpClient from '@/lib/httpClient';
import axios from 'axios';
import CertificateStep from './CertificateStep';
import { useUser } from '@/contexts/UserContext';
import { useContractStep } from '@/hooks/useContractStep';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { simplePasswordSchema as personalPasswordSchema } from '@/lib/schemas/personal';
import { useState } from 'react';

type PasswordFormData = {
    password: string;
};

const passwordSchema = z.object({
    password: personalPasswordSchema,
});

export default function ContractOtpStep() {
    const { userData } = useUser();
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const {
        setTimeLeft,
        isResending,
        showPassword,
        setShowPassword,
        // otp,
        // setOtp,
        // otpLoading,
        // setOtpLoading,
        setSignedPdfUrl,
        setShowModal,
        setIsResending,
        setShowSignedPreview,
    } = useContractStep();
    const {
        control,
        formState: { errors, isValid },
        setError,
        getValues,
        setValue,
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: '',
        },
    });
    const onIssue = async (): Promise<void> => {
        setOtpLoading(true);
        const body = {
            otpCode: otp,
            password: getValues('password'),
        }
        const resendBody = {
            tryAgain: true,
        }
        try {
            const response = await httpClient.post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                formName: isResending ? 'MtcRequestSignErrorResult' : 'MtcRequestSignResult',
                processId: userData.processId,
                body: isResending ? resendBody : body,
            });
            if (response.status === 200 && response.data?.body?.responseBase64) {
                const base64 = response.data.body.responseBase64;
                const pdfDataUrl = typeof base64 === 'string' && base64.startsWith('data:') ? base64 : `data:application/pdf;base64,${base64}`;
                setSignedPdfUrl(pdfDataUrl);
                setShowModal(false);
                setShowSignedPreview(true);
            }
        } catch (error) {
            const message = await resolveCatalogMessage(
                axios.isAxiosError(error) ? error.response?.data : undefined,
                'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
            );
            setTimeLeft(0)
            showDismissibleToast(message, 'error');
        } finally {
            setOtpLoading(false);
        }
    };

    const onIssueRetry = async (): Promise<void> => {
        setIsResending(true);
        onIssue()
        // setTimeLeft(0);
        // try {
        //     await httpClient.post('/api/bpms/send-message', {
        //         serviceName: 'virtual-open-deposit',
        //         formName: 'MtcRequestSignResult',
        //         processId: userData.processId,
        //         body: {
        //             tryAgain: true,
        //         },
        //     });
        //     setTimeLeft(2);
        //     showDismissibleToast('کد تایید مجدد ارسال شد', 'success');
        // } catch {
        //     // setShowModal(false);
        //     return;
        // } finally {
        //     setIsResending(false);
        // }
    };

    return (
        <>
            <Box className="  text-center p-3 rounded-lg shadow-sm felx gap-3 justify-between items-center flex-col mb-2 bg-gray-100">
                <Typography variant="p" className='text-primary-900 text-md mb-2'>
                    لطفا کد تایید پیامک شده را وارد کنید
                </Typography>
                <Typography variant="p" className='text-primary-900 text-md'>
                    رمز عبوری که در مرحله قبل تنظیم کرده اید را وارد کنید
                </Typography>
            </Box>
            <Box className="space-y-4 bg-gray-100 p-3 rounded-lg">
                <Box>
                    <Label required>کد تایید</Label>
                    <CertificateStep
                        otp={otp}
                        setOtp={setOtp}
                        onResend={onIssueRetry}
                        onIssue={onIssue}
                        loading={otpLoading}
                        resendLoading={isResending}
                    />

                </Box>
                <Box className="relative">
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
                                disabled={otpLoading}
                                error={errors.password?.message}
                                onChange={(e) => {
                                    const original = e.target.value;
                                    const filtered = original.replace(/\D/g, '');
                                    if (original !== filtered) {
                                        setError('password', {
                                            message: 'فقط عدد مجاز است',
                                        });
                                    } else {
                                        setError('password', { type: 'manual', message: '' });
                                    }
                                    field.onChange(filtered.replace(/\D/g, ''));
                                }}
                                startAdornment={
                                    <Box
                                        onClick={() => !isResending && setShowPassword(!showPassword)}
                                        className={
                                            isResending
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

                </Box>
                <Box className="mt-4">
                    <LoadingButton
                        title="تایید"
                        onClick={onIssue}
                        loading={otpLoading}
                        disabled={otp.length !== 6 || !isValid || otpLoading || isResending}
                    />
                </Box>
            </Box>
        </>
    );
}
