"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, FormField } from "@/components/ui";
import { birthDateSchema, postalCodeSchema } from "@/lib/schemas/personal";
import { z } from "zod";

interface BirthPostalStepProps {
    onNext: (data: { birthDate: string; postalCode: string }) => void;
    onBack?: () => void;
}

export function BirthPostalStep({ onNext }: BirthPostalStepProps) {
    const schema = z.object({ birthDate: birthDateSchema, postalCode: postalCodeSchema });

    const { control, handleSubmit, formState: { errors, isValid } } = useForm<{ birthDate: string; postalCode: string }>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: { birthDate: '', postalCode: '' }
    });

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle>تاریخ تولد و کد پستی</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onNext)} className="space-y-4">
                    <FormField label="تاریخ تولد" error={errors.birthDate?.message}>
                        <Controller name="birthDate" control={control} render={({ field }) => (
                            <Input {...field} type="date" />
                        )} />
                    </FormField>

                    <FormField label="کد پستی" error={errors.postalCode?.message}>
                        <Controller name="postalCode" control={control} render={({ field }) => (
                            <Input {...field} placeholder="کد پستی ۱۰ رقمی" />
                        )} />
                    </FormField>

                    <Button type="submit" className="w-full" disabled={!isValid}>مرحله بعد</Button>
                </form>
            </CardContent>
        </Card>
    );
}
