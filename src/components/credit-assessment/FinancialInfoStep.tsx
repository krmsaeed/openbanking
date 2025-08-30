"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BanknotesIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, FormField, Select } from "@/components/ui";
import { financialInfoSchema, type FinancialInfoFormData } from "@/lib/schemas/creditAssessment";

interface FinancialInfoStepProps {
    onNext: (data: FinancialInfoFormData) => void;
}

export function FinancialInfoStep({ onNext }: FinancialInfoStepProps) {
    const {
        register,
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
                            <Input
                                {...register("monthlyIncome")}
                                placeholder="مثال: 15000000"
                            />
                        </FormField>

                        <FormField
                            label="سایر درآمدها (تومان)"
                            error={errors.otherIncome?.message}
                        >
                            <Input
                                {...register("otherIncome")}
                                placeholder="مثال: 5000000"
                            />
                        </FormField>

                        <FormField
                            label="مخارج ماهانه (تومان)"
                            error={errors.monthlyExpenses?.message}
                        >
                            <Input
                                {...register("monthlyExpenses")}
                                placeholder="مثال: 8000000"
                            />
                        </FormField>

                        <FormField
                            label="سابقه کاری (سال)"
                            required
                            error={errors.workExperience?.message}
                        >
                            <Select {...register("workExperience")}>
                                <option value="">انتخاب کنید</option>
                                <option value="0">کمتر از یک سال</option>
                                <option value="1">۱ سال</option>
                                <option value="2">۲ سال</option>
                                <option value="3">۳ سال</option>
                                <option value="5">۵ سال</option>
                                <option value="10">بیشتر از ۱۰ سال</option>
                            </Select>
                        </FormField>

                        <FormField
                            label="عنوان شغلی"
                            error={errors.jobTitle?.message}
                        >
                            <Input
                                {...register("jobTitle")}
                                placeholder="مثال: مهندس نرم‌افزار"
                            />
                        </FormField>

                        <FormField
                            label="نام شرکت"
                            error={errors.companyName?.message}
                        >
                            <Input
                                {...register("companyName")}
                                placeholder="نام شرکت محل کار"
                            />
                        </FormField>
                    </div>

                    <FormField
                        label="آدرس محل کار"
                        error={errors.workAddress?.message}
                    >
                        <Input
                            {...register("workAddress")}
                            placeholder="آدرس کامل محل کار"
                        />
                    </FormField>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            label="مبلغ درخواستی (تومان)"
                            required
                            error={errors.requestedAmount?.message}
                        >
                            <Input
                                {...register("requestedAmount")}
                                placeholder="مثال: 50000000"
                            />
                        </FormField>

                        <FormField
                            label="هدف از دریافت وام"
                            error={errors.loanPurpose?.message}
                        >
                            <Select {...register("loanPurpose")}>
                                <option value="">انتخاب کنید</option>
                                <option value="home">خرید خانه</option>
                                <option value="car">خرید خودرو</option>
                                <option value="business">کسب‌وکار</option>
                                <option value="education">تحصیل</option>
                                <option value="medical">درمان</option>
                                <option value="other">سایر</option>
                            </Select>
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
