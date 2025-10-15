import mergeClasses from '@/lib/utils';
import React, { CSSProperties, forwardRef } from 'react';
import { Box } from '../core';

export interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    autoComplete?: string;
    autoFocus?: boolean;
    classes?: string;
    label?: string;
    color?: string;
    disableUnderline?: boolean;
    variant?: string;
    endAdornment?: React.ReactNode;
    error?: string;
    fullWidth?: boolean;
    id?: string;
    inputComponent?: React.ElementType;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    inputRef?: React.Ref<HTMLInputElement>;
    multiline?: boolean;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    startAdornment?: React.ReactNode;
    type?: string;
    value?: string | number;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => {
    const {
        autoComplete,
        autoFocus,
        classes = '',
        color = '',
        defaultValue,
        disabled,
        endAdornment,
        error,
        fullWidth = false,
        id,
        inputComponent: InputComponent = 'input',
        inputProps,
        multiline,
        label,
        maxLength,
        name,
        onChange,
        placeholder,
        required,
        rows,
        startAdornment,
        type = 'text',
        value,
        style,
        ...rest
    } = props;

    const inputStyle: CSSProperties = {
        paddingLeft: startAdornment ? '1rem' : '0.5rem',
        paddingRight: endAdornment ? '1rem' : '0.5rem',
        ...style,
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        if (maxLength && target.value.length >= maxLength) {
            target.value = target.value.slice(0, maxLength);
        }
        onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        setTimeout(() => {
            target.setSelectionRange(target.value.length, target.value.length);
        }, 0);
    };

    return (
        <Box
            className={mergeClasses(
                'relative mb-2 flex flex-col items-start text-start',
                fullWidth ? 'w-full' : '',
                classes
            )}
            {...(() => {
                const r: Record<string, unknown> = { ...(rest as Record<string, unknown>) };
                if ('variant' in r) delete (r as unknown as Record<string, unknown>).variant;
                return r as Record<string, unknown>;
            })()}
        >
            {label && (
                <Box className="mb-1 pl-1 text-right text-sm text-gray-900" dir="rtl">
                    {label}
                    {required && <span className="text-error mr-1">*</span>}
                </Box>
            )}
            <Box className="relative w-full">
                <InputComponent
                    ref={ref as React.Ref<HTMLInputElement>}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    className={mergeClasses(
                        'w-full rounded-md bg-gray-50 p-3 px-8 text-gray-900 shadow-md focus:border-none focus:outline-none',
                        props.className,
                        color
                    )}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    id={id}
                    maxLength={maxLength}
                    name={name}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    rows={multiline ? rows : undefined}
                    style={inputStyle}
                    type={type}
                    value={value}
                    {...inputProps}
                />
                {startAdornment && (
                    <Box className="dark:text-secondary absolute right-[1rem] bottom-1/2 translate-y-1/2 transform">
                        {startAdornment}
                    </Box>
                )}
                {endAdornment && (
                    <Box className="dark:text-secondary absolute bottom-1/2 left-[1rem] translate-y-1/2 transform">
                        {endAdornment}
                    </Box>
                )}
            </Box>
            {error && (
                <Box
                    className="text-error mt-1 flex w-full items-center pl-1 text-right text-sm"
                    dir="rtl"
                >
                    {error}
                </Box>
            )}
        </Box>
    );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;
