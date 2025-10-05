'use client';

import { Box } from '@/components/ui';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showCloseButton?: boolean;
}

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
}: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <Box className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <Box
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <Box className="flex min-h-full items-center justify-center p-4">
                <Box
                    className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-lg border border-gray-200/20 bg-white/95 shadow-xl backdrop-blur-md transition-all duration-300 dark:border-gray-50/20 dark:bg-gray-50/95`}
                >
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <Box className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
                            {title && (
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h3>
                            )}
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            )}
                        </Box>
                    )}

                    {/* Content */}
                    <Box className="p-4">{children}</Box>
                </Box>
            </Box>
        </Box>
    );
}
