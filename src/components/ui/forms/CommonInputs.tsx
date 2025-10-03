'use client';
import { Control, Controller, FieldValues, FieldPath } from 'react-hook-form';
import Input from '../forms/Input';

interface NationalCodeInputProps<T extends FieldValues = FieldValues> {
    control: Control<T>;
    name?: FieldPath<T>;
    className?: string;
    placeholder?: string;
    label?: string;
}

interface PhoneNumberInputProps<T extends FieldValues = FieldValues> {
    control: Control<T>;
    name?: FieldPath<T>;
    className?: string;
    placeholder?: string;
    label?: string;
}
export const NationalCodeInput = <T extends FieldValues = FieldValues>({
    control,
    name = 'nationalCode' as FieldPath<T>,
    className = 'text-center',
    placeholder = 'کد ملی ۱۰ رقمی',
    label = 'کد ملی',
}: NationalCodeInputProps<T>) => {
    return (
        <Controller<T>
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Input
                    {...field}
                    label={label}
                    type="tel"
                    placeholder={placeholder}
                    className={className}
                    maxLength={10}
                    error={fieldState?.error?.message ?? ''}
                    inputMode="numeric"
                />
            )}
        />
    );
};

export const PhoneNumberInput = <T extends FieldValues = FieldValues>({
    control,
    name = 'phoneNumber' as FieldPath<T>,
    className = 'text-center',
    placeholder = '0912*******',
    label = 'شماره تلفن همراه',
}: PhoneNumberInputProps<T>) => {
    return (
        <Controller<T>
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Input
                    {...field}
                    label={label}
                    type="tel"
                    placeholder={placeholder}
                    className={className}
                    maxLength={11}
                    error={fieldState?.error?.message ?? ''}
                    inputMode="numeric"
                />
            )}
        />
    );
};

const CommonInputs = { NationalCodeInput, PhoneNumberInput };
export default CommonInputs;
