import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    as?: React.ElementType;
}

const getButtonClasses = (variant: ButtonVariant, size: ButtonSize, as?: React.ElementType) => {
    const baseClasses = "cursor-pointer hover:scale-105 transform transition-all duration-100 ease-in-out shadow-md inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

    const variantClasses = {
        default: "bg-gray-500 text-white hover:bg-gray-600 ",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        primary: "bg-purple-600 text-white hover:bg-purple-700",
        outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-blue-600 underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700",
    };

    const sizeClasses = {
        default: "h-10 px-4 py-2",
        xs: "h-8 rounded-sm px-2",
        sm: "h-9 rounded-lg px-3",
        md: "h-10 rounded-md px-4",
        lg: "h-12 rounded-xl px-8",
        xl: "h-14 rounded-2xl px-10",
        icon: "h-10 w-10",
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', as, ...props }, ref) => {
        return (
            <button
                className={cn(getButtonClasses(variant, size, as), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
