'use client';

import { Box, Typography } from '@/components/ui';
import { RadioGroup } from '@/components/ui/forms';
import {
    gradeOptions,
    maritalStatusOptions,
    type Branch,
    type City,
    type Province,
} from '@/hooks/useNationalCardForm';
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
                <label className="mb-2 block text-sm font-medium text-gray-700">وضعیت تاهل</label>
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
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                تحصیلات
                            </label>
                            <Select
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
                            {errors.branch?.message && (
                                <Typography variant="p" className="mt-2 text-sm text-red-600">
                                    {String(errors.branch.message)}
                                </Typography>
                            )}
                        </>
                    )}
                />
            </Box>

            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Box>
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
                                    onProvinceChange(numericValue);
                                }}
                                error={errors.provinceId?.message}
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
                        rules={{ required: 'شهر الزامی است' }}
                        render={({ field }) => (
                            <Select
                                label="شهر"
                                placeholder={
                                    cities.length > 0 ? 'انتخاب کنید' : 'ابتدا استان را انتخاب کنید'
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
                                {cities.map((city: City) => (
                                    <option key={city.id} value={city.id.toString()}>
                                        {city.name}
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
                            rows={3}
                            error={errors.address?.message}
                        />
                    )}
                />
            </Box>
        </Box>
    );
}
