import React from 'react';
import { Box, Typography } from '../core';
import Input from './Input';

interface FormFieldProps {
    label: string;
    id?: string;
    error?: string | boolean;
    disabled?: boolean;
    className?: string;
    required?: boolean;
    description?: string;
    children?: React.ReactNode;
    /**
     * If you want FormField to render a native input (instead of providing children),
     * pass input attributes here.
     */
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    id,
    error,
    disabled = false,
    className = '',
    required = false,
    description,
    children,
    inputProps,
}) => {
    // Normalize inputProps value type for our Input component (string | number)
    const { value: rawValue, ...restInputProps } = (inputProps || {}) as {
        value?: string | number | readonly string[];
    } & React.InputHTMLAttributes<HTMLInputElement>;
    const normalizedValue = Array.isArray(rawValue)
        ? (rawValue as readonly string[]).join(', ')
        : rawValue;

    return (
        <Box className="w-full">
            <Typography
                variant="span"
                className="mb-1 block text-right text-[0.9rem] font-medium text-gray-700 dark:text-gray-300"
            >
                {label}
                {required && <span className="text-secondary mr-1">*</span>}
            </Typography>
            {description && (
                <Typography variant="span" className="text-secondary mb-2 block text-sm">
                    {description}
                </Typography>
            )}

            {children ? (
                children
            ) : (
                <Input
                    {...(id ? { id } : {})}
                    disabled={disabled}
                    {...(restInputProps as React.InputHTMLAttributes<HTMLInputElement>)}
                    value={normalizedValue as string | number | undefined}
                    className={className}
                />
            )}

            {typeof error === 'string' && error.length > 0 && (
                <Typography variant="span" className="text-error mt-1 block text-xs">
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default FormField;
