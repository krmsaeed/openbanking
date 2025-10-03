'use client';

import { Box } from '@/components/ui';
import { Button } from '@/components/ui/core/Button';
import { RadioGroup } from '@/components/ui/forms';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import LoadingButton from '../ui/core/LoadingButton';
import Autocomplete from '../ui/forms/autocomplete';
import { Select } from '../ui/forms/Select';
import Textarea from '../ui/forms/Textarea';
import NationalCardOcrScanner from '../ui/specialized/NationalCardOcrScanner';

type BranchOption = { label: string; value: string };

// Zod Schema
const formSchema = z.object({
    isMarried: z
        .string()
        .min(1, { message: 'وضعیت تاهل الزامی است' })
        .refine((val) => ['true', 'false'].includes(val), {
            message: 'وضعیت تاهل نامعتبر است',
        }),
    grade: z
        .string()
        .min(1, { message: 'مدرک تحصیلی الزامی است' })
        .refine((val) => ['diploma', 'associate', 'BA', 'MA', 'PHD'].includes(val), {
            message: 'مدرک تحصیلی نامعتبر است',
        }),
    provinceId: z.string().min(1, { message: 'استان الزامی است' }),
    cityId: z.string().min(1, { message: 'شهر الزامی است' }),
    address: z.string().min(1, { message: 'آدرس الزامی است' }),
    branch: z.string().min(1, { message: 'انتخاب شعبه الزامی است' }),
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
    { value: 'BA', label: 'کارشناسی (BA)' },
    { value: 'MA', label: 'کارشناسی ارشد (MA)' },
    { value: 'PHD', label: 'دکترا' },
];
type Province = {
    id: number;
    name: string;
    cities?: City[];
};

type City = {
    id: number;
    name: string;
};
const defaultBranches = [
    { value: '0', label: 'شعبه مرکزی' },
    { value: '1', label: 'شعبه شهرک غرب' },
    { value: '2', label: 'شعبه آزادی' },
    { value: '3', label: 'شعبه میرداماد' },
];
const maritalStatusOptions = [
    { label: 'متاهل', value: 'true' },
    { label: 'مجرد', value: 'false' },
];
export default function NationalCardScanner({ onComplete, onBack }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [ocrValid, setOcrValid] = useState<boolean>(false);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    const getProvinceList = async () => {
        await axios
            .post('/api/bpms/send-message', {
                serviceName: 'province-cities',
            })
            .then((res) => {
                setProvinces(res.data.body.provinces);
            });
    };

    useEffect(() => {
        getProvinceList();
    }, []);
    const {
        control,
        setError,
        getValues,
        setValue,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isMarried: 'false',
            grade: '',
            provinceId: '',
            cityId: '',
            address: '',
            branch: '',
        },
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
            // Convert form data to match API shape
            const payload = {
                ...result.data,
                isMarried: result.data.isMarried === 'true',
                provinceId: parseInt(result.data.provinceId),
                cityId: parseInt(result.data.cityId),
            } as unknown as FormData & {
                isMarried: boolean;
                provinceId: number;
                cityId: number;
            };

            await onComplete(capturedFile, payload);
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
                <Box>
                    <label className="mb-2 block text-sm text-gray-700">وضعیت تاهل</label>
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
                                <label className="mb-2 block text-sm text-gray-700">تحصیلات</label>
                                <Select
                                    placeholder="انتخاب کنید"
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                        field.onChange((e.target as HTMLSelectElement).value)
                                    }
                                >
                                    {gradeOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </Select>
                                {errors.grade?.message && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {String(errors.grade.message)}
                                    </p>
                                )}
                            </>
                        )}
                    />
                </Box>

                <Box className="flex gap-4">
                    <Box className="flex-1">
                        <Controller
                            name="provinceId"
                            control={control}
                            rules={{ required: 'استان الزامی است' }}
                            render={({ field }) => (
                                <Select
                                    label="استان"
                                    placeholder="انتخاب کنید"
                                    value={field.value ?? ''}
                                    onChange={(e) => {
                                        const selectedValue = (e.target as HTMLSelectElement).value;
                                        field.onChange(selectedValue);

                                        // Find selected province and update cities
                                        const selectedProvince = provinces.find(
                                            (p: Province) => p.id.toString() === selectedValue
                                        );
                                        setCities(selectedProvince?.cities || []);

                                        // Reset city selection when province changes
                                        setValue('cityId', '');
                                    }}
                                    error={errors.provinceId?.message}
                                >
                                    {provinces.map((p: Province) => (
                                        <option key={p.id} value={p.id.toString()}>
                                            {p.name}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Box>

                    <Box className="flex-1">
                        <Controller
                            name="cityId"
                            control={control}
                            rules={{ required: 'شهر الزامی است' }}
                            render={({ field }) => (
                                <Select
                                    label="شهر"
                                    placeholder={
                                        cities.length > 0
                                            ? 'انتخاب کنید'
                                            : 'ابتدا استان را انتخاب کنید'
                                    }
                                    value={field.value ?? ''}
                                    onChange={(e) =>
                                        field.onChange((e.target as HTMLSelectElement).value)
                                    }
                                    error={errors.cityId?.message}
                                    disabled={cities.length === 0}
                                >
                                    {cities.map((c: City) => (
                                        <option key={c.id} value={c.id.toString()}>
                                            {c.name}
                                        </option>
                                    ))}
                                </Select>
                            )}
                        />
                    </Box>
                </Box>
                <Box>
                    <Controller
                        name="branch"
                        control={control}
                        rules={{ required: 'لطفا یک شعبه انتخاب کنید' }}
                        render={({ field }) => (
                            <>
                                <Autocomplete
                                    id="branch"
                                    label="شعبه"
                                    options={defaultBranches}
                                    onValueChange={(value) => field.onChange(value)}
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

                <Box>
                    <Controller
                        name="address"
                        control={control}
                        rules={{ required: 'آدرس الزامی است' }}
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                label="آدرس"
                                placeholder="آدرس کامل خود را وارد کنید"
                                rows={3}
                                error={errors.address?.message}
                            />
                        )}
                    />
                </Box>
            </Box>

            <Box className="flex w-full items-center gap-2">
                <Button
                    onClick={onBack}
                    variant="destructive"
                    className="flex w-full items-center justify-center gap-3 px-5 py-3 text-white"
                >
                    <XMarkIcon className="h-5 w-5 text-white" />
                    بازگشت
                </Button>
                <LoadingButton
                    isLoading={isLoading}
                    onClick={handleSubmit}
                    disabled={!capturedFile || !ocrValid}
                    className="bg-primary-600 hover:bg-primary-700 flex w-full items-center justify-center gap-3 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CheckIcon className="h-5 w-5" />
                    ثبت نام
                </LoadingButton>
            </Box>
        </Box>
    );
}
