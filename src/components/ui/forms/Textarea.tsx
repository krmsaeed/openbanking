import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
    "flex min-h-[80px] w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm transition-colors placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical",
    {
        variants: {
            variant: {
                default: "border-gray-300 focus:ring-blue-500 focus:border-blue-500",
                error: "border-red-500 focus:ring-red-500 focus:border-red-500",
                success: "border-green-500 focus:ring-green-500 focus:border-green-500",
            },
            size: {
                sm: "min-h-[60px] px-2 py-1 text-xs",
                md: "min-h-[80px] px-3 py-2 text-sm",
                lg: "min-h-[100px] px-4 py-3 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> { }

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <textarea
                className={cn(textareaVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
