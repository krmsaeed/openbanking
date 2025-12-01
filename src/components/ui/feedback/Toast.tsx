'use client';
import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { showDismissibleToast } from './DismissibleToast';

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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const success = (message: string, options?: object) => {
        return showDismissibleToast(message, 'success');
    };

    const error = (message: string, options?: object) => {
        return showDismissibleToast(message, 'error');
    };

    const warning = (message: string, options?: object) => {
        return showDismissibleToast(message, 'warning');
    };

    const info = (message: string, options?: object) => {
        return showDismissibleToast(message, 'info');
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
