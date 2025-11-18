'use client';

import { Box, Typography } from '@/components/ui';
import { type Branch } from '@/hooks/useNationalCardForm';
import { type NationalCardInfoForm } from '@/lib/schemas/identity';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { Select } from '../ui/forms/Select';

interface PersonalInfoFormProps {
    control: Control<NationalCardInfoForm>;
    errors: FieldErrors<NationalCardInfoForm>;
}
export const gradeOptions = [
    { value: 'diploma', label: 'دیپلم' },
    { value: 'associate', label: 'کاردانی' },
    { value: 'BA', label: 'کارشناسی' },
    { value: 'MA', label: 'کارشناسی ارشد' },
    { value: 'PHD', label: 'دکترا' },
];

export function PersonalInfoForm({ control, errors }: PersonalInfoFormProps) {
    return (
        <Box className="space-y-4">
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
        </Box>
    );
}
