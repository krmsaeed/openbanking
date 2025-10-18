import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';

type ListVariant = 'unordered' | 'ordered' | 'description' | 'none';
type ListSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ListSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type ListColor =
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'muted';

interface BaseListProps {
    variant?: ListVariant;
    size?: ListSize;
    spacing?: ListSpacing;
    color?: ListColor;
    marker?: boolean;
    divided?: boolean;
    animated?: boolean;
    interactive?: boolean;
    rounded?: boolean;
    shadow?: boolean;
}

interface ListProps
    extends Omit<HTMLAttributes<HTMLUListElement | HTMLOListElement | HTMLDListElement>, 'color'>,
        BaseListProps {
    as?: 'ul' | 'ol' | 'dl';
}

const getListClasses = (
    variant: ListVariant,
    size: ListSize,
    spacing: ListSpacing,
    color: ListColor,
    marker: boolean,
    divided: boolean,
    animated: boolean,
    interactive: boolean,
    rounded: boolean,
    shadow: boolean
) => {
    const baseClasses = 'text-gray-900 dark:text-gray-100';

    const variantClasses = {
        unordered: marker ? 'list-disc' : 'list-none',
        ordered: marker ? 'list-decimal' : 'list-none',
        description: 'list-none',
        none: 'list-none',
    };

    const sizeClasses = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
    };

    const spacingClasses = {
        none: 'space-y-0',
        xs: 'space-y-0.5',
        sm: 'space-y-1',
        md: 'space-y-2',
        lg: 'space-y-3',
        xl: 'space-y-4',
    };

    const colorClasses = {
        default: 'text-gray-900 dark:text-gray-100',
        primary: 'text-primary-800 dark:text-primary-200',
        secondary: 'text-gray-600 dark:text-gray-400',
        success: 'text-green-800 dark:text-green-200',
        warning: 'text-yellow-800 dark:text-yellow-200',
        error: 'text-red-800 dark:text-red-200',
        info: 'text-cyan-800 dark:text-cyan-200',
        muted: 'text-gray-500 dark:text-gray-400',
    };

    const markerClasses = marker ? 'ml-4' : '';
    const dividedClasses = divided ? 'divide-y divide-gray-200 dark:divide-gray-700' : '';
    const animatedClasses = animated ? 'transition-all duration-200' : '';
    const interactiveClasses = interactive
        ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
        : '';
    const roundedClasses = rounded ? 'rounded-lg' : '';
    const shadowClasses = shadow ? 'shadow-sm' : '';

    return cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        spacingClasses[spacing],
        colorClasses[color],
        markerClasses,
        dividedClasses,
        animatedClasses,
        interactiveClasses,
        roundedClasses,
        shadowClasses
    );
};

export const List = forwardRef<HTMLUListElement | HTMLOListElement | HTMLDListElement, ListProps>(
    (
        {
            variant = 'unordered',
            size = 'md',
            spacing = 'sm',
            color = 'default',
            marker = true,
            divided = false,
            animated = false,
            interactive = false,
            rounded = false,
            shadow = false,
            as = 'ul',
            className,
            children,
            ...props
        },
        ref
    ) => {
        const classes = getListClasses(
            variant,
            size,
            spacing,
            color,
            marker,
            divided,
            animated,
            interactive,
            rounded,
            shadow
        );

        if (as === 'ol') {
            return (
                <ol
                    ref={ref as React.ForwardedRef<HTMLOListElement>}
                    className={cn(classes, className)}
                    {...(props as HTMLAttributes<HTMLOListElement>)}
                    role="list"
                    aria-label={props['aria-label']}
                >
                    {children}
                </ol>
            );
        }

        if (as === 'dl') {
            return (
                <dl
                    ref={ref as React.ForwardedRef<HTMLDListElement>}
                    className={cn(classes, className)}
                    {...(props as HTMLAttributes<HTMLDListElement>)}
                    role="list"
                    aria-label={props['aria-label']}
                >
                    {children}
                </dl>
            );
        }

        return (
            <ul
                ref={ref as React.ForwardedRef<HTMLUListElement>}
                className={cn(classes, className)}
                {...(props as HTMLAttributes<HTMLUListElement>)}
                role="list"
                aria-label={props['aria-label']}
            >
                {children}
            </ul>
        );
    }
);

List.displayName = 'List';

// Re-export ListItem from separate file
export { ListItem } from '../listItem';
