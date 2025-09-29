"use client";
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/forms';
import { PersianCalendar } from '@/components/forms';
import { Button } from '../ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isValidNationalId } from '@/components/NationalIdValidator';
import NationalCardPreview from './NationalCardPreview';


const PersonalInfoFormData = z.object({
    nationalCode: z.string("کد ملی اجباری است")
        .min(10, 'کد ملی باید 10 رقم باشد')
        .max(10, 'کد ملی باید 10 رقم باشد')
        .regex(/^\d{10}$/, 'کد ملی باید 10 رقم عددی باشد')
        .refine(isValidNationalId, 'کد ملی نامعتبر است'),
    phoneNumber: z.string("شماره تلفن اجباری است").min(11, 'شماره تلفن باید 11 رقم باشد').max(11, 'شماره تلفن باید 11 رقم باشد').regex(/^09\d{9}$/, 'شماره تلفن باید با 09 شروع شود و فقط شامل اعداد باشد'),
    birthDate: z.string().min(1, "تاریخ تولد اجباری است"),
    postalCode: z.string("کد پستی اجباری است").min(10, 'کد پستی باید 10 رقم باشد').max(10, 'کد پستی باید 10 رقم باشد').regex(/^\d+$/, 'کد پستی باید فقط شامل اعداد باشد'),
});
type PersonalInfoFormData = z.infer<typeof PersonalInfoFormData>;

export default function PersonalInfoForm({ setStep }:
    {
        setStep: (value: number) => void,
    }) {
    const [showNationalCardTemplate, setShowNationalCardTemplate] = React.useState(false);
    const [step1Data, setStep1Data] = React.useState<PersonalInfoFormData | null>(null);
    const [step2Data, setStep2Data] = React.useState<PersonalInfoFormData | null>(null);

    const handleNationalCardConfirm = () => {
        setShowNationalCardTemplate(false);
        setStep(2);
    };
    const { handleSubmit, formState: { errors }, control, getValues } = useForm<PersonalInfoFormData>({
        resolver: zodResolver(PersonalInfoFormData),
        mode: 'all',
        defaultValues: {
            nationalCode: '',
            phoneNumber: '',
            birthDate: '', // Default birth date as empty string
            postalCode: ''
        }
    });
    const onSubmit = () => {

        setShowNationalCardTemplate(true);
    };
    return (
        <div className="space-y-6">
            {showNationalCardTemplate ? null : <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <Controller
                    name="nationalCode"
                    control={control}
                    render={({ field }) => (
                        <Input {...field}
                            label="کد ملی"
                            placeholder="کد ملی را وارد کنید"
                            maxLength={10}
                            required
                            className="text-center"
                            error={errors.nationalCode?.message} />
                    )}
                />
                <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                        <Input {...field}
                            label="شماره تلفن همراه"
                            placeholder="09123456789"
                            maxLength={11}
                            required
                            className="text-center"
                            error={errors.phoneNumber?.message} />
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
                            error={errors?.birthDate?.message}
                        />
                    )}
                />

                <Controller
                    name="postalCode"
                    control={control}
                    render={({ field }) => (
                        <Input {...field}
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

                <Button type="submit" disabled={false} className="w-full mt-8 btn bg-primary">ادامه</Button>
            </form>}

            {showNationalCardTemplate && <NationalCardPreview
                nationalCode={getValues('nationalCode') as string || step1Data?.nationalCode || ''}
                birthDate={getValues('birthDate') as string || step2Data?.birthDate || ''}
                show={showNationalCardTemplate}
                onConfirm={handleNationalCardConfirm}
                onBack={() => { if (showNationalCardTemplate) setShowNationalCardTemplate(false); setStep(1); }}
            />}

        </div>
    );
}
