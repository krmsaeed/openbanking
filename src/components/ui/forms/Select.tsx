'use client';
import mergeClasses from '@/lib/utils';
import React, { CSSProperties, forwardRef } from 'react';
import { Box } from '../core';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    classes?: string;
    label?: string;
    color?: string;
    error?: string;
    fullWidth?: boolean;
    id?: string;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    placeholder?: string;
    required?: boolean;
    value?: string | number;
    endAdornment?: React.ReactNode;
    startAdornment?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>((props, ref) => {
    const {
        classes = '',
        color = '',
        defaultValue,
        disabled,
        endAdornment,
        error,
        fullWidth = false,
        id,
        label,
        name,
        onChange,
        placeholder,
        required,
        value,
        startAdornment,
        style,
        children,
        ...rest
    } = props;

    const selectStyle: CSSProperties = {
        paddingLeft: startAdornment ? '1rem' : '0.5rem',
        paddingRight: endAdornment ? '1rem' : '0.5rem',
        ...style,
    };

    return (
        <Box
            className={mergeClasses(
                'relative mb-2 flex flex-col items-start text-start',
                fullWidth ? 'w-full' : '',
                classes
            )}
        >
            {label && (
                <Box className="pl-1 text-right text-sm text-gray-900 dark:text-gray-50" dir="rtl">
                    {label}
                    {required && <span className="text-error mr-1">*</span>}
                </Box>
            )}
            <Box className="relative w-full">
                <select
                    ref={ref}
                    className={mergeClasses(
                        'text-gray w-full rounded-md bg-white p-3 px-8 shadow-md focus:border-none focus:outline-none',
                        props.className,
                        color
                    )}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    id={id}
                    name={name}
                    onChange={onChange}
                    style={selectStyle}
                    value={value}
                    {...rest}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {children}
                </select>
                {startAdornment && (
                    <Box className="absolute right-[1rem] bottom-1/2 translate-y-1/2 transform">
                        {startAdornment}
                    </Box>
                )}
                {endAdornment && (
                    <Box className="absolute bottom-1/2 left-[1rem] translate-y-1/2 transform">
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

Select.displayName = 'Select';

export { Select };
export default Select;
