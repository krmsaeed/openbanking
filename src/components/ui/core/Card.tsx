import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

type CardVariant = 'default' | 'elevated' | 'outline' | 'filled' | 'ghost';
type CardSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type CardColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

/**
 * Responsive padding utility for Card components
 *
 * Usage examples:
 * - Single value: padding="md" → "p-4"
 * - Responsive object: padding={{ base: "sm", md: "md", lg: "lg" }} → "p-3 md:p-4 lg:p-6"
 *
 * Breakpoints follow Tailwind CSS convention:
 * - base: default (no prefix)
 * - sm: @media (min-width: 640px)
 * - md: @media (min-width: 768px)
 * - lg: @media (min-width: 1024px)
 * - xl: @media (min-width: 1280px)
 */
type CardPadding =
    | 'none'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | {
          base?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
          sm?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
          md?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
          lg?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
          xl?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
      };

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: CardVariant;
    size?: CardSize;
    color?: CardColor;
    padding?: CardPadding;
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    animated?: boolean;
    interactive?: boolean;
    bordered?: boolean;
}

const getPaddingClasses = (padding: CardPadding): string => {
    if (typeof padding === 'string') {
        const paddingClasses = {
            none: 'p-0',
            xs: 'p-2',
            sm: 'p-3',
            md: 'p-4',
            lg: 'p-6',
            xl: 'p-8',
        };
        return paddingClasses[padding];
    }

    // Handle responsive padding object
    const classes: string[] = [];

    if (padding.base) {
        const paddingClasses = {
            none: 'p-0',
            xs: 'p-2',
            sm: 'p-3',
            md: 'p-4',
            lg: 'p-6',
            xl: 'p-8',
        };
        classes.push(paddingClasses[padding.base]);
    }

    if (padding.sm) {
        const paddingClasses = {
            none: 'sm:p-0',
            xs: 'sm:p-2',
            sm: 'sm:p-3',
            md: 'sm:p-4',
            lg: 'sm:p-6',
            xl: 'sm:p-8',
        };
        classes.push(paddingClasses[padding.sm]);
    }

    if (padding.md) {
        const paddingClasses = {
            none: 'md:p-0',
            xs: 'md:p-2',
            sm: 'md:p-3',
            md: 'md:p-4',
            lg: 'md:p-6',
            xl: 'md:p-8',
        };
        classes.push(paddingClasses[padding.md]);
    }

    if (padding.lg) {
        const paddingClasses = {
            none: 'lg:p-0',
            xs: 'lg:p-2',
            sm: 'lg:p-3',
            md: 'lg:p-4',
            lg: 'lg:p-6',
            xl: 'lg:p-8',
        };
        classes.push(paddingClasses[padding.lg]);
    }

    if (padding.xl) {
        const paddingClasses = {
            none: 'xl:p-0',
            xs: 'xl:p-2',
            sm: 'xl:p-3',
            md: 'xl:p-4',
            lg: 'xl:p-6',
            xl: 'xl:p-8',
        };
        classes.push(paddingClasses[padding.xl]);
    }

    return classes.join(' ');
};

