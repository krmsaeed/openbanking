"use client";
import React from "react";
import { CheckIcon } from "@heroicons/react/24/outline";

interface CheckboxProps {
    label?: string;
    value?: string;
    name?: string;
    checked?: boolean;
    onChange?: (value: string) => void;
    variant?: "default" | "outline" | "solid" | "ghost";
    size?: "sm" | "md" | "lg";
    color?: string;
    className?: string;
}

const checkboxVariants = {
    default: {
        base: "transition-all duration-200 rounded-lg font-medium border-2",
        selected: "bg-primary text-white border-primary hover:bg-primary/90",
        unselected:
            "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary",
    },
    custom: {
        base: "transition-all duration-200 rounded-lg font-medium border-2",
        selected: "border-primary bg-white text-gray-main",
        unselected:
            "border-gray-200 text-gray-700 hover:border-primary hover:text-gray-main",
    },
    outline: {
        base: "transition-all duration-200 rounded-lg font-medium border-2",
        selected: "border-primary bg-primary/10 text-primary",
        unselected:
            "border-gray-200 text-gray-700 hover:border-primary hover:text-primary",
    },
    solid: {
        base: "transition-all duration-200 rounded-lg font-medium border-2",
        selected: "bg-primary text-white hover:bg-primary/90",
        unselected: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    },
    ghost: {
        base: "transition-all duration-200 rounded-lg font-medium",
        selected: "bg-primary/10 text-primary",
        unselected: "text-gray-700 hover:bg-gray-100",
    },
};

const checkboxSizes = {
    sm: "h-6 px-[10px] text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
};

export const Checkbox: React.FC<CheckboxProps> = ({
    label = "",
    value = "",
    name = "",
    checked = false,
    onChange = () => { },
    variant = "custom",
    size = "md",
    color = "#000",
    className = "",
}) => {
    const variantStyles =
        checkboxVariants[variant as keyof typeof checkboxVariants];
    const sizeStyle = checkboxSizes[size];

    return (
        <label className={`relative flex items-center${className}`}>
            <input
                type="checkbox"
                name={name}
                value={value}
                checked={checked}
                onChange={() => onChange(value)}
                className="hidden"
            />
            <span
                className={`inline-flex cursor-pointer items-center justify-center ${variantStyles.base} ${checked ? variantStyles.selected : variantStyles.unselected} ${sizeStyle} relative`}
            >
                {checked && <CheckIcon className={`absolute w-5`} color={color} />}
                {label}
            </span>
        </label>
    );
};