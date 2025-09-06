import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type BoxVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
type BoxRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
type BoxShadow = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface BoxProps extends HTMLAttributes<HTMLDivElement> {
    variant?: BoxVariant;
    radius?: BoxRadius;
    shadow?: BoxShadow;
    border?: boolean;
    as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';
}

const getBoxClasses = (
    variant: BoxVariant,
    radius: BoxRadius,
    shadow: BoxShadow,
    border: boolean
) => {
    const baseClasses = "transition-all duration-200";

    const variantClasses = {
        default: "bg-transparent text-gray-900",
        primary: "bg-blue-50 text-blue-900 border-blue-200",
        secondary: "bg-gray-50 text-gray-900 border-gray-200",
        success: "bg-green-50 text-green-900 border-green-200",
        warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
        error: "bg-red-50 text-red-900 border-red-200",
        info: "bg-cyan-50 text-cyan-900 border-cyan-200",
    };


    const radiusClasses = {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
    };

    const shadowClasses = {
        none: "",
        sm: "shadow-sm",
        md: "shadow-md",
        lg: "shadow-lg",
        xl: "shadow-xl",
    };

    const borderClass = border ? "border" : "";

    return cn(
        baseClasses,
        variantClasses[variant],
        radiusClasses[radius],
        shadowClasses[shadow],
        borderClass
    );
};

const Box = forwardRef<HTMLDivElement, BoxProps>(
    ({
        className,
        variant = 'default',
        radius = 'md',
        shadow = 'none',
        border = false,
        as: Component = 'div',
        children,
        ...props
    }, ref) => {
        return (
            <Component
                ref={ref}
                className={cn(getBoxClasses(variant, radius, shadow, border), className)}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Box.displayName = "Box";

export { Box };
export type { BoxProps, BoxVariant, BoxRadius, BoxShadow };
