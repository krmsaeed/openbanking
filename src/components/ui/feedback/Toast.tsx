'use client';
import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { showDismissibleToast } from './DismissibleToast';

interface ToastContextType {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
    loading: (message: string) => string;
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
    const success = (message: string) => {
        return showDismissibleToast(message, 'success');
    };

    const error = (message: string) => {
        return showDismissibleToast(message, 'error');
    };

    const warning = (message: string) => {
        return showDismissibleToast(message, 'warning');
    };

    const info = (message: string) => {
        return showDismissibleToast(message, 'info');
    };

    const loading = (message: string) => {
        return toast.loading(message, {
            style: {
                borderRadius: '12px',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: `1px solid var(--color-primary-100)`,
                fontFamily: 'var(--font-vazirmatn), "Tahoma", sans-serif',
            },
        });
    };

    const dismiss = (toastId?: string) => {
        toast.dismiss(toastId);
    };

    return (
        <ToastContext.Provider value={{ success, error, warning, info, loading, dismiss }}>
            {children}
            <Toaster
                position="bottom-center"
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
