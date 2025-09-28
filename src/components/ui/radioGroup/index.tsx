"use client";
import React from "react";
import clsx from "clsx";
import { Box, Typography } from "../core";


type Variant = "default" | "outline" | "solid" | "ghost";
type Size = "sm" | "md" | "lg";

interface StyleConfig {
    [key: string]: {
        base: string;
        selected: string;
        unselected: string;
    };
}

const variants: StyleConfig = {
    default: {
        base: "transition-all rounded-lg font-medium",
        selected: "bg-[#008C9B] text-white border-[#008C9B] hover:bg-[#008C9B]/90",
        unselected:
            "bg-white dark:bg-dark text-gray-700 border-gray-200 hover:border-[#008C9B] hover:text-[#008C9B]",
    },
    outline: {
        base: "transition-all rounded-lg font-medium border-2",
        selected: "border-[#008C9B] bg-[#008C9B]/10 text-[#008C9B]",
        unselected:
            "border-gray-200 text-gray-700 hover:border-[#008C9B] hover:text-[#008C9B]",
    },
    solid: {
        base: "transition-all rounded-lg font-medium",
        selected: "bg-[#008C9B] text-white hover:bg-[#008C9B]/90",
        unselected:
            "bg-gray-100 dark:bg-gray-dark dark:text-gray-light text-gray-700 hover:bg-gray-200",
    },
    ghost: {
        base: "transition-all rounded-lg font-medium",
        selected: "bg-[#008C9B]/10 text-[#008C9B]",
        unselected: "text-gray-700 hover:bg-gray-100",
    },
};

const sizes = {
    sm: "h-8 text-sm",
    md: "h-10",
    lg: "h-12 text-lg",
};

export interface RadioButtonProps {
    label: string;
    value: string;
    name?: string;
    checked?: boolean;
    onChange?: (value: string) => void;
    variant?: Variant;
    size?: Size;
    className?: string;
}

export interface RadioButtonGroupProps {
    label?: string;
    children: React.ReactNode;
    name: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    variant?: Variant;
    size?: Size;
    className?: string;
}

export const RadioButton = ({
    label,
    value,
    name,
    checked,
    onChange,
    variant = "default",
    size = "md",
    className = "",
}: RadioButtonProps) => {
    const variantStyles = variants[variant];
    const sizeStyle = sizes[size];

    return (
        <label
            className={clsx(className, "relative flex cursor-pointer items-center")}
        >
            <Typography
                variant="body2"
                className={clsx(
                    "inline-flex w-full cursor-pointer items-center justify-center",
                    !checked &&
                    "border-spacing-2 border border-gray-lightest dark:border-gray-900",
                    variantStyles.base,
                    checked ? variantStyles.selected : variantStyles.unselected,
                    sizeStyle,
                )}
            >
                {label}
            </Typography>
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={() => onChange?.(value)}
                className="hidden cursor-pointer"
            />
        </label>
    );
};

export const RadioButtonGroup = ({
    label,
    children,
    name,
    defaultValue,
    onChange,
    variant = "default",
    size = "md",
    className = "",
}: RadioButtonGroupProps) => {
    const [value, setValue] = React.useState(defaultValue);

    const handleChange = (newValue: string) => {
        setValue(newValue);
        onChange?.(newValue);
    };

    return (
        <>
            {label && (
                <Typography
                    variant="body2"
                    className="mb-2 flex justify-start text-right text-[1rem] font-medium"
                >
                    {label}
                </Typography>
            )}
            <Box className={clsx(className)}>
                {React.Children.map(children, (child) => {
                    if (React.isValidElement<RadioButtonProps>(child)) {
                        return React.cloneElement(child as React.ReactElement<RadioButtonProps>, {
                            ...(child.props as object),
                            name,
                            checked: value === child.props.value,
                            onChange: handleChange,
                            variant,
                            size,
                        });
                    }
                    return child;
                })}
            </Box>
        </>
    );
};