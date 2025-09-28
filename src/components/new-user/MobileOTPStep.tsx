"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, FormField } from "@/components/ui";
import { z } from "zod";

const schema = z.object({ otp: z.string().length(5, "کد تأیید باید ۵ رقم باشد").regex(/^\d+$/, "کد تأیید باید فقط شامل عدد باشد") });

interface MobileOTPStepProps {
    onNext: (data: { otp: string }) => void;
    onBack?: () => void;
}

export function MobileOTPStep({ onNext }: MobileOTPStepProps) {
    const { control, handleSubmit, formState: { errors, isValid } } = useForm<{ otp: string }>({
        resolver: zodResolver(schema),
        mode: 'onChange',
        defaultValues: { otp: '' }
    });

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle>ورود با OTP</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onNext)} className="space-y-4">
                    <FormField label="کد تأیید" error={!!errors.otp}>
                        <Controller name="otp" control={control} render={({ field }) => (
                            <Input {...field} placeholder="کد ۵ رقمی" />
                        )} />
                    </FormField>

                    <Button type="submit" className="w-full" disabled={!isValid}>تایید</Button>
                </form>
            </CardContent>
        </Card>
    );
}
