'use client';
import { PersianCalendar } from '@/components/forms';
import { Input } from '@/components/ui/forms';
import { useUser } from '@/contexts/UserContext';
import { personalInfoStepSchema, type PersonalInfoStepForm } from '@/lib/schemas/personal';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '../ui';

export default function PersonalInfo() {
    const { userData, setUserData } = useUser();

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
    } = useForm<PersonalInfoStepForm>({
        resolver: zodResolver(personalInfoStepSchema),
        mode: 'all',
        defaultValues: {
            phoneNumber: '',
            birthDate: '',
            postalCode: '',
        },
    });
    const onSubmit = async (data: PersonalInfoStepForm) => {
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
        </div>
    );
}
