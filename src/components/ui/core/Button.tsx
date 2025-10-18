import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline:
                    'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                success:
                    'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800',
                primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                warning:
                    'bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800',
                info: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800',
            },
            size: {
                xs: 'h-7 rounded-sm px-2 text-xs',
                sm: 'h-9 rounded-md px-3 text-sm',
                default: 'h-10 px-4 py-2',
                md: 'h-11 rounded-md px-6 text-base',
                lg: 'h-12 rounded-lg px-8 text-lg',
                xl: 'h-14 rounded-xl px-10 text-xl',
                icon: 'h-10 w-10',
            },
            rounded: {
                none: 'rounded-none',
                sm: 'rounded-sm',
                md: 'rounded-md',
                lg: 'rounded-lg',
                xl: 'rounded-xl',
                full: 'rounded-full',
            },
            animated: {
                true: 'transform transition-all duration-200 ease-in-out hover:scale-105 active:scale-95',
                false: '',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
            rounded: 'md',
            animated: true,
        },
    }
);

interface ButtonProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
        VariantProps<typeof buttonVariants> {
    as?: 'button' | 'link';
    href?: string;
    download?: string | boolean;
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
}

interface LinkButtonProps
    extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'color'>,
        VariantProps<typeof buttonVariants> {
    href: string;
    loading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    children?: React.ReactNode;
}

const Spinner = ({ className }: { className?: string }) => (
    <svg
        className={cn('animate-spin', className)}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
    >
        <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
        />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            as = 'button',
            className,
            variant,
            size,
            rounded,
            animated,
            children,
            type = 'button',
            href,
            loading,
            fullWidth,
            leftIcon,
            rightIcon,
            disabled,
            ...props
        },
        ref
    ) => {
        const resolvedVariant = variant || 'default';
        const isDisabled = disabled || loading;

        const buttonClasses = buttonVariants({
            variant: resolvedVariant,
            size,
            rounded,
            animated,
            className,
        });

        const finalClasses = cn(buttonClasses, {
            'w-full': fullWidth,
            'cursor-not-allowed opacity-50': isDisabled,
        });

        const content = (
            <>
                {loading && <Spinner className="mr-2" />}
                {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </>
        );

        if (as === 'link' && href) {
            return (
                <Link
                    href={href}
                    className={finalClasses}
                    aria-disabled={isDisabled}
                    {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
                >
                    {content}
                </Link>
            );
        }

        return (
            <button
                type={type}
                className={finalClasses}
                ref={ref}
                disabled={isDisabled}
                aria-busy={loading}
                {...props}
            >
                {content}
            </button>
        );
    }
);
Button.displayName = 'Button';

function LinkButton({
    href,
    className,
    variant,
    size,
    rounded,
    animated,
    children,
    loading,
    fullWidth,
    leftIcon,
    rightIcon,
    ...props
}: LinkButtonProps) {
    const isDisabled = loading;

    const buttonClasses = buttonVariants({
        variant: variant || 'default',
        size,
        rounded,
        animated,
        className,
    });

    const finalClasses = cn(buttonClasses, {
        'w-full': fullWidth,
        'cursor-not-allowed opacity-50': isDisabled,
    });

    const content = (
        <>
            {loading && <Spinner className="mr-2" />}
            {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
    );

    return (
        <Link href={href} className={finalClasses} aria-disabled={isDisabled} {...props}>
            {content}
        </Link>
    );
}

export { Button, LinkButton };
export type { ButtonProps, LinkButtonProps };
