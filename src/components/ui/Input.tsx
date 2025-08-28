import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type InputVariant = 'default' | 'error' | 'success';
type InputSize = 'default' | 'sm' | 'lg';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    variant?: InputVariant;
    size?: InputSize;
    label?: string;
    error?: string;
    helper?: string;
}

const getInputClasses = (variant: InputVariant, size: InputSize) => {
    const baseClasses = "flex w-full rounded-xl border bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    const variantClasses = {
        default: "border-gray-300 focus-visible:ring-blue-500",
        error: "border-red-500 focus-visible:ring-red-500",
        success: "border-green-500 focus-visible:ring-green-500",
    };

    const sizeClasses = {
        default: "h-10",
        sm: "h-8 text-xs",
        lg: "h-12 text-base",
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant = 'default', size = 'default', label, error, helper, ...props }, ref) => {
        return (
            <div className="space-y-2">
                {label && (
                    <label className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <input
                    className={cn(getInputClasses(variant, size), className)}
                    ref={ref}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-red-600">{error}</p>
                )}
                {helper && !error && (
                    <p className="text-xs text-gray-500">{helper}</p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
