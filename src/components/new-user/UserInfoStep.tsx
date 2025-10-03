'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Button,
    Input,
    FormField,
    Box,
    Typography,
} from '@/components/ui';
import { newUserSchema, type NewUserFormData } from '@/lib/schemas/newUser';

interface UserInfoStepProps {
    onNext: (data: NewUserFormData) => void;
}

export function UserInfoStep({ onNext }: UserInfoStepProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<NewUserFormData>({
        resolver: zodResolver(newUserSchema),
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            nationalCode: '',
            mobile: '',
            email: '',
            birthDate: '',
        },
    });

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="text-center">ایجاد حساب جدید</CardTitle>
                <CardDescription className="text-center">
                    اطلاعات پایه خود را وارد کنید
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit(onNext)} className="space-y-6">
                    <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="نام" required>
                            <Input
                                type="text"
                                placeholder="نام خود را وارد کنید"
                                {...register('firstName')}
                            />
                            {errors.firstName && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.firstName.message}
                                </p>
                            )}
                        </FormField>

                        <FormField label="نام خانوادگی" required>
                            <Input
                                type="text"
                                placeholder="نام خانوادگی"
                                {...register('lastName')}
                            />
                            {errors.lastName && (
                                <p className="mt-1 text-xs text-red-500">
                                    {errors.lastName.message}
                                </p>
                            )}
                        </FormField>
                    </Box>

                    <FormField label="کد ملی" required>
                        <Input
                            type="text"
                            placeholder="کد ملی 10 رقمی"
                            maxLength={10}
                            {...register('nationalCode')}
                        />
                        {errors.nationalCode && (
                            <p className="mt-1 text-xs text-red-500">
                                {errors.nationalCode.message}
                            </p>
                        )}
                    </FormField>

                    <FormField label="شماره موبایل" required>
                        <Input
                            type="tel"
                            placeholder="09123456789"
                            maxLength={11}
                            {...register('mobile')}
                        />
                        {errors.mobile && (
                            <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>
                        )}
                    </FormField>

                    <FormField label="ایمیل (اختیاری)">
                        <Input
                            type="email"
                            placeholder="example@email.com"
                            {...register('email')}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                        )}
                    </FormField>

                    <FormField label="تاریخ تولد (اختیاری)">
                        <Input type="date" {...register('birthDate')} />
                        {errors.birthDate && (
                            <p className="mt-1 text-xs text-red-500">{errors.birthDate.message}</p>
                        )}
                    </FormField>

                    <Box variant="info" radius="lg" border>
                        <Typography variant="h6" weight="medium" color="info">
                            مرحله بعد: احراز هویت
                        </Typography>
                        <Box className="space-y-1">
                            <Typography variant="body2" color="info">
                                • ضبط ویدیو با خواندن متن تأیید
                            </Typography>
                            <Typography variant="body2" color="info">
                                • تأیید نهایی هویت
                            </Typography>
                        </Box>
                    </Box>

                    <Button type="submit" size="lg" className="w-full" disabled={!isValid}>
                        ادامه به احراز هویت
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
