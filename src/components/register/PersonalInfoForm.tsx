"use client";
import React from 'react';
import { Controller, Control, FieldErrors, FieldValues, Path } from 'react-hook-form';
import { Input } from '@/components/ui/forms';
import { PersianCalendar } from '@/components/forms';
import { Button } from '../ui';

interface Props<T extends FieldValues> {
    control: Control<T>;
    errors: FieldErrors<T>;
    onSubmit: () => void;
}

export default function PersonalInfoForm<T extends FieldValues>({ control, errors, onSubmit }: Props<T>) {
    return (
        <div className="space-y-6">
            <form onSubmit={onSubmit} className="space-y-3">
                <Controller
                    name={"nationalCode" as Path<T>}
                    control={control}
                    render={({ field }) => (
                        <Input {...field} label="کد ملی" placeholder="کد ملی را وارد کنید" maxLength={10} required type="tel" dir="ltr" className="text-center" error={typeof errors.nationalCode?.message === 'string' ? errors.nationalCode?.message : undefined} />
                    )}
                />

                <Controller
                    name={"phoneNumber" as Path<T>}
                    control={control}
                    render={({ field }) => (
                        <Input {...field} label="شماره تلفن همراه" type="tel" placeholder="09123456789" maxLength={11} className="text-center" dir="ltr" required error={typeof errors.phoneNumber?.message === 'string' ? errors.phoneNumber?.message : undefined} />
                    )}
                />

                <Controller
                    name={"birthDate" as Path<T>}
                    control={control}
                    render={({ field }) => (
                        <PersianCalendar label="تاریخ تولد" placeholder="تاریخ تولد را انتخاب کنید" value={field.value} onChange={field.onChange} required className="w-full" maxDate={new Date()} error={typeof errors.birthDate?.message === 'string' ? errors.birthDate?.message : undefined} />
                    )}
                />

                <Controller
                    name={"postalCode" as Path<T>}
                    control={control}
                    render={({ field }) => (
                        <Input {...field} label="کد پستی" placeholder="1234567890" maxLength={10} type="tel" dir="ltr" className="text-center" required error={typeof errors.postalCode?.message === 'string' ? errors.postalCode?.message : undefined} />
                    )}
                />

                <Button type="submit" className="w-full mt-8 btn bg-primary">ادامه</Button>
            </form>
        </div>
    );
}
