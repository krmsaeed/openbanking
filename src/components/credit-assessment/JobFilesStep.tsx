"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseIcon, ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, FormField } from "@/components/ui";
import { SimpleFileUpload } from "@/components/ui/media/SimpleFileUpload";
import { jobFilesSchema, type JobFilesFormData } from "@/lib/schemas/creditAssessment";

interface JobFilesStepProps {
    onNext: () => void;
    onPrevious: () => void;
    loading?: boolean;
}

export function JobFilesStep({ onNext, onPrevious, loading }: JobFilesStepProps) {
    const [salarySlips, setSalarySlips] = useState<File[]>([]);

    const {
        control,
        handleSubmit,
        setValue,
        trigger,
        formState: { errors }
    } = useForm<JobFilesFormData>({
        resolver: zodResolver(jobFilesSchema),
        mode: 'onChange'
    });

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;
        const fileArray = Array.from(files);
        setSalarySlips(fileArray);
        setValue('salarySlips', fileArray);
        trigger('salarySlips');
    };

    const handleRemoveFile = () => {
        setSalarySlips([]);
        setValue('salarySlips', []);
        trigger('salarySlips');
    };

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                    مدارک شغلی
                </CardTitle>
                <CardDescription>
                    لطفاً مدارک مربوط به شغل خود را بارگذاری کنید
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onNext)} className="space-y-8">
                    <FormField
                        label="فیش‌های حقوقی"
                        required
                        description="حداقل یک فیش حقوقی"
                        error={errors.salarySlips?.message}
                    >
                        <Controller
                            name="salarySlips"
                            control={control}
                            render={({ fieldState }) => (
                                <>
                                    <SimpleFileUpload
                                        files={salarySlips}
                                        onFileSelect={handleFileSelect}
                                        onRemoveFile={handleRemoveFile}
                                        label="فیش‌های حقوقی را اینجا بکشید"
                                        multiple
                                    />
                                    {fieldState.error && (
                                        <p className="text-xs text-red-500 mt-1">{String(fieldState.error.message)}</p>
                                    )}
                                </>
                            )}
                        />
                    </FormField>

                    <div className="flex justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onPrevious}
                            className="flex items-center gap-2"
                        >
                            <ArrowRightIcon className="w-4 h-4" />
                            مرحله قبل
                        </Button>
                        <Button
                            type="submit"
                            className="flex items-center gap-2"
                            disabled={loading}
                        >
                            {loading ? 'در حال پردازش...' : 'تأیید نهایی'}
                            <CheckCircleIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
