import mergeClasses from "@/lib/utils";
import React, { forwardRef, CSSProperties } from "react";
import { Box } from "../core";


export interface CustomInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    autoComplete?: string;
    autoFocus?: boolean;
    classes?: string;
    label?: string;
    color?: string;
    disableUnderline?: boolean;
    variant?: string;
    endAdornment?: React.ReactNode;
    error?: boolean;
    fullWidth?: boolean;
    id?: string;
    inputComponent?: React.ElementType;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    inputRef?: React.Ref<HTMLInputElement>;
    multiline?: boolean;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    startAdornment?: React.ReactNode;
    sx?: CSSProperties;
    type?: string;
    value?: string | number;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
    (props, ref) => {
        const {
            autoComplete,
            autoFocus,
            classes = "",
            color = "",
            defaultValue,
            disabled,
            endAdornment,
            error,
            fullWidth = false,
            id,
            inputComponent: InputComponent = "input",
            inputProps,
            multiline,
            name,
            onChange,
            placeholder,
            required,
            rows,
            startAdornment,
            sx,
            type = "text",
            value,
            style,
            ...rest
        } = props;

        // تنظیم padding براساس وجود adornment
        const inputStyle: CSSProperties = {
            paddingLeft: startAdornment ? "1rem" : "0.5rem",
            paddingRight: endAdornment ? "1rem" : "0.5rem",
            ...style,
        };

        return (
            <Box
                className={mergeClasses(
                    "flex items-center",
                    fullWidth ? "w-full" : "",
                    classes,
                )}
                style={sx}
                {...(() => {
                    const r: Record<string, unknown> = { ...(rest as Record<string, unknown>) };
                    if ('variant' in r) delete (r as unknown as Record<string, unknown>).variant;
                    return r as Record<string, unknown>;
                })()}
            >
                <InputComponent
                    ref={ref as React.Ref<HTMLInputElement>}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    className={mergeClasses(
                        "w-full px-8 focus:border-none focus:outline-none dark:bg-dark-900 dark:text-white",
                        props.className,
                        error ? "border-secondary focus:border-secondary" : "",
                        color,
                    )}
                    defaultValue={defaultValue}
                    disabled={disabled}
                    id={id}
                    name={name}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    rows={multiline ? rows : undefined}
                    style={inputStyle}
                    type={type}
                    value={value}
                    {...inputProps}
                />
                {startAdornment && (
                    <Box className="absolute right-1 top-0 flex items-center pl-1">
                        {startAdornment}
                    </Box>
                )}
                {endAdornment && (
                    <Box className="absolute left-[1rem] top-7 pr-2">{endAdornment}</Box>
                )}
            </Box>
        );
    },
);

CustomInput.displayName = "CustomInput";

export default CustomInput;