'use client';

import { cn } from '@/lib/utils';
import React, { forwardRef } from 'react';

export interface RadioOption {
    value: string;
    label: string;
}

export interface RadioGroupProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
    options: RadioOption[];
    value?: string;
    onChange?: (value: string) => void;
    name: string;
    error?: string;
    className?: string;
    direction?: 'horizontal' | 'vertical';
}
const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
    (
        { options, value, onChange, name, error, className, direction = 'vertical', ...props },
        ref
    ) => {
        const handleChange = (optionValue: string) => {
            if (onChange) {
                onChange(optionValue);
            }
        };

        return (
            <div className={cn('space-y-2', className)}>
                <div
                    className={cn(
                        'flex gap-3',
                        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
                    )}
                >
                    {options.map((option) => {
                        const isSelected = value === option.value;

                        return (
                            <label
                                key={option.value}
                                className={cn(
                                    'relative flex cursor-pointer items-center justify-between',
                                    'rounded-xl border-2 px-4 py-3 transition-all duration-200',
                                    'hover:shadow-sm',
                                    isSelected
                                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                                        : 'border-gray-200 bg-white hover:border-gray-300',
                                    error && !isSelected && 'border-red-300',
                                    direction === 'horizontal' ? 'min-w-[120px] flex-1' : 'w-full'
                                )}
                            >
                                <span
                                    className={cn(
                                        'text-sm font-medium transition-colors',
                                        isSelected ? 'text-primary-700' : 'text-gray-700'
                                    )}
                                >
                                    {option.label}
                                </span>

                                <div className="relative flex items-center justify-center">
                                    <input
                                        ref={isSelected ? ref : undefined}
                                        type="radio"
                                        name={name}
                                        value={option.value}
                                        checked={isSelected}
                                        onChange={() => handleChange(option.value)}
                                        className="sr-only"
                                        {...props}
                                    />
                                    <div
                                        className={cn(
                                            'h-4 w-4 rounded-full border-1 transition-all duration-200',
                                            'flex items-center justify-center',
                                            isSelected
                                                ? 'border-primary-500 bg-white'
                                                : 'border-gray-300 bg-white'
                                        )}
                                    >
                                        {isSelected && (
                                            <div className="bg-primary-500 h-2.5 w-2.5 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
        );
    }
);

RadioGroup.displayName = 'RadioGroup';

export default RadioGroup;
