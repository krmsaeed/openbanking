'use client';
import { Box } from '@/components/ui';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/solid';
import React from 'react';
import toast, { Toast } from 'react-hot-toast';

interface DismissibleToastProps {
    t: Toast;
    type?: 'success' | 'error' | 'warning' | 'info';
    message: string;
}

const DismissibleToast: React.FC<DismissibleToastProps> = ({ t, type = 'info', message }) => {
    const icons = {
        success: (
            <CheckCircleIcon className="ml-2 h-5 w-5 text-[var(--color-success-500)]" />
        ),
        error: <XCircleIcon className="ml-2 h-5 w-5 text-[var(--color-error-500)]" />,
        warning: (
            <ExclamationTriangleIcon className="ml-2 h-5 w-5 text-[var(--color-warning-500)]" />
        ),
        info: <InformationCircleIcon className="ml-2 h-5 w-5 text-[var(--color-info-500)]" />,
    };

    const colors = {
        success:
            'border-[var(--color-success-200)] bg-[var(--color-success-100)] dark:border-[var(--color-success-100)] dark:bg-[var(--color-success-300)]',
        error:
            'border-[var(--color-error-200)] bg-[var(--color-error-100)] dark:border-[var(--color-error-100)] dark:bg-[var(--color-error-300)]',
        warning:
            'border-[var(--color-warning-200)] bg-[var(--color-warning-100)] dark:border-[var(--color-warning-100)] dark:bg-[var(--color-warning-300)]',
        info:
            'border-[var(--color-info-200)] bg-[var(--color-info-100)] dark:border-[var(--color-info-100)] dark:bg-[var(--color-info-300)]',
    };

    const handleDismiss = () => {
        toast.dismiss(t.id);
    };

    return (
        <Box
            onClick={handleDismiss}
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } flex cursor-pointer items-center rounded-xl border p-4 ${colors[type]} max-w-md shadow-lg transition-all hover:shadow-xl`}
        >
            <Box className="flex items-center space-x-3 space-x-reverse">
                {icons[type]}
                <p className="text-sm font-medium text-gray-900">{message}</p>
            </Box>
        </Box>
    );
};

export const showDismissibleToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
) => {
    return toast.custom((t: Toast) => <DismissibleToast t={t} type={type} message={message} />, {
        duration: 10000,
        position: 'bottom-center',
    });
};

export default DismissibleToast;