const getCardClasses = (
    variant: CardVariant = 'default',
    size: CardSize = 'md',
    color: CardColor = 'default',
    padding: CardPadding = 'md',
    rounded: CardProps['rounded'] = 'md',
    shadow: CardProps['shadow'] = 'sm',
    animated: boolean = false,
    interactive: boolean = false,
    bordered: boolean = false
) => {
    const baseClasses = 'relative transition-all duration-200 ease-in-out ';

    const variantClasses = {
        default: 'bg-card text-card-foreground bg-gray-200',
        elevated: 'bg-card text-card-foreground shadow-lg',
        outline: 'border border-border bg-transparent text-card-foreground',
        filled: 'bg-primary text-primary-foreground',
        ghost: 'bg-transparent text-card-foreground hover:bg-accent hover:text-accent-foreground',
    };

    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
    };

    const colorClasses = {
        default: '',
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
    };

    const roundedClasses = {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
    };

    const shadowClasses = {
        none: 'shadow-none',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
        xl: 'shadow-xl',
    };

    const animationClasses = animated ? 'hover:scale-105 hover:shadow-lg' : '';
    const interactiveClasses = interactive
        ? 'cursor-pointer hover:bg-accent/50 active:scale-95'
        : '';
    const borderClasses = bordered ? 'border border-border' : '';

    return cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        color === 'default' ? '' : colorClasses[color],
        getPaddingClasses(padding),
        roundedClasses[rounded],
        shadowClasses[shadow],
        animationClasses,
        interactiveClasses,
        borderClasses
    );
};

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            className,
            variant = 'default',
            size = 'md',
            color = 'default',
            padding = 'md',
            rounded = 'md',
            shadow = 'sm',
            animated = false,
            interactive = false,
            bordered = false,
            ...props
        },
        ref
    ) => {
        return (
            <div
                className={cn(
                    getCardClasses(
                        variant,
                        size,
                        color,
                        padding,
                        rounded,
                        shadow,
                        animated,
                        interactive,
                        bordered
                    ),
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    padding?: CardPadding;
    align?: 'start' | 'center' | 'end';
    gap?: 'xs' | 'sm' | 'md' | 'lg';
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, padding = 'md', align = 'start', gap = 'sm', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'flex flex-col',
                    getPaddingClasses(padding),
                    align === 'start'
                        ? 'items-start'
                        : align === 'center'
                          ? 'items-center'
                          : 'items-end',
                    gap === 'xs'
                        ? 'gap-1'
                        : gap === 'sm'
                          ? 'gap-2'
                          : gap === 'md'
                            ? 'gap-3'
                            : 'gap-4',
                    className
                )}
                {...props}
            />
        );
    }
);
CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: 'default' | 'muted' | 'primary' | 'secondary';
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    (
        {
            className,
            size = 'lg',
            weight = 'bold',
            color = 'default',
            as: Component = 'h3',
            ...props
        },
        ref
    ) => {
        const sizeClasses = {
            xs: 'text-lg',
            sm: 'text-xl',
            md: 'text-2xl',
            lg: 'text-3xl',
            xl: 'text-4xl',
        };

        const weightClasses = {
            normal: 'font-normal',
            medium: 'font-medium',
            semibold: 'font-semibold',
            bold: 'font-bold',
        };

        const colorClasses = {
            default: 'text-foreground',
            muted: 'text-muted-foreground',
            primary: 'text-primary',
            secondary: 'text-secondary',
        };

        return (
            <Component
                ref={ref}
                className={cn(
                    'leading-none tracking-tight',
                    sizeClasses[size],
                    weightClasses[weight],
                    colorClasses[color],
                    className
                )}
                {...props}
            />
        );
    }
);
CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    color?: 'default' | 'muted' | 'secondary';
    weight?: 'normal' | 'medium';
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, size = 'sm', color = 'muted', weight = 'normal', ...props }, ref) => {
        const sizeClasses = {
            xs: 'text-xs',
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg',
        };

        const colorClasses = {
            default: 'text-foreground',
            muted: 'text-muted-foreground',
            secondary: 'text-secondary',
        };

        const weightClasses = {
            normal: 'font-normal',
            medium: 'font-medium',
        };

        return (
            <p
                ref={ref}
                className={cn(
                    sizeClasses[size],
                    colorClasses[color],
                    weightClasses[weight],
                    className
                )}
                {...props}
            />
        );
    }
);
CardDescription.displayName = 'CardDescription';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    padding?: CardPadding;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
    ({ className, padding = 'none', ...props }, ref) => {
        return <div ref={ref} className={cn(getPaddingClasses(padding), className)} {...props} />;
    }
);
CardContent.displayName = 'CardContent';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    padding?: CardPadding;
    align?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    direction?: 'row' | 'col';
    gap?: 'xs' | 'sm' | 'md' | 'lg';
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    (
        { className, padding = 'md', align = 'between', direction = 'row', gap = 'sm', ...props },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'flex items-center',
                    getPaddingClasses(padding),
                    align === 'start'
                        ? 'justify-start'
                        : align === 'center'
                          ? 'justify-center'
                          : align === 'end'
                            ? 'justify-end'
                            : align === 'between'
                              ? 'justify-between'
                              : align === 'around'
                                ? 'justify-around'
                                : 'justify-evenly',
                    direction === 'row' ? 'flex-row' : 'flex-col',
                    gap === 'xs'
                        ? 'gap-1'
                        : gap === 'sm'
                          ? 'gap-2'
                          : gap === 'md'
                            ? 'gap-3'
                            : 'gap-4',
                    className
                )}
                {...props}
            />
        );
    }
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };

export type {
    CardColor,
    CardContentProps,
    CardDescriptionProps,
    CardFooterProps,
    CardHeaderProps,
    CardPadding,
    CardProps,
    CardSize,
    CardTitleProps,
    CardVariant,
};
