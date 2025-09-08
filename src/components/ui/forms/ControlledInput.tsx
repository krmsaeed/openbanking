"use client";

import { Controller, Control, FieldValues } from "react-hook-form";
import { Input } from "./Input";

interface ControlledInputProps<T extends FieldValues = FieldValues> {
    name: string;
    control: Control<T>;
    placeholder?: string;
    type?: string;
    className?: string;
}

export function ControlledInput({ name, control, placeholder, type = 'text', className }: ControlledInputProps) {
    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Input {...field} type={type} placeholder={placeholder} className={className} error={fieldState.error?.message} />
            )}
        />
    );
}

export default ControlledInput;
