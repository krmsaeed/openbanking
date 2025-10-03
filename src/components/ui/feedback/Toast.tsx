'use client';
import React, { createContext, useContext } from 'react';
import toast, { Toaster, Toast } from 'react-hot-toast';
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
} from '@heroicons/react/24/solid';

interface ToastContextType {
    success: (message: string, options?: object) => void;
    error: (message: string, options?: object) => void;
    warning: (message: string, options?: object) => void;
    info: (message: string, options?: object) => void;
    loading: (message: string, options?: object) => string;
    dismiss: (toastId?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

const CustomToast: React.FC<{ t: Toast; type: 'success' | 'error' | 'warning' | 'info' }> = ({
    t,
    type,
}) => {
    const icons = {
        success: <CheckCircleIcon className="h-5 w-5 text-[var(--color-success-500)]" />,
        error: <XCircleIcon className="h-5 w-5 text-[var(--color-error-500)]" />,
        warning: <ExclamationTriangleIcon className="h-5 w-5 text-[var(--color-warning-500)]" />,
        info: <InformationCircleIcon className="h-5 w-5 text-[var(--color-info-500)]" />,
    };

    const colors = {
        success: 'border-[var(--color-success-100)] bg-[var(--color-success-50)]',
        error: 'border-[var(--color-error-100)] bg-[var(--color-error-50)]',
        warning: 'border-[var(--color-warning-100)] bg-[var(--color-warning-50)]',
        info: 'border-[var(--color-info-100)] bg-[var(--color-info-50)]',
    };

    return (
        <div
            className={`${
                t.visible ? 'animate-enter' : 'animate-leave'
            } flex items-center rounded-xl border p-4 ${colors[type]} max-w-md shadow-lg`}
        >
            <div className="flex items-center space-x-3 space-x-reverse">
                {icons[type]}
                <p className="text-sm font-medium text-gray-900">
                    {typeof t.message === 'function' ? t.message(t) : t.message}
                </p>
            </div>
            <button
                onClick={() => toast.dismiss(t.id)}
                className="mr-auto text-gray-400 transition-colors hover:text-gray-600"
            >
                <XCircleIcon className="h-5 w-5" />
            </button>
        </div>
    );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const success = (message: string, options?: object) => {
        return toast.custom((t: Toast) => <CustomToast t={t} type="success" />, {
            duration: 4000,
            ...options,
        });
    };

    const error = (message: string, options?: object) => {
        return toast.custom((t: Toast) => <CustomToast t={t} type="error" />, {
            duration: 5000,
            ...options,
        });
    };

    const warning = (message: string, options?: object) => {
        return toast.custom((t: Toast) => <CustomToast t={t} type="warning" />, {
            duration: 4000,
            ...options,
        });
    };

    const info = (message: string, options?: object) => {
        return toast.custom((t: Toast) => <CustomToast t={t} type="info" />, {
            duration: 4000,
            ...options,
        });
    };

    const loading = (message: string, options?: object) => {
        return toast.loading(message, {
            style: {
                borderRadius: '12px',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: `1px solid var(--color-primary-100)`,
                fontFamily: 'var(--font-vazirmatn), "Tahoma", sans-serif',
            },
            ...options,
        });
    };

    const dismiss = (toastId?: string) => {
        toast.dismiss(toastId);
    };

    return (
        <ToastContext.Provider value={{ success, error, warning, info, loading, dismiss }}>
            {children}
            <Toaster
                position="top-center"
                gutter={8}
                containerStyle={{
                    fontFamily: 'var(--font-vazirmatn), "Tahoma", sans-serif',
                }}
                toastOptions={{
                    style: {
                        fontFamily: 'var(--font-vazirmatn), "Tahoma", sans-serif',
                    },
                }}
            />
        </ToastContext.Provider>
    );
};
