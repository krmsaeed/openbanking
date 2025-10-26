'use client';

import { Box } from '@/components/ui';
import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';

export interface RadioOption<T> {
    value: T;
    label: string;
}

export interface RadioGroupProps<T>
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> {
    options: RadioOption<T>[];
    value?: T;
    onChange?: (value: T) => void;
    name: string;
    error?: string;
    className?: string;
    direction?: 'horizontal' | 'vertical';
}
function RadioGroupInner<T>(
    {
        options,
        value,
        onChange,
        name,
        error,
        className,
        direction = 'vertical',
        ...props
    }: RadioGroupProps<T>,
    ref: React.ForwardedRef<HTMLInputElement>
) {
    const handleChange = (optionValue: T) => {
        if (onChange) {
            onChange(optionValue);
        }
    };
    return (
        <Box className={cn('space-y-2', className)}>
            <Box
                className={cn(
                    'flex gap-3',
                    direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
                )}
            >
                {options.map((option, idx) => {
                    const isSelected = value === option.value;

                    return (
                        <label
                            key={idx}
                            className={cn(
                                'relative flex cursor-pointer items-center justify-between shadow-md',
                                'rounded-xl px-4 py-3 transition-all duration-200',
                                'hover:shadow-sm',
                                isSelected
                                    ? 'bg-secondary shadow-sm dark:bg-gray-50'
                                    : 'bg-gray-100 outline-gray-300',
                                error && !isSelected && 'border-red-300',
                                direction === 'horizontal' ? 'min-w-[120px] flex-1' : 'w-full'
                            )}
                        >
                            <span
                                className={cn(
                                    'text-sm font-medium transition-colors',
                                    isSelected ? 'text-white' : 'text-primary-700'
                                )}
                            >
                                {option.label}
                            </span>

                            <Box className="relative">
                                <input
                                    ref={isSelected ? ref : undefined}
                                    type="radio"
                                    name={name}
                                    value={String(idx)}
                                    checked={isSelected}
                                    onChange={() => handleChange(option.value)}
                                    className="sr-only"
                                    {...props}
                                />
                                <Box
                                    className={cn(
                                        'h-4 w-4 rounded-full border-1 transition-all duration-200',
                                        'flex items-center justify-center',
                                        isSelected
                                            ? 'border-primary-500 bg-white'
                                            : 'border-gray-300 bg-white'
                                    )}
                                >
                                    {isSelected && (
                                        <Box className="bg-primary-900 h-2.5 w-2.5 rounded-full" />
                                    )}
                                </Box>
                            </Box>
                        </label>
                    );
                })}
            </Box>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </Box>
    );
}

const RadioGroup = forwardRef(RadioGroupInner) as <T>(
    props: RadioGroupProps<T> & { ref?: React.ForwardedRef<HTMLInputElement> }
) => React.JSX.Element;

Object.defineProperty(RadioGroup, 'displayName', {
    value: 'RadioGroup',
    configurable: true,
});

export default RadioGroup;
