"use client";

import { useForm, Controller, Control, FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BanknotesIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, FormField, Select } from "@/components/ui";
import ControlledInput from "@/components/ui/forms/ControlledInput";
import ControlledSelect from "@/components/ui/forms/ControlledSelect";
import { financialInfoSchema, type FinancialInfoFormData } from "@/lib/schemas/creditAssessment";

interface FinancialInfoStepProps {
    onNext: (data: FinancialInfoFormData) => void;
}

export function FinancialInfoStep({ onNext }: FinancialInfoStepProps) {
    const {
        control,
        handleSubmit,
        formState: { errors, isValid }
    } = useForm<FinancialInfoFormData>({
        resolver: zodResolver(financialInfoSchema),
        mode: 'onChange'
    });

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <BanknotesIcon className="w-6 h-6 text-blue-600" />
                    اطلاعات مالی
                </CardTitle>
                <CardDescription>
                    لطفاً اطلاعات درآمد و اشتغال خود را وارد کنید
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onNext)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="درآمد ماهانه (تومان)"
                            required
                            error={errors.monthlyIncome?.message}
                        >
                            <ControlledInput name="monthlyIncome" control={control as unknown as Control<FieldValues>} placeholder="مثال: 15000000" />
                        </FormField>

                        <FormField
                            label="سایر درآمدها (تومان)"
                            error={errors.otherIncome?.message}
                        >
                            <Controller
                                name="otherIncome"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Input
                                        {...field}
                                        placeholder="مثال: 5000000"
                                        error={!!fieldState.error}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField
                            label="مخارج ماهانه (تومان)"
                            error={errors.monthlyExpenses?.message}
                        >
                            <Controller
                                name="monthlyExpenses"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Input
                                        {...field}
                                        placeholder="مثال: 8000000"
                                        error={!!fieldState.error}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField
                            label="سابقه کاری (سال)"
                            required
                            error={errors.workExperience?.message}
                        >
                            <Controller
                                name="workExperience"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field}>
                                        <option value="">انتخاب کنید</option>
                                        <option value="0">کمتر از یک سال</option>
                                        <option value="1">۱ سال</option>
                                        <option value="2">۲ سال</option>
                                        <option value="3">۳ سال</option>
                                        <option value="5">۵ سال</option>
                                        <option value="10">بیشتر از ۱۰ سال</option>
                                    </Select>
                                )}
                            />
                        </FormField>

                        <FormField
                            label="عنوان شغلی"
                            error={errors.jobTitle?.message}
                        >
                            <Controller
                                name="jobTitle"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Input
                                        {...field}
                                        placeholder="مثال: مهندس نرم‌افزار"
                                        error={!!fieldState.error}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField
                            label="نام شرکت"
                            error={errors.companyName?.message}
                        >
                            <Controller
                                name="companyName"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Input
                                        {...field}
                                        placeholder="نام شرکت محل کار"
                                        error={!!fieldState.error}
                                    />
                                )}
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="آدرس محل کار"
                        error={errors.workAddress?.message}
                    >
                        <Controller
                            name="workAddress"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Input
                                    {...field}
                                    placeholder="آدرس کامل محل کار"
                                    error={!!fieldState.error}
                                />
                            )}
                        />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="مبلغ درخواستی (تومان)"
                            required
                            error={errors.requestedAmount?.message}
                        >
                            <Controller
                                name="requestedAmount"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <Input
                                        {...field}
                                        placeholder="مثال: 50000000"
                                        error={!!fieldState.error}
                                    />
                                )}
                            />
                        </FormField>

                        <FormField
                            label="هدف از دریافت وام"
                            error={errors.loanPurpose?.message}
                        >
                            <ControlledSelect name="loanPurpose" control={control as unknown as Control<FieldValues>}>
                                <option value="">انتخاب کنید</option>
                                <option value="home">خرید خانه</option>
                                <option value="car">خرید خودرو</option>
                                <option value="business">کسب‌وکار</option>
                                <option value="education">تحصیل</option>
                                <option value="medical">درمان</option>
                                <option value="other">سایر</option>
                            </ControlledSelect>
                        </FormField>
                    </div>

                    <Button
                        type="submit"
                        className="w-full flex items-center gap-2"
                        disabled={!isValid}
                    >
                        مرحله بعد
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
