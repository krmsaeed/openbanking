'use client';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { Input } from '@/components/ui/forms';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { useUser } from '@/contexts/UserContext';
import { personalInfoStepSchema, type PersonalInfoStepForm } from '@/lib/schemas/personal';
import { clearUserStateCookies, getCookie } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Box } from '../ui';

export default function PersonalInfo() {
    const { userData, setUserData } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
        getValues,
    } = useForm<PersonalInfoStepForm>({
        resolver: zodResolver(personalInfoStepSchema),
        mode: 'all',
        defaultValues: {
            phoneNumber: '',
            postalCode: '',
        },
    });
    type ApiBody = {
        code: string;
        mobile?: string;
        birthDate?: string;
        postalCode?: string;
    };

    const onSubmit = async (data: PersonalInfoStepForm) => {
        setIsLoading(true);
        try {
            const body: ApiBody = {
                code: userData.nationalCode?.trim() ?? `${getCookie('national_id')}`.trim(),
                mobile: data.phoneNumber?.trim(),
                postalCode: data.postalCode?.trim(),
            };

            await axios
                .post('/api/bpms/send-message', {
                    serviceName: 'virtual-open-deposit',
                    processId: userData.processId,
                    formName: 'CustomerInquiry',
                    body,
                })
                .then((response) => {
                    const { data: respData } = response;

                    if (respData?.body?.needKYC && !respData?.body?.hasActiveCertificate) {
                        setUserData({ ...userData, step: 2 });
                    }
                    if (!respData?.body?.needKYC && !respData?.body?.hasActiveCertificate) {
                        setUserData({ ...userData, step: 5 });
                    }
                    if (!respData?.body?.needKYC && respData?.body?.hasActiveCertificate) {
                        setUserData({ ...userData, step: 6 });
                    }
                })
                .catch((error) => {
                    console.log("🚀 ~ onSubmit ~ data:", error)
                    const { data } = error.response.data;
                    showDismissibleToast(data?.digitalMessageException?.message || 'خطایی رخ داد', 'error');

                });
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();

        if (userData.isCustomer) {
            const values = getValues();
            await onSubmit(values as PersonalInfoStepForm);
            return;
        }

        await handleSubmit(onSubmit)();
    };
    return (
        <Box className="w-full">
            <form onSubmit={onSubmitWrapper} className="space-y-3">
                <Input
                    label="کد ملی"
                    placeholder="کد ملی را وارد کنید"
                    required
                    disabled
                    value={userData.nationalCode}
                    className="text-center"
                />
                {!userData.isCustomer && (
                    <>
                        {' '}
                        <Controller
                            name="phoneNumber"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="شماره تلفن همراه"
                                    placeholder="09123456789"
                                    maxLength={11}
                                    required
                                    className="text-center"
                                    error={errors.phoneNumber?.message}
                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                />
                            )}
                        />
                        <Controller
                            name="postalCode"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    label="کد پستی"
                                    placeholder="1234567890"
                                    maxLength={10}
                                    type="text"
                                    className="text-center"
                                    error={errors.postalCode?.message}
                                    required
                                    onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                                />
                            )}
                        />
                    </>
                )}
                <LoadingButton type="submit" loading={isSubmitting || isLoading} />
            </form>
        </Box>
    );
}
