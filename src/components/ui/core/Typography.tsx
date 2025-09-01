import { HTMLAttributes, forwardRef, ElementType } from 'react';
import { cn } from '@/lib/utils';

type TypographyVariant =
    | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    | 'body1' | 'body2' | 'subtitle1' | 'subtitle2'
    | 'caption' | 'overline' | 'button';

type TypographyWeight = 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
type TypographyAlign = 'left' | 'center' | 'right' | 'justify';
type TypographyColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'muted' | 'disabled';

interface TypographyProps extends HTMLAttributes<HTMLElement> {
    variant?: TypographyVariant;
    weight?: TypographyWeight;
    align?: TypographyAlign;
    color?: TypographyColor;
    as?: ElementType;
    truncate?: boolean;
    noWrap?: boolean;
}

const getTypographyClasses = (
    variant: TypographyVariant,
    weight: TypographyWeight,
    align: TypographyAlign,
    color: TypographyColor,
    truncate: boolean,
    noWrap: boolean
) => {
    const baseClasses = "transition-colors duration-200";

    const variantClasses = {
        h1: "text-4xl md:text-5xl lg:text-6xl font-bold leading-tight",
        h2: "text-3xl md:text-4xl lg:text-5xl font-bold leading-tight",
        h3: "text-2xl md:text-3xl lg:text-4xl font-semibold leading-snug",
        h4: "text-xl md:text-2xl lg:text-3xl font-semibold leading-snug",
        h5: "text-lg md:text-xl lg:text-2xl font-medium leading-normal",
        h6: "text-base md:text-lg lg:text-xl font-medium leading-normal",
        body1: "text-base leading-relaxed",
        body2: "text-sm leading-relaxed",
        subtitle1: "text-lg font-medium leading-normal",
        subtitle2: "text-base font-medium leading-normal",
        caption: "text-xs leading-tight",
        overline: "text-xs uppercase tracking-wider font-medium leading-tight",
        button: "text-sm font-medium leading-none tracking-wide",
    };

    const weightClasses = {
        thin: "font-thin",
        light: "font-light",
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
        extrabold: "font-extrabold",
        black: "font-black",
    };

    const alignClasses = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
    };

    const colorClasses = {
        default: "text-gray-900",
        primary: "text-blue-600",
        secondary: "text-gray-600",
        success: "text-green-600",
        warning: "text-yellow-600",
        error: "text-red-600",
        info: "text-cyan-600",
        muted: "text-gray-500",
        disabled: "text-gray-400",
    };

    const utilityClasses = [
        truncate && "truncate",
        noWrap && "whitespace-nowrap",
    ].filter(Boolean);

    return cn(
        baseClasses,
        variantClasses[variant],
        weightClasses[weight],
        alignClasses[align],
        colorClasses[color],
        ...utilityClasses
    );
};

const getDefaultElement = (variant: TypographyVariant): ElementType => {
    const elementMap: Record<TypographyVariant, ElementType> = {
        h1: 'h1',
        h2: 'h2',
        h3: 'h3',
        h4: 'h4',
        h5: 'h5',
        h6: 'h6',
        body1: 'p',
        body2: 'p',
        subtitle1: 'h6',
        subtitle2: 'h6',
        caption: 'span',
        overline: 'span',
        button: 'span',
    };
    return elementMap[variant];
};

const Typography = forwardRef<HTMLElement, TypographyProps>(
    ({
        className,
        variant = 'body1',
        weight = 'normal',
        align = 'left',
        color = 'default',
        as,
        truncate = false,
        noWrap = false,
        children,
        ...props
    }, ref) => {
        const Component = as || getDefaultElement(variant);

        return (
            <Component
                ref={ref}
                className={cn(
                    getTypographyClasses(variant, weight, align, color, truncate, noWrap),
                    className
                )}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Typography.displayName = "Typography";

export { Typography };
export type {
    TypographyProps,
    TypographyVariant,
    TypographyWeight,
    TypographyAlign,
    TypographyColor
};
