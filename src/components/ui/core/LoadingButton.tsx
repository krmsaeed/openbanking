import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Button as BaseButton } from './Button';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    loadingText?: string;
    [key: string]: unknown;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading = false, loadingText = 'در حال ارسال...', children, disabled, ...props }, ref) => {
        return (
            <BaseButton
                ref={ref}
                {...props}
                loading={!!loading}
                disabled={Boolean(loading) || Boolean(disabled)}
            >
                {loading ? String(loadingText) : (children as React.ReactNode)}
            </BaseButton>
        );
    }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
