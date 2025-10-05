'use client';
import { PersianCalendar } from '@/components/forms';
import { Input } from '@/components/ui/forms';
import { useUser } from '@/contexts/UserContext';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui';

const PersonalInfoFormData = z.object({
    phoneNumber: z
        .string('شماره تلفن اجباری است')
        .min(11, 'شماره تلفن باید 11 رقم باشد')
        .max(11, 'شماره تلفن باید 11 رقم باشد')
        .regex(/^09\d{9}$/, 'شماره تلفن باید با 09 شروع شود و فقط شامل اعداد باشد'),
    birthDate: z.string().min(1, 'تاریخ تولد اجباری است'),
    postalCode: z
        .string('کد پستی اجباری است')
        .min(10, 'کد پستی باید 10 رقم باشد')
        .max(10, 'کد پستی باید 10 رقم باشد')
        .regex(/^\d+$/, 'کد پستی باید فقط شامل اعداد باشد'),
});
type PersonalInfoFormData = z.infer<typeof PersonalInfoFormData>;

export default function PersonalInfoForm() {
    const { userData, setUserData } = useUser();
    const [showNationalCardTemplate] = React.useState(false);

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
    } = useForm<PersonalInfoFormData>({
        resolver: zodResolver(PersonalInfoFormData),
        mode: 'all',
        defaultValues: {
            phoneNumber: '',
            birthDate: '',
            postalCode: '',
        },
    });
    const onSubmit = async (data: PersonalInfoFormData) => {
        await axios
            .post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'CustomerInquiry',
                body: {
                    code: userData.nationalCode,
                    mobile: data.phoneNumber,
                    birthDate: data.birthDate,
                    postalCode: data.postalCode,
                },
            })
            .then((response) => {
                const { data } = response.data;
                if (data?.body.hasActiveCertificate) {
                    setUserData({ step: 6 });
                } else {
                    if (data.body.needKYC) setUserData({ step: 2 });
                    else setUserData({ step: 5 });
                }
            });
    };
    return (
        <div className="w-full">
            {showNationalCardTemplate ? null : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                    <Input
                        label="کد ملی"
                        placeholder="کد ملی را وارد کنید"
                        required
                        disabled
                        value={userData.nationalCode}
                        className="text-center"
                    />
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

                    <Button
                        type="submit"
                        className="btn bg-primary mt-8 w-full"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        ادامه
                    </Button>
                </form>
            )}
        </div>
    );
}
