'use client';

import { Controller, Control, FieldValues } from 'react-hook-form';
import { Select } from './Select';

interface ControlledSelectProps<T extends FieldValues = FieldValues> {
    name: string;
    control: Control<T>;
    children: React.ReactNode;
    className?: string;
}

export function ControlledSelect({ name, control, children, className }: ControlledSelectProps) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <>
                    <Select {...field} className={className}>
                        {children}
                    </Select>
                    {fieldState.error && (
                        <p className="mt-1 text-xs text-red-500">
                            {String(fieldState.error.message)}
                        </p>
                    )}
                </>
            )}
        />
    );
}

export default ControlledSelect;
