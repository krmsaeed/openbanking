import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const selectVariants = cva(
    "flex h-10 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
                error: "border-red-500 focus:ring-red-500 focus:border-red-500",
                success: "border-green-500 focus:ring-green-500 focus:border-green-500",
            },
            size: {
                sm: "h-8 px-2 text-xs",
                md: "h-10 px-3 text-sm",
                lg: "h-12 px-4 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

export interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> { }

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, variant, size, children, ...props }, ref) => {
        return (
            <select
                className={cn(selectVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {children}
            </select>
        );
    }
);

Select.displayName = "Select";

export { Select, selectVariants };
