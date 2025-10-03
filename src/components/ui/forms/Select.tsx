"use client";
import mergeClasses from "@/lib/utils";
import React, { CSSProperties, forwardRef } from "react";
import { Box } from "../core";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    classes?: string;
    label?: string;
    color?: string;
    error?: string;
    fullWidth?: boolean;
    id?: string;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
    placeholder?: string;
    required?: boolean;
    value?: string | number;
    endAdornment?: React.ReactNode;
    startAdornment?: React.ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (props, ref) => {
        const {
            classes = "",
            color = "",
            defaultValue,
            disabled,
            endAdornment,
            error,
            fullWidth = false,
            id,
            label,
            name,
            onChange,
            placeholder,
            required,
            value,
            startAdornment,
            style,
            children,
            ...rest
        } = props;

        const selectStyle: CSSProperties = {
            paddingLeft: startAdornment ? "1rem" : "0.5rem",
            paddingRight: endAdornment ? "1rem" : "0.5rem",
            ...style,
        };

        return (
            <Box
                className={mergeClasses(
                    "flex mb-2 relative flex-col text-start items-start",
                    fullWidth ? "w-full" : "",
                    classes,
                )}
            >
                {label && (
                    <Box className="pl-1 text-sm text-gray-900 dark:text-gray-50 text-right " dir="rtl">
                        {label}
                        {required && <span className="mr-1 text-error">*</span>}
                    </Box>
                )}
                <Box className="w-full relative">
                    <select
                        ref={ref}
                        className={mergeClasses(
                            "w-full px-8 focus:border-none focus:outline-none bg-white text-gray shadow-md p-3 rounded-md",
                            props.className,
                            color,
                        )}
                        defaultValue={defaultValue}
                        disabled={disabled}
                        id={id}
                        name={name}
                        onChange={onChange}
                        style={selectStyle}
                        value={value}
                        {...rest}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {children}
                    </select>
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
    }
);

Select.displayName = "Select";

export { Select };
export default Select;
