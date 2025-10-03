"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Typography } from "../core";

type Option = {
    id: number | string;
    label: string;
    disabled?: boolean;
};

interface DropdownProps {
    options: Option[];
    value: string | null;
    onChange: (value: string | null) => void;

    label?: string;
    placeholder?: string;
    helperText?: string;
    error?: boolean;
    size?: "small" | "medium" | "large";
    fullWidth?: boolean;
    variant?: "outlined" | "filled" | "standard";

    disabled?: boolean;
    required?: boolean;
    multiple?: boolean;
    searchable?: boolean;
    autoFocus?: boolean;
    clearable?: boolean;
    loading?: boolean;

    noOptionsText?: string;
    loadingText?: string;

    className?: string;
    menuClassName?: string;
    labelClassName?: string;

    maxItems?: number;
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;

    renderOption?: (option: Option) => React.ReactNode;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
}

const defaultProps: Partial<DropdownProps> = {
    size: "medium",
    variant: "outlined",
    fullWidth: true,
    noOptionsText: "موردی یافت نشد",
    loadingText: "در حال بارگذاری...",
};

const DropdownCustom = ({
    options,
    value,
    onChange,
    label,
    placeholder = "انتخاب کنید",
    helperText,
    error = false,
    size = defaultProps.size,
    variant = defaultProps.variant,
    disabled = false,
    required = false,
    multiple = false,
    searchable = false,
    autoFocus = false,
    clearable = false,
    loading = false,
    className = "",
    ...props
}: DropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleOpen = useCallback(() => {
        if (!disabled) {
            setIsOpen(!isOpen);
            props.onOpen?.();
        }
    }, [disabled, props, isOpen]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        setSearchTerm("");
        props.onClose?.();
    }, [props]);

    const handleSelect = useCallback(
        (option: Option) => {
            if (multiple) {
                const currentValue = value ? value.split(", ") : [];
                const newValue = currentValue.includes(option.label)
                    ? currentValue.filter((v) => v !== option.label)
                    : [...currentValue, option.label];

                if (!props.maxItems || newValue.length <= props.maxItems) {
                    onChange(newValue.join(", "));
                }
            } else {
                onChange(option.label);
                handleClose();
            }
        },
        [multiple, value, props, onChange, handleClose],
    );

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    const getVariantClasses = () => {
        switch (variant) {
            case "filled":
                return "bg-gray-100 hover:bg-gray-200";
            case "standard":
                return "border-b border-t-0 border-x-0 rounded-none";
            default:
                return "shadow-sm focus:ring-primary focus:border-primary focus:outline-none block sm:text-sm border-gray-300 rounded-md py-3 px-4 ";
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case "small":
                return "py-1 text-sm";
            case "large":
                return "py-3 text-lg";
            default:
                return "py-2 text-base";
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current !== event.target
            ) {
                handleClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClose]);

    const handleSearchInputClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <Box className={`relative ${props.fullWidth ? "w-full" : "w-auto"}`}>
            {label && (
                <label
                    className={`mb-1 block pr-3 text-right text-sm font-medium text-gray-700 ${error ? "text-red-600" : "text-gray-700"} ${props.labelClassName}`}
                >
                    {label}
                    {required && (
                        <Typography variant="span" className="text-red-500 mr-1">
                            *
                        </Typography>
                    )}
                </label>
            )}

            <Box ref={dropdownRef} className="relative  rounded-lg">
                <button
                    type="button"
                    onClick={handleOpen}
                    disabled={disabled}
                    className={`flex w-full items-center justify-between rounded-lg border border-gray-lightest px-4 py-3 shadow-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm ${getVariantClasses()} ${getSizeClasses()} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${error ? "border-red-500" : "hover:border-[#0E5D6B]"} ${className} `}
                >
                    <Box className="flex items-center gap-2 rounded-md">
                        {props.startIcon}
                        <Typography
                            variant="span"
                            className={
                                !value
                                    ? "text-gray-400 "
                                    : "text-gray-900 dark:text-gray-lightest"
                            }
                        >
                            {multiple ? (value ? value : placeholder) : value || placeholder}
                        </Typography>
                    </Box>

                    <Box className="flex items-center gap-2">
                        {clearable && value && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(multiple ? "" : null);
                                }}
                                className="rounded-full p-1 hover:bg-gray-100"
                            >
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                        {props.endIcon || (
                            <svg
                                className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        )}
                    </Box>
                </button>

                {isOpen && (
                    <Box
                        className={`absolute z-50 mt-0 max-h-60 w-full overflow-auto rounded-lg bg-white  shadow-sm ${props.menuClassName} `}
                    >
                        {searchable && (
                            <Box className="sticky top-0 border-b bg-white p-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={handleSearchInputClick}
                                    placeholder="جستجو..."
                                    className="block w-full rounded-md border-gray-300 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                    autoFocus={autoFocus}
                                />
                            </Box>
                        )}

                        {loading ? (
                            <Box className="p-4 text-center text-gray-500">
                                {props.loadingText}
                            </Box>
                        ) : filteredOptions.length === 0 ? (
                            <Box className="p-4 text-center text-gray-500">
                                {props.noOptionsText}
                            </Box>
                        ) : (
                            filteredOptions.map((option) => (
                                <Box
                                    key={option.id}
                                    onClick={() => !option.disabled && handleSelect(option)}
                                    className={`cursor-pointer px-4 py-2 transition-colors duration-150 ${option.disabled
                                        ? "cursor-not-allowed  bg-gray-50 opacity-50 "
                                        : "hover:bg-[#0E5D6B]/5 dark:hover:bg-primary-700"
                                        } ${multiple
                                            ? Array.isArray(value) &&
                                                value.some((v) => v.id === option.id)
                                                ? "bg-[#0E5D6B]/10 text-[#0E5D6B]"
                                                : "text-gray-700"
                                            : typeof value === "object" &&
                                                value !== null &&
                                                "id" in value &&
                                                (value as Option).id === option.id
                                                ? "bg-[#0E5D6B]/10 text-[#0E5D6B]"
                                                : "text-gray-700"
                                        } `}
                                >
                                    {props.renderOption ? (
                                        props.renderOption(option)
                                    ) : (
                                        <Box className="flex items-center justify-between dark:text-gray-lightest">
                                            <Typography variant="span">{option.label}</Typography>
                                            {multiple &&
                                                Array.isArray(value) &&
                                                value.some((v) => v.id === option.id) && (
                                                    <svg
                                                        className="h-5 w-5"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                )}
                                        </Box>
                                    )}
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </Box>

            {helperText && (
                <Typography
                    variant="p"
                    className={`mt-1 text-sm ${error ? "text-red-600" : "text-gray-500"}`}
                >
                    {helperText}
                </Typography>
            )}
        </Box>
    );
};

export default DropdownCustom;