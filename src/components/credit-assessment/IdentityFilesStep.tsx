"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IdentificationIcon, ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, FormField } from "@/components/ui";
import { SimpleFileUpload } from "@/components/ui/media/SimpleFileUpload";
import { identityFilesSchema, type IdentityFilesFormData } from "@/lib/schemas/creditAssessment";

interface IdentityFilesStepProps {
    onNext: (data: IdentityFilesFormData) => void;
    onPrevious: () => void;
    loading?: boolean;
}

export function IdentityFilesStep({ onNext, onPrevious, loading }: IdentityFilesStepProps) {
    const [nationalCardFront, setNationalCardFront] = useState<File[]>([]);
    const [nationalCardBack, setNationalCardBack] = useState<File[]>([]);
    const [birthCertificate, setBirthCertificate] = useState<File[]>([]);

    const {
        handleSubmit,
        setValue,
        trigger,
        formState: { errors }
    } = useForm<IdentityFilesFormData>({
        resolver: zodResolver(identityFilesSchema),
        mode: 'onChange'
    });

    const handleFileSelect = (fieldName: keyof IdentityFilesFormData, files: FileList | null) => {
        if (!files) return;
        const fileArray = Array.from(files);

        if (fieldName === 'nationalCardFront') {
            setNationalCardFront(fileArray);
        } else if (fieldName === 'nationalCardBack') {
            setNationalCardBack(fileArray);
        } else if (fieldName === 'birthCertificate') {
            setBirthCertificate(fileArray);
        }

        setValue(fieldName, fileArray);
        trigger(fieldName);
    };

    const handleRemoveFile = (fieldName: keyof IdentityFilesFormData) => {
        if (fieldName === 'nationalCardFront') {
            setNationalCardFront([]);
        } else if (fieldName === 'nationalCardBack') {
            setNationalCardBack([]);
        } else if (fieldName === 'birthCertificate') {
            setBirthCertificate([]);
        }
        setValue(fieldName, []);
        trigger(fieldName);
    };

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <IdentificationIcon className="w-6 h-6 text-blue-600" />
                    مدارک شناسایی
                </CardTitle>
                <CardDescription>
                    لطفاً تصاویر مدارک شناسایی خود را بارگذاری کنید
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onNext)} className="space-y-8">
                    <FormField
                        label="تصویر جلوی کارت ملی"
                        required
                        error={errors.nationalCardFront?.message}
                    >
                        <SimpleFileUpload
                            files={nationalCardFront}
                            onFileSelect={(files) => handleFileSelect('nationalCardFront', files)}
                            onRemoveFile={() => handleRemoveFile('nationalCardFront')}
                            label="تصویر جلوی کارت ملی را اینجا بکشید"
                        />
                    </FormField>

                    <FormField
                        label="تصویر پشت کارت ملی"
                        required
                        error={errors.nationalCardBack?.message}
                    >
                        <SimpleFileUpload
                            files={nationalCardBack}
                            onFileSelect={(files) => handleFileSelect('nationalCardBack', files)}
                            onRemoveFile={() => handleRemoveFile('nationalCardBack')}
                            label="تصویر پشت کارت ملی را اینجا بکشید"
                        />
                    </FormField>

                    <FormField
                        label="تصویر شناسنامه"
                        required
                        error={errors.birthCertificate?.message}
                    >
                        <SimpleFileUpload
                            files={birthCertificate}
                            onFileSelect={(files) => handleFileSelect('birthCertificate', files)}
                            onRemoveFile={() => handleRemoveFile('birthCertificate')}
                            label="تصویر شناسنامه را اینجا بکشید"
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
                            {loading ? 'در حال پردازش...' : 'مرحله بعد'}
                            <ArrowLeftIcon className="w-4 h-4" />
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
