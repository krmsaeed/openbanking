import React from 'react';
import { Box, Typography } from '../core';

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
                <input
                    {...(id ? { id } : {})}
                    disabled={disabled}
                    {...(inputProps || {})}
                    className={`border-light block w-full border-b bg-gray-800 px-4 py-3 focus:outline-none sm:text-sm ${disabled ? 'cursor-not-allowed bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} ${error ? 'border border-red-500' : 'border-b border-gray-300 dark:border-gray-600'} ${className}`}
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
