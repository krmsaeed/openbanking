'use client';
import { PersianCalendar } from '@/components/forms';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { Input } from '@/components/ui/forms';
import { useUser } from '@/contexts/UserContext';
import { personalInfoStepSchema, type PersonalInfoStepForm } from '@/lib/schemas/personal';
import { CheckIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { Typography } from '../ui';

export default function PersonalInfo() {
    const { userData, setUserData } = useUser();

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
            birthDate: '',
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
        const body: ApiBody = {
            code: userData.nationalCode ?? '',
            mobile: data.phoneNumber,
            birthDate: data.birthDate,
            postalCode: data.postalCode,
        };

        await axios
            .post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'CustomerInquiry',
                body,
            })
            .then((response) => {
                const { data: respData } = response.data;

                if (respData?.body.needKYC && !respData?.body.hasActiveCertificate) {
                    setUserData({ ...userData, step: 2 });
                }
                if (!respData?.body.needKYC && !respData?.body.hasActiveCertificate) {
                    setUserData({ ...userData, step: 5 });
                }
                if (!respData?.body.needKYC && respData?.body.hasActiveCertificate) {
                    setUserData({ ...userData, step: 6 });
                }
            });
    };

    // Wrapper to bypass validation when user is a customer
    const onSubmitWrapper = async (e: React.FormEvent) => {
        e.preventDefault();
        if (userData.isCustomer) {
            // Grab current values but do not run validation
            const values = getValues();
            // Call onSubmit with values (optional fields will be ignored server-side)
            await onSubmit(values as PersonalInfoStepForm);
        } else {
            // Run normal validation and submission
            await handleSubmit(onSubmit)();
        }
    };
    return (
        <div className="w-full">
            <form onSubmit={onSubmitWrapper} className="space-y-3">
                <Input
                    label="کد ملی"
                    placeholder="کد ملی را وارد کنید"
                    required
                    disabled
                    value={userData.nationalCode}
                    className="text-center"
                />
                {userData.isCustomer && (
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
                                />
                            )}
                        />
                        <Controller
                            name="birthDate"
                            control={control}
                            render={({ field }) => (
                                <PersianCalendar
                                    {...field}
                                    label="تاریخ تولد"
                                    value={field.value}
                                    placeholder="تاریخ تولد را انتخاب کنید"
                                    className="w-full"
                                    required
                                    maxDate={new Date()}
                                    outputFormat="iso"
                                    error={errors?.birthDate?.message}
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
                                />
                            )}
                        />
                    </>
                )}
                <LoadingButton
                    type="submit"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    className="bg-primary-400 mt-5 flex w-full items-center justify-center gap-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {!isSubmitting && <CheckIcon className="h-5 w-5" />}
                    <Typography variant="body1" className="text-xs font-medium text-white">
                        {isSubmitting ? 'در حال ارسال...' : 'مرحله بعد'}
                    </Typography>
                </LoadingButton>
            </form>
        </div>
    );
}
