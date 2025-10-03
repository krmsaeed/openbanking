"use client";

import { Box } from '@/components/ui';
import { Button } from '@/components/ui/core/Button';
import { Input, RadioGroup } from '@/components/ui/forms';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import LoadingButton from '../ui/core/LoadingButton';
import Autocomplete from '../ui/forms/autocomplete';
import NationalCardOcrScanner from '../ui/specialized/NationalCardOcrScanner';

type BranchOption = { label: string; value: string };

// Zod Schema
const formSchema = z.object({
    fatherName: z.string()
        .min(1, { message: 'نام پدر الزامی است' })
        .min(2, { message: 'نام پدر باید حداقل 2 کاراکتر باشد' })
        .max(50, { message: 'نام پدر نباید بیشتر از 50 کاراکتر باشد' }),
    gender: z.string()
        .min(1, { message: 'جنسیت الزامی است' })
        .refine((val) => ['male', 'female'].includes(val), {
            message: 'جنسیت نامعتبر است'
        }),
    isMarried: z.string()
        .min(1, { message: 'وضعیت تاهل الزامی است' })
        .refine((val) => ['true', 'false'].includes(val), {
            message: 'وضعیت تاهل نامعتبر است'
        }),
    grade: z.string()
        .min(1, { message: 'مدرک تحصیلی الزامی است' })
        .refine((val) => ['diploma', 'associate', 'BA', 'MA', 'PHD'].includes(val), {
            message: 'مدرک تحصیلی نامعتبر است'
        }),
    branch: z.string()
        .min(1, { message: 'انتخاب شعبه الزامی است' })
});

type FormData = z.infer<typeof formSchema>;

type Props = {
    branches?: BranchOption[];
    onComplete: (file: File, formData: FormData) => void;
    onBack?: () => void;
};

// Define outside the component (before the export)
const gradeOptions = [
    { value: 'diploma', label: 'دیپلم' },
    { value: 'associate', label: 'کاردانی' },
    { value: 'bachelor', label: 'کارشناسی' },
    { value: 'master', label: 'کارشناسی ارشد' },
    { value: 'phd', label: 'دکترا' },
];

