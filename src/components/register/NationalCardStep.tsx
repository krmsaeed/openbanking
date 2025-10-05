'use client';

import { Box, Typography } from '@/components/ui';
import { Button } from '@/components/ui/core/Button';
import { RadioGroup } from '@/components/ui/forms';
import { Modal } from '@/components/ui/overlay';
import { useUser } from '@/contexts/UserContext';
import { CheckIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import NationalCardOcrScanner from '../specialized/NationalCardOcrScanner';
import LoadingButton from '../ui/core/LoadingButton';
import { Select } from '../ui/forms/Select';
import Textarea from '../ui/forms/Textarea';

const formSchema = z.object({
    isMarried: z.boolean('وضعیت تاهل الزامی است').refine((val) => typeof val === 'boolean', {
        message: 'وضعیت تاهل نامعتبر است',
    }),
    grade: z
        .string()
        .min(1, { message: 'مدرک تحصیلی الزامی است' })
        .refine((val) => ['diploma', 'associate', 'BA', 'MA', 'PHD'].includes(val), {
            message: 'مدرک تحصیلی نامعتبر است',
        }),
    provinceId: z
        .number()
        .nullable()
        .refine((val) => val !== null, { message: 'استان الزامی است' }),
    cityId: z
        .number()
        .nullable()
        .refine((val) => val !== null, { message: 'شهر الزامی است' }),
    address: z.string().min(1, { message: 'آدرس الزامی است' }),
    branch: z
        .number()
        .nullable()
        .refine((val) => val !== null, { message: 'انتخاب شعبه الزامی است' }),
});

type FormData = z.infer<typeof formSchema>;

const gradeOptions = [
    { value: 'diploma', label: 'دیپلم' },
    { value: 'associate', label: 'کاردانی' },
    { value: 'BA', label: 'کارشناسی' },
    { value: 'MA', label: 'کارشناسی ارشد' },
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
const defaultBranches = [{ value: 102, label: 'تهران' }];
const maritalStatusOptions = [
    { label: 'متاهل', value: true },
    { label: 'مجرد', value: false },
];
export default function NationalCardScanner() {
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [ocrValid, setOcrValid] = useState<boolean>(false);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const formName = 'GovahResult';
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const getProvinceList = async () => {
        try {
            const res = await axios.post('/api/bpms/send-message', {
                serviceName: 'province-cities',
            });
            const provincesData = res?.data?.body?.provinces || res?.data?.data?.body?.provinces;
            setProvinces(provincesData || []);
        } catch (err) {
            console.warn('Failed to fetch provinces', err);
        }
    };

    useEffect(() => {
        getProvinceList();
    }, []);

    const {
        control,
        getValues,
        setValue,
        formState: { errors, isValid },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isMarried: false,
            grade: '',
            provinceId: null,
            cityId: null,
            address: '',
            branch: null,
        },
    });

    const handleConfirm = (file: File, isValid: boolean) => {
        if (!isValid) {
            toast.error('لطفا تصویر کارت ملی معتبر بارگذاری کنید');
            setOcrValid(false);
            return;
        }

        setCapturedFile(file);
        setOcrValid(true);
        toast.success('تصویر کارت ملی با موفقیت دریافت شد');
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        if (!capturedFile) {
            toast.error('لطفا ابتدا کارت ملی خود را اسکن کنید');
            return;
        }

        const fd = new FormData();
        const body = {
            serviceName: 'virtual-open-deposit',
            processId: userData.processId,
            formName,
            body: {
                isMarried: getValues('isMarried'),
                grade: getValues('grade'),
                provinceId: getValues('provinceId') || 0,
                cityId: getValues('cityId') || 0,
                branchId: getValues('branch') || 0,
            },
        };
        fd.append('messageDTO', JSON.stringify(body));
        fd.append('files', capturedFile);
        await axios
            .post('/api/bpms/deposit-files', fd)
            .then((res) => {
                const { data } = res;
                setUserData({
                    ...userData,
                    customerNumber: data.body.CustomerNumber,
                    accountNumber: data.body.depositNum,
                });
                setShowWelcomeModal(true);
            })
            .catch(() => {
                toast.error('خطا در ارسال اطلاعات');
            })
            .finally(() => setIsLoading(false));
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
                                    <Typography variant="p" className="mt-2 text-sm text-red-600">
                                        {String(errors.grade.message)}
                                    </Typography>
                                )}
                            </>
                        )}
                    />
                </Box>
                <Box>
                    <Controller
                        name="branch"
                        control={control}
                        rules={{ required: 'لطفا یک شعبه انتخاب کنید' }}
                        render={({ field }) => (
                            <>
                                <Select
                                    label="شعبه"
                                    placeholder="انتخاب کنید"
                                    value={field.value ? field.value.toString() : ''}
                                    onChange={(e) => {
                                        const selectedValue = (e.target as HTMLSelectElement).value;
                                        const numericValue = selectedValue ? +selectedValue : null;
                                        field.onChange(numericValue);
                                    }}
                                    error={errors.branch?.message}
                                >
                                    {defaultBranches.map((b) => (
                                        <option key={b.value} value={b.value}>
                                            {b.label}
                                        </option>
                                    ))}
                                </Select>
                                {errors.branch?.message && (
                                    <Typography variant="p" className="mt-2 text-sm text-red-600">
                                        {String(errors.branch.message)}
                                    </Typography>
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
                                    value={field.value ? field.value.toString() : ''}
                                    onChange={(e) => {
                                        const selectedValue = (e.target as HTMLSelectElement).value;
                                        const numericValue = selectedValue ? +selectedValue : null;
                                        field.onChange(numericValue);

                                        const selectedProvince = provinces.find(
                                            (p: Province) => p.id === +selectedValue
                                        );
                                        setCities(selectedProvince?.cities || []);

                                        setValue('cityId', null);
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
                                    value={field.value ? field.value.toString() : ''}
                                    onChange={(e) => {
                                        const selectedValue = (e.target as HTMLSelectElement).value;
                                        const numericValue = selectedValue ? +selectedValue : null;
                                        field.onChange(numericValue);
                                    }}
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
                        name="address"
                        control={control}
                        rules={{ required: 'آدرس الزامی است' }}
                        render={({ field }) => (
                            <Textarea
                                {...field}
                                label="آدرس"
                                placeholder="آدرس کامل خود را وارد کنید"
                                rows={1}
                                error={errors.address?.message}
                            />
                        )}
                    />
                </Box>
            </Box>

            <Box className="flex w-full items-center gap-2">
                {/* <Button
                    onClick={() => setUserData({ step: 5 })}
                    variant="destructive"
                    className="flex w-full items-center justify-center gap-3 px-5 py-3 text-white"
                >
                    <XMarkIcon className="h-5 w-5 text-white" />
                    بازگشت
                </Button> */}
                <LoadingButton
                    isLoading={isLoading}
                    onClick={handleSubmit}
                    disabled={!capturedFile || !ocrValid || !isValid || isLoading}
                    className="bg-primary-600 hover:bg-primary-700 flex w-full items-center justify-center gap-3 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {!isLoading && <CheckIcon className="h-5 w-5" />}
                    <Typography variant="body1" className="text-xs font-medium text-white">
                        {isLoading ? 'در حال ارسال...' : 'تایید'}
                    </Typography>
                </LoadingButton>
            </Box>

            <Modal
                isOpen={showWelcomeModal}
                onClose={() => {
                    setShowWelcomeModal(false);
                    setUserData({ ...userData, step: 7 });
                }}
                title="خوش آمدید!"
                size="lg"
            >
                <Box className="space-y-2 p-4 text-center">
                    <Box className="mx-auto flex h-24 w-24 items-center justify-center">
                        <Image
                            src="/icons/EnBankNewVerticalLogo_100x100 (1).png"
                            alt="بانک اقتصاد نوین"
                            width={96}
                            height={96}
                            className="object-contain"
                        />
                    </Box>

                    <Box className="space-y-2">
                        <Typography variant="h4" className="mb-2 text-lg leading-relaxed">
                            به خانواده بزرگ بانک اقتصاد نوین خوش آمدید
                        </Typography>
                        <Typography variant="p" className="text-md mb-2">
                            مشتری گرامی، با افتخار حضور ارزشمند شما را در بانک اقتصاد نوین خوشامد
                            می‌گوییم. از این پس، شما عضوی از خانواده‌ای هستید که هدف اصلی آن، ارائه
                            خدمات نوین، امن و شایسته به شماست.{' '}
                        </Typography>
                        <Box className="my-4 space-y-5">
                            <Typography variant="p" className="text-dark text-center font-bold">
                                شماره مشتری{' '}
                            </Typography>
                            <Typography variant="p">
                                <span className="border-primary rounded-lg border-3 border-dashed bg-gray-100 p-3 text-lg font-bold">
                                    {userData.customerNumber ?? ''}
                                </span>
                            </Typography>
                        </Box>
                        <Typography variant="p" className="text-dark font-bold">
                            شماره حساب
                        </Typography>
                        <Typography
                            variant="h5"
                            className="border-primary my-5 rounded-lg border-3 border-dashed bg-gray-100 p-3 font-bold"
                            dir="ltr"
                        >
                            {userData.accountNumber ?? ''}
                        </Typography>
                        <Typography
                            variant="p"
                            className="text-sm text-gray-500 dark:text-gray-400"
                        ></Typography>
                    </Box>
                    <Typography variant="p" className="my-5 text-lg font-bold">
                        ✨ بانک اقتصاد نوین؛ همسفر مطمئن شما در مسیر رشد و شکوفایی ✨
                    </Typography>

                    <Box className="flex justify-center">
                        <Button
                            onClick={() => {
                                setShowWelcomeModal(false);
                                setUserData({ ...userData, step: 7 });
                            }}
                            variant="primary"
                            size="lg"
                            className="min-w-[120px]"
                        >
                            ادامه
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
