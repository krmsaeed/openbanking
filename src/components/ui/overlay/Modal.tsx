'use client';

import { Box, Button, Typography } from '@/components/ui';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { ReactNode, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const modalVariants = cva(
    'relative w-full transform overflow-hidden rounded-xl border bg-gray-200 shadow-2xl backdrop-blur-md transition-all duration-300 ',
    {
        variants: {
            size: {
                sm: 'max-w-sm',
                md: 'max-w-md',
                lg: 'max-w-2xl',
                xl: 'max-w-4xl',
                '2xl': 'max-w-6xl',
                '3xl': 'max-w-7xl',
                full: 'max-w-full mx-4',
            },
            variant: {
                default: 'border-gray-200/20 dark:border-gray-700/50',
                destructive: 'border-red-200/20 dark:border-red-700/50',
                success: 'border-green-200/20 dark:border-green-700/50',
                warning: 'border-yellow-200/20 dark:border-yellow-700/50',
            },
        },
        defaultVariants: {
            size: 'md',
            variant: 'default',
        },
    }
);

interface ModalProps extends VariantProps<typeof modalVariants> {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    showCloseButton?: boolean;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    autoFocus?: boolean;
    className?: string;
    footer?: ReactNode;
    portalTarget?: HTMLElement | null;
}

export interface ModalRef {
    focus: () => void;
}

const Modal = forwardRef<ModalRef, ModalProps>(
    (
        {
            isOpen,
            onClose,
            title,
            description,
            children,
            size = 'md',
            variant = 'default',
            showCloseButton = true,
            closeOnClickOutside = true,
            closeOnEscape = true,
            autoFocus = true,
            className,
            footer,
            portalTarget,
        },
        ref
    ) => {
        const modalRef = useRef<HTMLDivElement>(null);
        const [isShaking, setIsShaking] = useState(false);

        const { modalRef: accessibilityRef, modalProps } = useModalAccessibility({
            isOpen,
            onClose: closeOnEscape ? onClose : () => {},
            autoFocus,
        });

        useImperativeHandle(ref, () => ({
            focus: () => {
                if (modalRef.current) {
                    modalRef.current.focus();
                }
            },
        }));

        if (!isOpen) return null;

        const handleBackdropClick = () => {
            if (closeOnClickOutside) {
                onClose();
            } else {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 300);
            }
        };

        const modalContent = (
            <Box className="fixed inset-0 z-70 overflow-y-auto">
                {/* Backdrop */}
                <Box
                    className="animate-in fade-in-0 fixed inset-0 bg-black/40 backdrop-blur-sm duration-300"
                    onClick={handleBackdropClick}
                    onTouchEnd={handleBackdropClick}
                    aria-hidden="true"
                />

                {/* Modal Container */}
                <Box className="flex min-h-full items-center justify-center p-4">
                    <Box
                        ref={(node) => {
                            modalRef.current = node;
                            if (accessibilityRef.current !== node) {
                                accessibilityRef.current = node;
                            }
                        }}
                        className={clsx(
                            modalVariants({ size, variant }),
                            'animate-in fade-in-0 zoom-in-95 duration-200',
                            isShaking && 'animate-shake',
                            className
                        )}
                        style={isShaking ? { transform: 'scale(1.05)' } : undefined}
                        {...modalProps}
                        aria-labelledby={title ? 'modal-title' : undefined}
                        aria-describedby={description ? 'modal-description' : undefined}
                    >
                        {/* Header */}
                        {(title || showCloseButton) && (
                            <Box
                                className={`flex w-full items-start ${showCloseButton ? 'justify-between' : 'justify-center'} border-b border-gray-900 p-6 dark:border-gray-700/50`}
                            >
                                <Box className="flex-1">
                                    {title && (
                                        <Typography
                                            id="modal-title"
                                            weight="semibold"
                                            variant="h4"
                                            className={`${!showCloseButton && 'text-center'}`}
                                        >
                                            {title}
                                        </Typography>
                                    )}
                                    {description && (
                                        <Typography
                                            id="modal-description"
                                            variant="body2"
                                            color="secondary"
                                            className="mt-1"
                                        >
                                            {description}
                                        </Typography>
                                    )}
                                </Box>
                                {showCloseButton && (
                                    <Button
                                        onClick={onClose}
                                        variant="ghost"
                                        size="sm"
                                        className="ml-4 h-8 w-8 bg-gray-300 p-0"
                                        aria-label="بستن"
                                    >
                                        <XMarkIcon className="text-error-700 h-4 w-4" />
                                    </Button>
                                )}
                            </Box>
                        )}

                        {/* Content */}
                        <Box className="flex-1 overflow-y-auto p-6">{children}</Box>

                        {/* Footer */}
                        {footer && (
                            <Box className="flex items-center justify-end gap-3 border-t border-gray-200/50 p-6">
                                {footer}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        );

        const targetElement =
            portalTarget || (typeof document !== 'undefined' ? document.body : null);
        if (targetElement) {
            return createPortal(modalContent, targetElement);
        }

        return modalContent;
    }
);

Modal.displayName = 'Modal';

export default Modal;
