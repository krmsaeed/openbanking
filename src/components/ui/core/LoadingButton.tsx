import Typography from '@/components/ui/core/Typography';
import { CheckIcon } from '@heroicons/react/24/outline';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Button as BaseButton } from './Button';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    title?: string;
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading = false, title = 'مرحله بعد', disabled, ...props }, ref) => {
        return (
            <BaseButton
                ref={ref}
                {...props}
                loading={!!loading}
                disabled={Boolean(loading) || Boolean(disabled)}
                className="flex w-full items-center justify-center gap-2 text-white"
            >
                {!loading && <CheckIcon className="h-5 w-5 text-white" />}
                <Typography variant="body1" className="text-xs font-medium text-white">
                    {loading ? 'در حال ارسال' : title}
                </Typography>
            </BaseButton>
        );
    }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
