import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";

interface FormFieldProps {
    children: React.ReactNode;
    label?: string;
    error?: string;
    required?: boolean;
    className?: string;
    description?: string;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
    ({ children, label, error, required, className, description }, ref) => {
        return (
            <div ref={ref} className={cn("space-y-2", className)}>
                {label && (
                    <Label
                        required={required}
                        variant={error ? "error" : "default"}
                    >
                        {label}
                    </Label>
                )}
                {children}
                {description && !error && (
                    <p className="text-xs text-gray-500">{description}</p>
                )}
            </div>
        );
    }
);

FormField.displayName = "FormField";

export { FormField };
