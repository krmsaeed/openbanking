import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ListVariant = 'unordered' | 'ordered' | 'description';
type ListSize = 'sm' | 'md' | 'lg';
type ListSpacing = 'none' | 'sm' | 'md' | 'lg';

interface ListProps extends HTMLAttributes<HTMLUListElement | HTMLOListElement | HTMLDListElement> {
    variant?: ListVariant;
    size?: ListSize;
    spacing?: ListSpacing;
    marker?: boolean;
    divided?: boolean;
    as?: 'ul' | 'ol' | 'dl';
}

interface ListItemProps extends HTMLAttributes<HTMLLIElement | HTMLDivElement> {
    variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    size?: ListSize;
    marker?: string;
    as?: 'li' | 'div' | 'dt' | 'dd';
}

const getListClasses = (
    variant: ListVariant,
    size: ListSize,
    spacing: ListSpacing,
    marker: boolean,
    divided: boolean
) => {
    const baseClasses = "text-gray-900";

    const variantClasses = {
        unordered: marker ? "list-disc" : "list-none",
        ordered: marker ? "list-decimal" : "list-none",
        description: "list-none",
    };

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    const spacingClasses = {
        none: "space-y-0",
        sm: "space-y-1",
        md: "space-y-2",
        lg: "space-y-3",
    };

    const markerClasses = marker ? "mr-5" : "";
    const dividedClasses = divided ? "divide-y divide-gray-200" : "";

    return cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        spacingClasses[spacing],
        markerClasses,
        dividedClasses
    );
};

const getListItemClasses = (
    variant: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info',
    size: ListSize
) => {
    const baseClasses = "transition-colors duration-200";

    const variantClasses = {
        default: "text-gray-900",
        primary: "text-primary-800",
        secondary: "text-gray-600",
        success: "text-green-800",
        warning: "text-yellow-800",
        error: "text-red-800",
        info: "text-cyan-800",
    };

    const sizeClasses = {
        sm: "text-sm py-1",
        md: "text-base py-1.5",
        lg: "text-lg py-2",
    };

    return cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size]
    );
};

export const List = forwardRef<
    HTMLUListElement | HTMLOListElement | HTMLDListElement,
    ListProps
>(({
    variant = 'unordered',
    size = 'md',
    spacing = 'sm',
    marker = true,
    divided = false,
    as = 'ul',
    className,
    children,
    ...props
}, ref) => {
    const classes = getListClasses(variant, size, spacing, marker, divided);

    if (as === 'ol') {
        return (
            <ol
                ref={ref as React.ForwardedRef<HTMLOListElement>}
                className={cn(classes, className)}
                {...(props as HTMLAttributes<HTMLOListElement>)}
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
        >
            {children}
        </ul>
    );
});

List.displayName = 'List';

export const ListItem = forwardRef<
    HTMLLIElement | HTMLDivElement,
    ListItemProps
>(({
    variant = 'default',
    size = 'md',
    marker,
    as = 'li',
    className,
    children,
    ...props
}, ref) => {
    const classes = getListItemClasses(variant, size);

    if (as === 'div') {
        return (
            <div
                ref={ref as React.ForwardedRef<HTMLDivElement>}
                className={cn(classes, className)}
                {...(props as HTMLAttributes<HTMLDivElement>)}
            >
                {marker && <span className="font-medium ml-2">{marker}</span>}
                {children}
            </div>
        );
    }

    if (as === 'dt') {
        return (
            <dt
                ref={ref as React.ForwardedRef<HTMLElement>}
                className={cn(classes, "font-semibold", className)}
                {...props}
            >
                {marker && <span className="font-medium ml-2">{marker}</span>}
                {children}
            </dt>
        );
    }

    if (as === 'dd') {
        return (
            <dd
                ref={ref as React.ForwardedRef<HTMLElement>}
                className={cn(classes, "mr-4", className)}
                {...props}
            >
                {children}
            </dd>
        );
    }

    return (
        <li
            ref={ref as React.ForwardedRef<HTMLLIElement>}
            className={cn(classes, className)}
            {...(props as HTMLAttributes<HTMLLIElement>)}
        >
            {marker && <span className="font-medium ml-2">{marker}</span>}
            {children}
        </li>
    );
});

ListItem.displayName = 'ListItem';
