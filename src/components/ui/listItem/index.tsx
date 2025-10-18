import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes, ReactNode } from 'react';

type ListColor =
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'muted';

type ListSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ListItemProps extends HTMLAttributes<HTMLLIElement | HTMLDivElement> {
    variant?: ListColor;
    size?: ListSize;
    marker?: string | ReactNode;
    icon?: ReactNode;
    as?: 'li' | 'div' | 'dt' | 'dd';
    interactive?: boolean;
    disabled?: boolean;
    selected?: boolean;
}

const getListItemClasses = (
    variant: ListColor,
    size: ListSize,
    interactive: boolean,
    disabled: boolean,
    selected: boolean
) => {
    const baseClasses = 'transition-colors duration-200 flex items-center';

    const variantClasses = {
        default: 'text-gray-900 dark:text-gray-100',
        primary: 'text-primary-800 dark:text-primary-200',
        secondary: 'text-gray-600 dark:text-gray-400',
        success: 'text-green-800 dark:text-green-200',
        warning: 'text-yellow-800 dark:text-yellow-200',
        error: 'text-red-800 dark:text-red-200',
        info: 'text-cyan-800 dark:text-cyan-200',
        muted: 'text-gray-500 dark:text-gray-400',
    };

    const sizeClasses = {
        xs: 'text-xs py-0.5',
        sm: 'text-sm py-1',
        md: 'text-base py-1.5',
        lg: 'text-lg py-2',
        xl: 'text-xl py-2.5',
    };

    const interactiveClasses = interactive
        ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer'
        : '';
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    const selectedClasses = selected
        ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
        : '';

    return cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        interactiveClasses,
        disabledClasses,
        selectedClasses
    );
};

export const ListItem = forwardRef<HTMLLIElement | HTMLDivElement, ListItemProps>(
    (
        {
            variant = 'default',
            size = 'md',
            marker,
            icon,
            as = 'li',
            interactive = false,
            disabled = false,
            selected = false,
            className,
            children,
            ...props
        },
        ref
    ) => {
        const classes = getListItemClasses(variant, size, interactive, disabled, selected);

        if (as === 'div') {
            return (
                <div
                    ref={ref as React.ForwardedRef<HTMLDivElement>}
                    className={cn(classes, className)}
                    {...(props as HTMLAttributes<HTMLDivElement>)}
                >
                    {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
                    {marker && <span className="mr-2 font-medium">{marker}</span>}
                    <span className="flex-1">{children}</span>
                </div>
            );
        }

        if (as === 'dt') {
            return (
                <dt
                    ref={ref as React.ForwardedRef<HTMLElement>}
                    className={cn(classes, 'font-semibold', className)}
                    {...props}
                >
                    {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
                    {marker && <span className="mr-2 font-medium">{marker}</span>}
                    <span className="flex-1">{children}</span>
                </dt>
            );
        }

        if (as === 'dd') {
            return (
                <dd
                    ref={ref as React.ForwardedRef<HTMLElement>}
                    className={cn(classes, 'ml-4', className)}
                    {...props}
                >
                    {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
                    <span className="flex-1">{children}</span>
                </dd>
            );
        }

        return (
            <li
                ref={ref as React.ForwardedRef<HTMLLIElement>}
                className={cn(classes, className)}
                {...(props as HTMLAttributes<HTMLLIElement>)}
            >
                {icon && <span className="mr-2 flex-shrink-0">{icon}</span>}
                {marker && <span className="mr-2 font-medium">{marker}</span>}
                <span className="flex-1">{children}</span>
            </li>
        );
    }
);

ListItem.displayName = 'ListItem';
