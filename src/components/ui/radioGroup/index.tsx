'use client';

import clsx from 'clsx';
import { memo, useCallback, useState } from 'react';
import { Box, Typography } from '../core';

type RadioVariant = 'default' | 'outline' | 'solid' | 'ghost';
type RadioSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface RadioStyleConfig {
    base: string;
    selected: string;
    unselected: string;
}

const radioVariants: Record<RadioVariant, RadioStyleConfig> = {
    default: {
        base: 'transition-all rounded-lg font-medium',
        selected: 'bg-primary-500 text-white border-primary-500 hover:bg-primary-600',
        unselected:
            'bg-white dark:bg-gray-700 text-gray-700 border-gray-200 hover:border-primary-500 hover:text-primary-500 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-400',
    },
    outline: {
        base: 'transition-all rounded-lg font-medium border-2',
        selected:
            'border-primary-500 bg-primary-50 text-primary-500 dark:bg-primary-900/30 dark:border-primary-400 dark:text-primary-400',
        unselected:
            'border-gray-200 text-gray-700 hover:border-primary-500 hover:text-primary-500 dark:border-gray-600 dark:text-gray-200 dark:hover:border-primary-400 dark:hover:text-primary-400',
    },
    solid: {
        base: 'transition-all rounded-lg font-medium',
        selected: 'bg-primary-500 text-white hover:bg-primary-600',
        unselected:
            'bg-gray-100 dark:bg-gray-700 dark:text-gray-200 text-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600',
    },
    ghost: {
        base: 'transition-all rounded-lg font-medium',
        selected: 'bg-primary-50 text-primary-500 dark:bg-primary-900/30 dark:text-primary-400',
        unselected: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700',
    },
};

const radioSizes: Record<RadioSize, string> = {
    xs: 'h-7 px-2 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
};

export interface RadioButtonProps<T = string> {
    label: string;
    value: T;
    name?: string;
    checked?: boolean;
    disabled?: boolean;
    onChange?: (value: T) => void;
    variant?: RadioVariant;
    size?: RadioSize;
    className?: string;
}

export interface RadioGroupProps<T = string> {
    label?: string;
    options: Array<{ label: string; value: T; disabled?: boolean }>;
    name: string;
    value?: T;
    defaultValue?: T;
    onChange?: (value: T) => void;
    variant?: RadioVariant;
    size?: RadioSize;
    direction?: 'horizontal' | 'vertical';
    disabled?: boolean;
    error?: string;
    className?: string;
}

const RadioButton = memo(
    <T,>({
        label,
        value,
        name,
        checked,
        disabled = false,
        onChange,
        variant = 'default',
        size = 'md',
        className = '',
    }: RadioButtonProps<T>) => {
        const variantStyles = radioVariants[variant];
        const sizeStyle = radioSizes[size];

        const handleChange = useCallback(() => {
            if (!disabled && onChange) {
                onChange(value);
            }
        }, [disabled, onChange, value]);

        return (
            <label
                className={clsx(
                    className,
                    'relative flex cursor-pointer items-center',
                    disabled && 'cursor-not-allowed opacity-60'
                )}
            >
                <Typography
                    variant="body2"
                    className={clsx(
                        'inline-flex w-full cursor-pointer items-center justify-center border',
                        variantStyles.base,
                        checked ? variantStyles.selected : variantStyles.unselected,
                        sizeStyle,
                        disabled && 'cursor-not-allowed opacity-60'
                    )}
                >
                    {label}
                </Typography>
                <input
                    type="radio"
                    name={name}
                    value={String(value)}
                    checked={checked}
                    disabled={disabled}
                    onChange={handleChange}
                    className="hidden"
                />
            </label>
        );
    }
);

RadioButton.displayName = 'RadioButton';

export const RadioGroup = memo(
    <T,>({
        label,
        options,
        name,
        value: controlledValue,
        defaultValue,
        onChange,
        variant = 'default',
        size = 'md',
        direction = 'vertical',
        disabled = false,
        error,
        className = '',
    }: RadioGroupProps<T>) => {
        const [internalValue, setInternalValue] = useState<T | undefined>(defaultValue);
        const isControlled = controlledValue !== undefined;
        const currentValue = isControlled ? controlledValue : internalValue;

        const handleChange = useCallback(
            (newValue: T) => {
                if (!isControlled) {
                    setInternalValue(newValue);
                }
                onChange?.(newValue);
            },
            [isControlled, onChange]
        );

        const containerClasses = clsx(
            className,
            direction === 'horizontal' ? 'flex flex-wrap gap-2' : 'space-y-2'
        );

        return (
            <Box className="w-full">
                {label && (
                    <Typography
                        variant="body2"
                        className="mb-2 block text-right text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        {label}
                    </Typography>
                )}

                <Box className={containerClasses}>
                    {options.map((option) => (
                        <RadioButton
                            key={String(option.value)}
                            label={option.label}
                            value={option.value}
                            name={name}
                            checked={currentValue === option.value}
                            disabled={disabled || option.disabled}
                            onChange={handleChange as (value: unknown) => void}
                            variant={variant}
                            size={size}
                        />
                    ))}
                </Box>

                {error && (
                    <Typography
                        variant="body2"
                        className="mt-2 text-sm text-red-600 dark:text-red-400"
                    >
                        {error}
                    </Typography>
                )}
            </Box>
        );
    }
);

RadioGroup.displayName = 'RadioGroup';
