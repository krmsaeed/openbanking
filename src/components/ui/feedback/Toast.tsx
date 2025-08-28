
"use client"
import React, { createContext, useContext } from "react";
import toast, { Toaster, Toast } from "react-hot-toast";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/solid";

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
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

const CustomToast: React.FC<{ t: Toast; type: 'success' | 'error' | 'warning' | 'info' }> = ({ t, type }) => {
    const icons = {
        success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
        error: <XCircleIcon className="w-5 h-5 text-red-500" />,
        warning: <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />,
        info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
    };

    const colors = {
        success: 'border-green-200 bg-green-50',
        error: 'border-red-200 bg-red-50',
        warning: 'border-amber-200 bg-amber-50',
        info: 'border-blue-200 bg-blue-50',
    };

    return (
        <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
                } flex items-center p-4 rounded-xl border ${colors[type]} shadow-lg max-w-md`}
        >
            <div className="flex items-center space-x-3 space-x-reverse">
                {icons[type]}
                <p className="text-sm font-medium text-gray-900">
                    {typeof t.message === 'function' ? t.message(t) : t.message}
                </p>
            </div>
            <button
                onClick={() => toast.dismiss(t.id)}
                className="mr-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
                <XCircleIcon className="w-5 h-5" />
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
                background: '#f9fafb',
                color: '#111827',
                border: '1px solid #e5e7eb',
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
