import { cn } from '@/lib/utils';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'spinner' | 'dots' | 'pulse';
    className?: string;
}

const Loading = ({ size = 'md', variant = 'spinner', className }: LoadingProps) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    if (variant === 'spinner') {
        return (
            <div
                className={cn(
                    'border-t-primary animate-spin rounded-full border-2 border-gray-300',
                    sizeClasses[size],
                    className
                )}
            />
        );
    }

    if (variant === 'dots') {
        return (
            <div className={cn('flex space-x-1', className)}>
                <div
                    className="bg-primary h-2 w-2 animate-bounce rounded-full"
                    style={{ animationDelay: '0ms' }}
                />
                <div
                    className="bg-primary h-2 w-2 animate-bounce rounded-full"
                    style={{ animationDelay: '150ms' }}
                />
                <div
                    className="bg-primary h-2 w-2 animate-bounce rounded-full"
                    style={{ animationDelay: '300ms' }}
                />
            </div>
        );
    }

    if (variant === 'pulse') {
        return (
            <div
                className={cn('animate-pulse rounded bg-gray-300', sizeClasses[size], className)}
            />
        );
    }

    return null;
};

export { Loading };
