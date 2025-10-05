import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outline';
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const getCardClasses = (
    variant: 'default' | 'elevated' | 'outline',
    padding: 'none' | 'sm' | 'md' | 'lg'
) => {
    const baseClasses = 'rounded-lg  bg-gray-50';

    const variantClasses = {
        default: '',
        elevated: 'shadow-lg',
        outline: 'border-2 border-gray-200 ',
    };

    const paddingClasses = {
        none: 'p-0',
        sm: 'md:p-4 p-2 ',
        md: 'md:p-6 p-4',
        lg: 'md:p-8 p-6',
    };

    return `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]}`;
};

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', ...props }, ref) => {
        return (
            <div className={cn(getCardClasses(variant, padding), className)} ref={ref} {...props} />
        );
    }
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex flex-col py-4', className)} {...props} />
    )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={cn('text-body text-2xl leading-none font-bold tracking-tight', className)}
            {...props}
        />
    )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn('text-body text-sm', className)} {...props} />
    )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center pt-6', className)} {...props} />
    )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
