"use client";
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Input } from '@/components/ui/forms';
import { PersianCalendar } from '@/components/forms';
import { Button } from '../ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import NationalCardPreview from './NationalCardPreview';
import { useUser } from '@/contexts/UserContext';
import axios from 'axios';


const PersonalInfoFormData = z.object({

    phoneNumber: z.string("شماره تلفن اجباری است").min(11, 'شماره تلفن باید 11 رقم باشد').max(11, 'شماره تلفن باید 11 رقم باشد').regex(/^09\d{9}$/, 'شماره تلفن باید با 09 شروع شود و فقط شامل اعداد باشد'),
    birthDate: z.string().min(1, "تاریخ تولد اجباری است"),
    postalCode: z.string("کد پستی اجباری است").min(10, 'کد پستی باید 10 رقم باشد').max(10, 'کد پستی باید 10 رقم باشد').regex(/^\d+$/, 'کد پستی باید فقط شامل اعداد باشد'),
});
type PersonalInfoFormData = z.infer<typeof PersonalInfoFormData>;

export default function PersonalInfoForm() {
    const { userData, setUserData } = useUser();
    const [showNationalCardTemplate, setShowNationalCardTemplate] = React.useState(false);

    const { handleSubmit, formState: { errors }, control, getValues } = useForm<PersonalInfoFormData>({
        resolver: zodResolver(PersonalInfoFormData),
        mode: 'all',
        defaultValues: {
            phoneNumber: '',
            birthDate: '',
            postalCode: ''
        }
    });
    const onSubmit = async (data: PersonalInfoFormData) => {
        await axios.post("/api/bpms/kekyc-user-send-message", {
            serviceName: 'virtual-open-deposit',
            processId: userData.processId,
            formName: 'CustomerInquiry',
            body:
            {
                code: userData.nationalCode,
                mobile: data.phoneNumber,
                birthDate: data.birthDate,
                postalCode: data.postalCode
            }
        }).then(response => {
            if (response.data.body.hasActiveCertificate) setUserData({ step: 2 })
            else setUserData({ step: 2 })
        })
    };
    return (
        <div className="space-y-6">
            {showNationalCardTemplate ? null : <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

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
                            outputFormat="iso"
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

                <Button type="submit" className="w-full mt-8 btn bg-primary">ادامه</Button>
            </form>}
            {/* 
            {showNationalCardTemplate && <NationalCardPreview
                nationalCode={userData.nationalCode}
                birthDate={getValues('birthDate') as string}
                show={showNationalCardTemplate}
                onConfirm={handleNationalCardConfirm}
                onBack={() => { if (showNationalCardTemplate) setShowNationalCardTemplate(false); setUserData({ step: 1 }); }}
            />} */}

        </div>
    );
}
