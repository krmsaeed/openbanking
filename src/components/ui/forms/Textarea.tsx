import mergeClasses from '@/lib/utils';
import React, { ComponentProps } from 'react';
import { Box, Typography } from '../core';

interface CustomTextareaProps extends ComponentProps<'textarea'> {
    inputComponent?: React.ElementType;
    inputProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
    name?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    className?: string;
    label?: string;
    required?: boolean;
    error?: string;
    startDecorator?: React.ReactNode;
    endDecorator?: React.ReactNode;
    sx?: React.CSSProperties;
    value?: string | number;
}

const CustomTextarea: React.FC<CustomTextareaProps> = (props) => {
    const {
        inputComponent: InputComponent = 'textarea',
        name,
        onChange,
        placeholder,
        label,
        required,
        startDecorator,
        endDecorator,
        className,
        error,
        sx,
        value,
    } = props;
    return (
        <Box className={mergeClasses('relative w-full', className)} style={sx}>
            {startDecorator && <Box className="absolute left-0">{startDecorator}</Box>}
            <Typography
                variant="span"
                className="mb-1 block text-right text-[0.9rem] font-medium text-gray-700 dark:text-gray-300"
            >
                {label}
                {required && <span className="text-error mr-1">*</span>}
            </Typography>
            <InputComponent
                {...props}
                name={name}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                rows={2}
                className={mergeClasses(
                    `focus:border-primary block w-full scroll-m-0 rounded-md bg-white px-4 py-3 text-gray-900 focus:outline-none sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white`,
                    className && className
                )}
                style={{
                    paddingLeft: startDecorator ? '2rem' : '0.5rem',
                    paddingRight: endDecorator ? '2rem' : '0.5rem',
                    resize: 'vertical',
                    ...sx,
                }}
                value={value}
            />
            {error && (
                <Typography variant="span" className="text-error-600 block text-sm">
                    {error}
                </Typography>
            )}
            {endDecorator && <Box className="absolute right-0">{endDecorator}</Box>}
        </Box>
    );
};

export default CustomTextarea;