export default function NationalCardScanner({ branches = [], onComplete, onBack }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [ocrValid, setOcrValid] = useState<boolean>(false);

    const defaultBranches: string[] = branches.length
        ? branches.map((b) => typeof b === 'string' ? b : b.label)
        : ['شعبه مرکزی', 'شعبه شهرک غرب', 'شعبه آزادی', 'شعبه میرداماد'];

    const genderOptions = [
        { label: 'مرد', value: 'male' },
        { label: 'زن', value: 'female' },
    ];

    const maritalStatusOptions = [
        { label: 'متاهل', value: 'true' },
        { label: 'مجرد', value: 'false' },
    ];

    const {
        control,
        setError,
        getValues,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fatherName: '',
            isMarried: '',
            gender: '',
            grade: '',
            branch: '',
        }
    });

    const handleConfirm = (file: File, isValid: boolean) => {
        if (!isValid) {
            toast.error('لطفا تصویر کارت ملی معتبر بارگذاری کنید');
            setOcrValid(false);
            return;
        }

        // Save the captured file
        setCapturedFile(file);
        setOcrValid(true);
        toast.success('تصویر کارت ملی با موفقیت دریافت شد');
    };

    const handleSubmit = async () => {
        if (!capturedFile) {
            toast.error('لطفا ابتدا کارت ملی خود را اسکن کنید');
            return;
        }
        const formData = getValues();
        const result = formSchema.safeParse(formData);

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors;

            if (errors.fatherName?.[0]) {
                setError('fatherName', { type: 'manual', message: errors.fatherName[0] });
                toast.error(errors.fatherName[0]);
                return;
            }
            if (errors.gender?.[0]) {
                setError('gender', { type: 'manual', message: errors.gender[0] });
                toast.error(errors.gender[0]);
                return;
            }
            if (errors.isMarried?.[0]) {
                setError('isMarried', { type: 'manual', message: errors.isMarried[0] });
                toast.error(errors.isMarried[0]);
                return;
            }
            if (errors.grade?.[0]) {
                setError('grade', { type: 'manual', message: errors.grade[0] });
                toast.error(errors.grade[0]);
                return;
            }
            if (errors.branch?.[0]) {
                setError('branch', { type: 'manual', message: errors.branch[0] });
                toast.error(errors.branch[0]);
                return;
            }

            toast.error('لطفا همه فیلدها را به درستی پر کنید');
            return;
        }
        setIsLoading(true);
        try {
            await onComplete(capturedFile, result.data);
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('خطا در ثبت اطلاعات. لطفا دوباره تلاش کنید');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box className="space-y-4">
            <NationalCardOcrScanner
                onConfirm={handleConfirm}
                autoOpen={true}
                showConfirmButton={true}
            />
            <Box className="space-y-4">
                <Controller
                    name="fatherName"
                    control={control}
                    rules={{ required: 'نام پدر الزامی است' }}
                    render={({ field }) => (
                        <Input
                            {...field}
                            variant="outline"
                            label="نام پدر"
                            placeholder="نام پدر را وارد کنید"
                            error={errors.fatherName?.message}
                            fullWidth
                        />
                    )}
                />

                <Box>
                    <label className="block text-sm text-gray-700 mb-2">جنسیت</label>
                    <Controller
                        name="gender"
                        control={control}
                        rules={{ required: 'جنسیت الزامی است' }}
                        render={({ field }) => (
                            <RadioGroup
                                {...field}
                                options={genderOptions}
                                name="gender"
                                direction="horizontal"
                                error={errors.gender?.message}
                            />
                        )}
                    />
                </Box>

                <Box>
                    <label className="block text-sm text-gray-700 mb-2">وضعیت تاهل</label>
                    <Controller
                        name="isMarried"
                        control={control}
                        rules={{ required: 'وضعیت تاهل الزامی است' }}
                        render={({ field }) => (
                            <RadioGroup
                                {...field}
                                options={maritalStatusOptions}
                                name="isMarried"
                                direction="horizontal"
                                error={errors.isMarried?.message}
                            />
                        )}
                    />
                </Box>

                <Box>
                    <Controller
                        name="grade"
                        control={control}
                        rules={{ required: 'مدرک تحصیلی الزامی است' }}
                        render={({ field }) => (
                            <>
                                <Autocomplete
                                    id="grade"
                                    label="مدرک تحصیلی"
                                    options={gradeOptions.map(opt => opt.label)}
                                    onSelect={(value) => {
                                        const selectedOption = gradeOptions.find(opt => opt.label === value);
                                        field.onChange(selectedOption?.value || '');
                                    }}
                                />
                                {errors.grade?.message && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {String(errors.grade.message)}
                                    </p>
                                )}
                            </>
                        )}
                    />
                </Box>

                <Box>
                    <Controller
                        name='branch'
                        control={control}
                        rules={{ required: 'لطفا یک شعبه انتخاب کنید' }}
                        render={({ field }) => (
                            <>
                                <Autocomplete
                                    id="branch"
                                    label="شعبه"
                                    options={defaultBranches}
                                    onSelect={(value) => field.onChange(value)}
                                />
                                {errors.branch?.message && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {String(errors.branch.message)}
                                    </p>
                                )}
                            </>
                        )}
                    />
                </Box>
            </Box>

            <Box className="w-full flex gap-2 items-center">
                <Button
                    onClick={onBack}
                    variant="destructive"
                    className="w-full flex justify-center gap-3 px-5 py-3 items-center text-white"
                >
                    <XMarkIcon className="w-5 h-5 text-white" />
                    بازگشت
                </Button>
                <LoadingButton
                    isLoading={isLoading}
                    onClick={handleSubmit}
                    disabled={!capturedFile || !ocrValid}
                    className="w-full flex justify-center gap-3 px-5 py-3 items-center text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckIcon className="h-5 w-5" />
                    ثبت نام
                </LoadingButton>
            </Box>
        </Box>
    );
}
