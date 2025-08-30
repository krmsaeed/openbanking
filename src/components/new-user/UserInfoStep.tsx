"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, FormField } from "@/components/ui";
import { newUserSchema, type NewUserFormData } from "@/lib/schemas/newUser";

interface UserInfoStepProps {
    onNext: (data: NewUserFormData) => void;
}

export function UserInfoStep({ onNext }: UserInfoStepProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<NewUserFormData>({
        resolver: zodResolver(newUserSchema),
        mode: "onChange",
        defaultValues: {
            firstName: "",
            lastName: "",
            nationalCode: "",
            mobile: "",
            email: "",
            birthDate: "",
        },
    });

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="text-center">
                    ایجاد حساب جدید
                </CardTitle>
                <CardDescription className="text-center">
                    اطلاعات پایه خود را وارد کنید
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onNext)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="نام" required>
                            <Input
                                type="text"
                                placeholder="نام خود را وارد کنید"
                                {...register("firstName")}
                            />
                            {errors.firstName && (
                                <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                            )}
                        </FormField>

                        <FormField label="نام خانوادگی" required>
                            <Input
                                type="text"
                                placeholder="نام خانوادگی"
                                {...register("lastName")}
                            />
                            {errors.lastName && (
                                <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                            )}
                        </FormField>
                    </div>

                    <FormField label="کد ملی" required>
                        <Input
                            type="text"
                            placeholder="کد ملی 10 رقمی"
                            maxLength={10}
                            {...register("nationalCode")}
                        />
                        {errors.nationalCode && (
                            <p className="text-red-500 text-xs mt-1">{errors.nationalCode.message}</p>
                        )}
                    </FormField>

                    <FormField label="شماره موبایل" required>
                        <Input
                            type="tel"
                            placeholder="09123456789"
                            maxLength={11}
                            {...register("mobile")}
                        />
                        {errors.mobile && (
                            <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>
                        )}
                    </FormField>

                    <FormField label="ایمیل (اختیاری)">
                        <Input
                            type="email"
                            placeholder="example@email.com"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                        )}
                    </FormField>

                    <FormField label="تاریخ تولد (اختیاری)">
                        <Input
                            type="date"
                            {...register("birthDate")}
                        />
                        {errors.birthDate && (
                            <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>
                        )}
                    </FormField>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-medium text-blue-900 mb-2">مرحله بعد: احراز هویت</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• ضبط ویدیو با خواندن متن تأیید</li>
                            <li>• تأیید نهایی هویت</li>
                        </ul>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={!isValid}
                    >
                        ادامه به احراز هویت
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
