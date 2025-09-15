import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type TableVariant = 'default' | 'bordered' | 'striped' | 'hover' | 'compact';
type TableSize = 'sm' | 'md' | 'lg';

interface TableProps extends HTMLAttributes<HTMLTableElement> {
    variant?: TableVariant;
    size?: TableSize;
    responsive?: boolean;
    stickyHeader?: boolean;
}

interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
    variant?: 'default' | 'dark' | 'light';
}

interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
    striped?: boolean;
}

interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
    variant?: 'default' | 'selected' | 'success' | 'warning' | 'error';
    interactive?: boolean;
}

interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
    align?: 'left' | 'center' | 'right';
    variant?: 'default' | 'header' | 'numeric' | 'action';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    as?: 'td' | 'th';
    sortable?: boolean;
    sortDirection?: 'asc' | 'desc' | null;
}

interface TableFooterProps extends HTMLAttributes<HTMLTableSectionElement> {
    summary?: boolean;
}

const getTableClasses = (
    variant: TableVariant,
    size: TableSize,
    responsive: boolean,
    stickyHeader: boolean
) => {
    const baseClasses = "w-full border-collapse bg-white text-gray-900";

    const variantClasses = {
        default: "border-gray-200",
        bordered: "border border-gray-300",
        striped: "border-gray-200",
        hover: "border-gray-200",
        compact: "border-gray-200",
    };

    const sizeClasses = {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
    };

    const responsiveClasses = responsive ? "table-auto" : "";
    const stickyClasses = stickyHeader ? "sticky-header" : "";

    return cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        responsiveClasses,
        stickyClasses
    );
};

const getTableHeaderClasses = (variant: 'default' | 'dark' | 'light') => {
    const baseClasses = "border-b";

    const variantClasses = {
        default: "bg-gray-50 border-gray-200",
        dark: "bg-gray-800 text-white border-gray-700",
        light: "bg-gray-100 border-gray-200",
    };

    return cn(baseClasses, variantClasses[variant]);
};

const getTableRowClasses = (
    variant: 'default' | 'selected' | 'success' | 'warning' | 'error',
    interactive: boolean
) => {
    const baseClasses = "border-b border-gray-100 transition-colors duration-200";

    const variantClasses = {
        default: "bg-white hover:bg-gray-50",
        selected: "bg-primary-50 border-primary-200 hover:bg-primary-100",
        success: "bg-green-50 border-green-200 hover:bg-green-100",
        warning: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
        error: "bg-red-50 border-red-200 hover:bg-red-100",
    };

    const interactiveClasses = interactive ? "cursor-pointer" : "";

    return cn(baseClasses, variantClasses[variant], interactiveClasses);
};

const getTableCellClasses = (
    align: 'left' | 'center' | 'right',
    variant: 'default' | 'header' | 'numeric' | 'action',
    weight: 'normal' | 'medium' | 'semibold' | 'bold',
    sortable: boolean
) => {
    const baseClasses = "py-3 px-4 transition-colors duration-200";

    const alignClasses = {
        left: "text-right", // RTL support
        center: "text-center",
        right: "text-left", // RTL support
    };

    const variantClasses = {
        default: "text-gray-900",
        header: "text-gray-700 font-medium",
        numeric: "font-mono text-gray-900",
        action: "text-center",
    };

    const weightClasses = {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold",
    };

    const sortableClasses = sortable ? "cursor-pointer hover:bg-gray-100 select-none" : "";

    return cn(
        baseClasses,
        alignClasses[align],
        variantClasses[variant],
        weightClasses[weight],
        sortableClasses
    );
};

export const Table = forwardRef<HTMLTableElement, TableProps>(
    ({
        variant = 'default',
        size = 'md',
        responsive = true,
        stickyHeader = false,
        className,
        children,
        ...props
    }, ref) => {
        const tableClasses = getTableClasses(variant, size, responsive, stickyHeader);

        const TableComponent = (
            <table
                ref={ref}
                className={cn(tableClasses, className)}
                {...props}
            >
                {children}
            </table>
        );

        if (responsive) {
            return (
                <div className="overflow-x-auto">
                    {TableComponent}
                </div>
            );
        }

        return TableComponent;
    }
);

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
    ({ variant = 'default', className, children, ...props }, ref) => {
        const classes = getTableHeaderClasses(variant);

        return (
            <thead
                ref={ref}
                className={cn(classes, className)}
                {...props}
            >
                {children}
            </thead>
        );
    }
);

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
    ({ striped = false, className, children, ...props }, ref) => {
        const stripedClasses = striped ? "divide-y divide-gray-100 [&>tr:nth-child(even)]:bg-gray-50" : "divide-y divide-gray-100";

        return (
            <tbody
                ref={ref}
                className={cn(stripedClasses, className)}
                {...props}
            >
                {children}
            </tbody>
        );
    }
);

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
    ({
        variant = 'default',
        interactive = false,
        className,
        children,
        ...props
    }, ref) => {
        const classes = getTableRowClasses(variant, interactive);

        return (
            <tr
                ref={ref}
                className={cn(classes, className)}
                {...props}
            >
                {children}
            </tr>
        );
    }
);

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
    ({
        align = 'right', // RTL default
        variant = 'default',
        weight = 'normal',
        as = 'td',
        sortable = false,
        sortDirection = null,
        className,
        children,
        ...props
    }, ref) => {
        const classes = getTableCellClasses(align, variant, weight, sortable);

        const content = (
            <>
                {sortable && (
                    <span className="inline-flex items-center gap-1">
                        {children}
                        <span className="flex flex-col">
                            <svg
                                className={cn(
                                    "w-3 h-3",
                                    sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'
                                )}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414 6.707 9.707a1 1 0 01-1.414 0z" />
                            </svg>
                            <svg
                                className={cn(
                                    "w-3 h-3 -mt-1",
                                    sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'
                                )}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" />
                            </svg>
                        </span>
                    </span>
                )}
                {!sortable && children}
            </>
        );

        if (as === 'th') {
            return (
                <th
                    ref={ref as React.ForwardedRef<HTMLTableCellElement>}
                    className={cn(classes, className)}
                    {...props}
                >
                    {content}
                </th>
            );
        }

        return (
            <td
                ref={ref}
                className={cn(classes, className)}
                {...props}
            >
                {content}
            </td>
        );
    }
);

export const TableFooter = forwardRef<HTMLTableSectionElement, TableFooterProps>(
    ({ summary = false, className, children, ...props }, ref) => {
        const summaryClasses = summary ? "bg-gray-100 border-t-2 border-gray-300 font-medium" : "bg-gray-50 border-t border-gray-200";

        return (
            <tfoot
                ref={ref}
                className={cn(summaryClasses, className)}
                {...props}
            >
                {children}
            </tfoot>
        );
    }
);

// Set display names
Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableRow.displayName = 'TableRow';
TableCell.displayName = 'TableCell';
TableFooter.displayName = 'TableFooter';
