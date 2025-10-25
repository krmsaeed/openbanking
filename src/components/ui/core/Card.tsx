import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { HTMLAttributes, forwardRef } from 'react';

const baseCardVariants = cva('relative transition-all duration-200 ease-in-out', {
    variants: {
        variant: {
            default: 'bg-card text-card-foreground bg-gray-100',
            elevated: 'bg-card text-card-foreground shadow-lg',
            outline: 'border border-border bg-transparent text-card-foreground',
            filled: 'bg-primary text-primary-foreground',
            ghost: 'bg-transparent text-card-foreground hover:bg-accent hover:text-accent-foreground',
        },
        size: {
            xs: 'text-xs',
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg',
            xl: 'text-xl',
        },
        color: {
            default: '',
            primary: 'bg-primary text-primary-foreground',
            secondary: 'bg-secondary text-secondary-foreground',
            success: 'bg-green-500 text-white',
            warning: 'bg-yellow-500 text-white',
            error: 'bg-red-500 text-white',
            info: 'bg-blue-500 text-white',
        },
        rounded: {
            none: 'rounded-none',
            sm: 'rounded-sm',
            md: 'rounded-md',
            lg: 'rounded-lg',
            xl: 'rounded-xl',
            full: 'rounded-full',
        },
        shadow: {
            none: 'shadow-none',
            sm: 'shadow-sm',
            md: 'shadow-md',
            lg: 'shadow-lg',
            xl: 'shadow-xl',
        },
        animated: {
            true: 'hover:scale-105 hover:shadow-lg',
            false: '',
        },
        interactive: {
            true: 'cursor-pointer hover:bg-accent/50 active:scale-95',
            false: '',
        },
        bordered: {
            true: 'border border-border',
            false: '',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'md',
        color: 'default',
        rounded: 'md',
        shadow: 'sm',
        animated: false,
        interactive: false,
        bordered: false,
    },
});

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

interface CardBaseProps
    extends Omit<HTMLAttributes<HTMLDivElement>, keyof VariantProps<typeof baseCardVariants>>,
        VariantProps<typeof baseCardVariants> {
    padding?: CardPadding;
}

const Card = forwardRef<HTMLDivElement, CardBaseProps>(
    (
        {
            className,
            variant,
            size,
            color,
            padding = 'md',
            rounded,
            shadow,
            animated,
            interactive,
            bordered,
            ...props
        },
        ref
    ) => {
        const variantProps = {
            variant,
            size,
            color,
            rounded,
            shadow,
            animated,
            interactive,
            bordered,
        } as const;

        return (
            <div
                className={cn(
                    baseCardVariants(variantProps),
                    getPaddingClasses(padding),
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Card.displayName = 'Card';

const headerVariants = cva('flex flex-col', {
    variants: {
        align: {
            start: 'items-start',
            center: 'items-center',
            end: 'items-end',
        },
        gap: {
            xs: 'gap-1',
            sm: 'gap-2',
            md: 'gap-3',
            lg: 'gap-4',
        },
    },
    defaultVariants: {
        align: 'start',
        gap: 'sm',
    },
});

interface CardHeaderProps
    extends Omit<HTMLAttributes<HTMLDivElement>, keyof VariantProps<typeof headerVariants>>,
        VariantProps<typeof headerVariants> {
    padding?: CardPadding;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, padding = 'md', align, gap, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    headerVariants({ align, gap }),
                    getPaddingClasses(padding),
                    className
                )}
                {...props}
            />
        );
    }
);
CardHeader.displayName = 'CardHeader';

const titleVariants = cva('leading-none tracking-tight', {
    variants: {
        size: {
            xs: 'text-lg',
            sm: 'text-xl',
            md: 'text-2xl',
            lg: 'text-3xl',
            xl: 'text-4xl',
        },
        weight: {
            normal: 'font-normal',
            medium: 'font-medium',
            semibold: 'font-semibold',
            bold: 'font-bold',
        },
        color: {
            default: 'text-foreground',
            muted: 'text-muted-foreground',
            primary: 'text-primary',
            secondary: 'text-secondary',
        },
    },
    defaultVariants: {
        size: 'lg',
        weight: 'bold',
        color: 'default',
    },
});

interface CardTitleProps
    extends Omit<HTMLAttributes<HTMLHeadingElement>, keyof VariantProps<typeof titleVariants>>,
        VariantProps<typeof titleVariants> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
    ({ className, size, weight, color, as: Component = 'h3', ...props }, ref) => {
        return (
            <Component
                ref={ref}
                className={cn(titleVariants({ size, weight, color }), className)}
                {...props}
            />
        );
    }
);
CardTitle.displayName = 'CardTitle';

const descriptionVariants = cva('', {
    variants: {
        size: {
            xs: 'text-xs',
            sm: 'text-sm',
            md: 'text-base',
            lg: 'text-lg',
        },
        color: {
            default: 'text-foreground',
            muted: 'text-muted-foreground',
            secondary: 'text-secondary',
        },
        weight: {
            normal: 'font-normal',
            medium: 'font-medium',
        },
    },
    defaultVariants: {
        size: 'sm',
        color: 'muted',
        weight: 'normal',
    },
});

interface CardDescriptionProps
    extends Omit<
            HTMLAttributes<HTMLParagraphElement>,
            keyof VariantProps<typeof descriptionVariants>
        >,
        VariantProps<typeof descriptionVariants> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
    ({ className, size, color, weight, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn(descriptionVariants({ size, color, weight }), className)}
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

const footerVariants = cva('flex items-center', {
    variants: {
        align: {
            start: 'justify-start',
            center: 'justify-center',
            end: 'justify-end',
            between: 'justify-between',
            around: 'justify-around',
            evenly: 'justify-evenly',
        },
        direction: {
            row: 'flex-row',
            col: 'flex-col',
        },
        gap: {
            xs: 'gap-1',
            sm: 'gap-2',
            md: 'gap-3',
            lg: 'gap-4',
        },
    },
    defaultVariants: {
        align: 'between',
        direction: 'row',
        gap: 'sm',
    },
});

interface CardFooterProps
    extends Omit<HTMLAttributes<HTMLDivElement>, keyof VariantProps<typeof footerVariants>>,
        VariantProps<typeof footerVariants> {
    padding?: CardPadding;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, padding = 'md', align, direction, gap, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    footerVariants({ align, direction, gap }),
                    getPaddingClasses(padding),
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
    CardBaseProps,
    CardContentProps,
    CardDescriptionProps,
    CardFooterProps,
    CardHeaderProps,
    CardPadding,
    CardTitleProps,
};
