import mergeClasses from "@/lib/utils";
import React, { CSSProperties, forwardRef } from "react";
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
    error?: string;
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
            label,
            maxLength,
            name,
            onChange,
            placeholder,
            required,
            rows,
            startAdornment,
            type = "text",
            value,
            style,
            ...rest
        } = props;

        const inputStyle: CSSProperties = {
            paddingLeft: startAdornment ? "1rem" : "0.5rem",
            paddingRight: endAdornment ? "1rem" : "0.5rem",
            ...style,
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const target = e.currentTarget;
            if (maxLength && target.value.length >= maxLength) {
                target.value = target.value.slice(0, maxLength);
            }
            onChange?.(e);
        };

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            const target = e.currentTarget;
            setTimeout(() => {
                target.setSelectionRange(target.value.length, target.value.length);
            }, 0);
        };

        return (
            <Box
                className={mergeClasses(
                    "flex mb-2 relative flex-col text-start items-start",
                    fullWidth ? "w-full" : "",
                    classes,
                )}

                {...(() => {
                    const r: Record<string, unknown> = { ...(rest as Record<string, unknown>) };
                    if ('variant' in r) delete (r as unknown as Record<string, unknown>).variant;
                    return r as Record<string, unknown>;
                })()}
            >
                {label && (
                    <Box className="pl-1 text-sm text-gray-700 dark:text-gray-50 text-right " dir="rtl">
                        {label}
                        {required && <span className="mr-1 text-error">*</span>}
                    </Box>
                )}
                <Box className="w-full relative">
                    <InputComponent
                        ref={ref as React.Ref<HTMLInputElement>}
                        autoComplete={autoComplete}
                        autoFocus={autoFocus}
                        className={mergeClasses(
                            "w-full px-8 focus:border-none focus:outline-none  text-gray  shadow-md p-3 rounded-md",
                            props.className,
                            color,
                        )}
                        defaultValue={defaultValue}
                        disabled={disabled}
                        id={id}
                        maxLength={maxLength}
                        name={name}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        placeholder={placeholder}
                        rows={multiline ? rows : undefined}
                        style={inputStyle}
                        type={type}
                        value={value}
                        {...inputProps}
                    />
                    {startAdornment && (
                        <Box className="absolute right-[1rem] bottom-1/2 transform translate-y-1/2 ">
                            {startAdornment}
                        </Box>
                    )}
                    {endAdornment && (
                        <Box className="absolute left-[1rem] bottom-1/2 transform translate-y-1/2">{endAdornment}</Box>
                    )}
                </Box>
                {error && (
                    <Box className="flex items-center pl-1 text-sm text-error mt-1 w-full text-right" dir="rtl">
                        {error}
                    </Box>
                )}
            </Box>
        );
    },
);

CustomInput.displayName = "CustomInput";

export default CustomInput;