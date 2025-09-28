import React from "react";
import { Box, Typography } from "../core";

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
    className = "",
    required = false,
    description,
    children,
    inputProps,
}) => {
    return (
        <Box className="w-full">
            <Typography
                variant="span"
                className="mb-1 block text-right text-[0.9rem] font-medium text-gray-700 dark:text-gray-lightest"
            >
                {label}
                {required && <span className="mr-1 text-secondary">*</span>}
            </Typography>
            {description && (
                <Typography variant="span" className="block text-sm text-secondary mb-2">
                    {description}
                </Typography>
            )}

            {/* If children are provided (common case), render them. This prevents
                accidentally passing children into a native <input> element which
                would trigger SSR/prerender errors. */}
            {children ? (
                children
            ) : (
                <input
                    {...(id ? { id } : {})}
                    disabled={disabled}
                    {...(inputProps || {})}
                    className={`block w-full border-b border-gray-light px-4 py-3 focus:border-primary focus:outline-none dark:border-gray-900 
           dark:bg-none sm:text-sm
          ${disabled ? "bg-b-gray-100 cursor-not-allowed" : "bg-white dark:bg-dark"}
          ${error ? "border-red-500 border" : "border-b border-gray-300"} 
          ${className}`}
                />
            )}

            {typeof error === 'string' && error.length > 0 && (
                <Typography variant="span" className=" block text-sm text-secondary">
                    {error}
                </Typography>
            )}
        </Box>
    );
};

export default FormField;