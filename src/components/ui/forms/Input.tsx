import { InputHTMLAttributes, forwardRef } from 'react';
import { cn, convertPersianToEnglish } from '@/lib/utils';
import { Box } from '../core';

type InputVariant = 'default' | 'error' | 'success';
type InputSize = 'default' | 'sm' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    variant?: InputVariant;
    size?: InputSize;
    label?: string;
    error?: string;
    helper?: string;
    adornment?: React.ReactNode;
    required?: boolean;
}

const getInputClasses = (variant: InputVariant, size: InputSize) => {
    const baseClasses = "flex w-full rounded-xl shadow-sm bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    const variantClasses = {
        default: "border-gray-300 focus-visible:ring-blue-500",
        error: "border-red-500 focus-visible:ring-red-500",
        success: "border-green-500 focus-visible:ring-green-500",
    };

    const sizeClasses = {
        default: "h-10",
        xs: " h-6 text-xs",
        sm: "h-8 text-xs",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
        xl: "h-16 text-lg",
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant = 'default', size = 'default', label, error, helper, adornment, required, onChange, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const originalValue = e.target.value;
            const convertedValue = convertPersianToEnglish(originalValue);
            if (convertedValue !== originalValue) {
                const newEvent = {
                    ...e,
                    target: {
                        ...e.target,
                        value: convertedValue
                    },
                    currentTarget: {
                        ...e.currentTarget,
                        value: convertedValue
                    }
                } as React.ChangeEvent<HTMLInputElement>;

                onChange?.(newEvent);
            } else {
                onChange?.(e);
            }
        };

        return (
            <Box className="space-y-2">
                {label && (
                    <label className="text-sm font-medium text-gray-700 mb-2">
                        {label}
                        {required && <span className="text-red-500 mr-1">*</span>}
                    </label>
                )}
                <Box className="relative mt-2">
                    <input
                        className={cn(getInputClasses(variant, size), className, adornment)}
                        ref={ref}
                        onChange={handleChange}
                        {...props}
                    />
                    {adornment && (
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center text-gray-400">
                            {adornment}
                        </span>
                    )}
                </Box>
                {error && (
                    <p className="text-xs text-red-600">{error}</p>
                )}
                {helper && !error && (
                    <p className="text-xs text-gray-500">{helper}</p>
                )}
            </Box>
        )
    }
)
Input.displayName = "Input"
export { Input }
