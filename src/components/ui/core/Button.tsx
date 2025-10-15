'use client';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type ButtonVariant =
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | 'success'
    | 'primary';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    as?: 'button' | 'link';
    href?: string;
    download?: boolean;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children?: React.ReactNode;
}

const getButtonClasses = (variant: ButtonVariant, size: ButtonSize) => {
    const baseClasses = `cursor-pointer hover:scale-105 disabled:transform disabled:transition-none disabled:cursor-not-allowed disabled:opacity-50 transform transition-all
     duration-100 ease-in-out shadow-md inline-flex
      items-center justify-center whitespace-nowrap
       rounded-xl text-sm font-medium focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-primary 
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95`;

    const variantClasses = {
        default: 'bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
        primary:
            'bg-primary text-white hover:bg-primary-700 dark:bg-primary-600 dark:hover:bg-primary-700',
        outline:
            'border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white',
        secondary:
            'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:text-white',
        link: 'text-primary underline-offset-4 hover:underline dark:text-primary-400',
        success:
            'bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800',
    };

    const sizeClasses = {
        default: 'h-10 px-4 py-2',
        xs: 'h-8 rounded-sm px-2',
        sm: 'h-9 rounded-lg px-3',
        md: 'h-10 rounded-md px-4',
        lg: 'h-12 rounded-xl px-8',
        xl: 'h-14 rounded-2xl px-10',
        icon: 'h-10 w-10',
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
};

const actionLabels = [
    'ادامه',
    'تایید',
    'ثبت',
    'ارسال',
    'صدور',
    'تأیید',
    'تایید و ارسال',
    'تأیید و ادامه',
];

const isActionLabel = (children: unknown) => {
    if (!children) return false;
    if (typeof children === 'string') {
        return actionLabels.includes(children.trim());
    }
    try {
        if (Array.isArray(children)) {
            const first = children[0];
            if (typeof first === 'string') {
                return actionLabels.includes(first.trim());
            }
            if (typeof first === 'object' && first !== null && 'props' in first) {
                const text = (first as { props?: { children?: unknown } }).props?.children;
                if (typeof text === 'string') return actionLabels.includes(text.trim());
            }
        } else if (typeof children === 'object' && children !== null && 'props' in children) {
            const text = (children as { props?: { children?: unknown } }).props?.children;
            if (typeof text === 'string') return actionLabels.includes(text.trim());
        }
    } catch {}
    return false;
};

const Spinner = ({ className }: { className?: string }) => (
    <svg
        className={`animate-spin ${className || ''}`}
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
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
            size = 'default',
            children,
            type,
            href,
            loading,
            ...props
        },
        ref
    ) => {
        let resolvedVariant: ButtonVariant = (variant as ButtonVariant) || 'default';
        if (!variant) {
            if (type === 'submit') resolvedVariant = 'primary';
            else if (isActionLabel(children)) resolvedVariant = 'primary';
        }

        const classNames = cn(getButtonClasses(resolvedVariant, size), className);

        if (as === 'link') {
            const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
            const { target, rel, download, role, onClick, ...rest } = anchorProps;
            const ariaLabel = anchorProps['aria-label'];
            return (
                <Link
                    href={href || '#'}
                    target={target}
                    rel={rel}
                    download={download}
                    role={role}
                    onClick={onClick}
                    aria-label={ariaLabel}
                    className={classNames}
                    {...(rest as unknown as Record<string, unknown>)}
                >
                    {children}
                </Link>
            );
        }
        return (
            <button type={type} className={classNames} ref={ref} {...props}>
                {loading && <Spinner className="mr-2" />}
                {children}
            </button>
        );
    }
);
Button.displayName = 'Button';

interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    className?: string;
    children?: React.ReactNode;
}

function LinkButton({ href, className, children, ...props }: LinkButtonProps) {
    const classNames = cn(getButtonClasses('default', 'default'), className);
    return (
        <Link href={href} className={classNames} {...props}>
            {children}
        </Link>
    );
}

export { Button, LinkButton };
