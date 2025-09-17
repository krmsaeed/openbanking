import { ButtonHTMLAttributes, AnchorHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'primary';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    as?: 'button' | 'link';
    href?: string;
    download?: boolean;
    variant?: ButtonVariant;
    size?: ButtonSize;
}

const getButtonClasses = (variant: ButtonVariant, size: ButtonSize) => {
    const baseClasses = "cursor-pointer hover:scale-105 transform transition-all duration-100 ease-in-out shadow-md inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

    const variantClasses = {
        default: "bg-gray-500 text-white hover:bg-gray-600 ",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        primary: "bg-primary text-white hover:bg-primary-700",
        outline: "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100 hover:text-gray-900",
        link: "text-primary underline-offset-4 hover:underline",
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

const actionLabels = [
    'ادامه', 'تایید', 'ثبت', 'ارسال', 'صدور', 'تأیید', 'تایید و ارسال', 'تأیید و ادامه'
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
    } catch {
    }
    return false;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ as = 'button', className, variant, size = 'default', children, type, href, download, ...props }, ref) => {
        let resolvedVariant: ButtonVariant = variant as ButtonVariant || 'default';
        if (!variant) {
            if (type === 'submit') resolvedVariant = 'primary';
            else if (isActionLabel(children)) resolvedVariant = 'primary';
        }

        const classNames = cn(getButtonClasses(resolvedVariant, size), className);

        if (as === 'link') {
            return (
                <Link href={href || '#'}>
                    {children}
                </Link>
            );
        }

        return (
            <button
                type={type}
                className={classNames}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
