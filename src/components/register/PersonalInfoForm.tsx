'use client';

import { Box, Typography } from '@/components/ui';
import { RadioGroup } from '@/components/ui/forms';
import { type Branch, type City, type Province } from '@/hooks/useNationalCardForm';
import { type NationalCardInfoForm } from '@/lib/schemas/identity';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Select } from '../ui/forms/Select';
import Textarea from '../ui/forms/Textarea';

interface PersonalInfoFormProps {
    control: Control<NationalCardInfoForm>;
    errors: FieldErrors<NationalCardInfoForm>;
    provinces: Province[];
    cities: City[];
    onProvinceChange: (provinceId: number | null) => void;
}
export const gradeOptions = [
    { value: 'diploma', label: 'دیپلم' },
    { value: 'associate', label: 'کاردانی' },
    { value: 'BA', label: 'کارشناسی' },
    { value: 'MA', label: 'کارشناسی ارشد' },
    { value: 'PHD', label: 'دکترا' },
];

export const maritalStatusOptions = [
    { label: 'متاهل', value: true },
    { label: 'مجرد', value: false },
];

export function PersonalInfoForm({
    control,
    errors,
    provinces,
    cities,
    onProvinceChange,
}: PersonalInfoFormProps) {
    return (
        <Box className="space-y-4">
            <Box>
                <label className="mb-2 block text-sm">وضعیت تاهل</label>
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
                            <Select
                                required
                                label="مدرک تحصیلی"
                                placeholder="انتخاب کنید"
                                value={field.value ?? ''}
                                onChange={(e) =>
                                    field.onChange((e.target as HTMLSelectElement).value)
                                }
                            >
                                {gradeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
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
                                required
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
                                {[{ value: 102, label: 'تهران' }].map((branch: Branch) => (
                                    <option key={branch.value} value={branch.value}>
                                        {branch.label}
                                    </option>
                                ))}
                            </Select>
                        </>
                    )}
                />
            </Box>

            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Box>
                    <Controller
                        name="provinceId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                required
                                label="استان"
                                placeholder="انتخاب کنید"
                                value={field.value ? field.value.toString() : ''}
                                onChange={(e) => {
                                    const selectedValue = (e.target as HTMLSelectElement).value;
                                    const numericValue = selectedValue ? +selectedValue : null;
                                    field.onChange(numericValue);
                                    onProvinceChange(numericValue);
                                }}
                            >
                                {provinces.map((province: Province) => (
                                    <option key={province.id} value={province.id.toString()}>
                                        {province.name}
                                    </option>
                                ))}
                            </Select>
                        )}
                    />
                </Box>

                <Box>
                    <Controller
                        name="cityId"
                        control={control}
                        rules={{ required: 'انتخاب شهر الزامی است' }}
                        render={({ field }) => (
                            <Select
                                label="شهر"
                                required
                                placeholder={
                                    cities.length > 0 ? 'انتخاب کنید' : 'ابتدا استان را انتخاب کنید'
                                }
                                value={field.value ? field.value.toString() : ''}
                                onChange={(e) => {
                                    const selectedValue = (e.target as HTMLSelectElement).value;
                                    const numericValue = selectedValue ? +selectedValue : null;
                                    field.onChange(numericValue);
                                }}
                                disabled={cities.length === 0}
                            >
                                {cities.map((city: City) => (
                                    <option key={city.id} value={city.id.toString()}>
                                        {city.name}
                                    </option>
                                ))}
                            </Select>
                        )}
                    />
                </Box>
                {errors.cityId && (
                    <Typography variant="span" className="text-error-600 -mt-4 block text-sm">
                        {errors.cityId.message}
                    </Typography>
                )}
            </Box>

            <Box>
                <Controller
                    name="address"
                    control={control}
                    rules={{ required: 'آدرس الزامی است' }}
                    render={({ field }) => (
                        <Textarea
                            {...field}
                            required
                            label="آدرس"
                            placeholder="آدرس کامل خود را وارد کنید"
                            rows={3}
                            error={errors.address?.message}
                        />
                    )}
                />
            </Box>
        </Box>
    );
}
