import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva(
    "text-sm font-medium transition-colors",
    {
        variants: {
            variant: {
                default: "text-gray-900",
                error: "text-red-600",
                disabled: "text-gray-400 cursor-not-allowed",
            },
            size: {
                sm: "text-xs",
                md: "text-sm",
                lg: "text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

export interface LabelProps
    extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
    required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
    ({ className, variant, size, required, children, ...props }, ref) => {
        return (
            <label
                className={cn(labelVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            >
                {children}
                {required && <span className="text-red-500 mr-1">*</span>}
            </label>
        );
    }
);

Label.displayName = "Label";

export { Label, labelVariants };
