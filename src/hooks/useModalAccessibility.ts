'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseModalAccessibilityOptions {
    isOpen: boolean;
    onClose: () => void;
    autoFocus?: boolean;
}

export const useModalAccessibility = ({
    isOpen,
    onClose,
    autoFocus = true,
}: UseModalAccessibilityOptions) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousFocusRef = useRef<HTMLElement | null>(null);

    // Focus trap implementation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'Tab' && modalRef.current) {
                const modal = modalRef.current;
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0] as HTMLElement;
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement?.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement?.focus();
                        e.preventDefault();
                    }
                }
            }
        },
        [onClose]
    );

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement as HTMLElement;
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
                previousFocusRef.current.focus();
            }
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Event listeners
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, handleKeyDown]);

    // Auto focus
    useEffect(() => {
        if (isOpen && autoFocus && modalRef.current) {
            const focusableElement = modalRef.current.querySelector(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            ) as HTMLElement;
            if (focusableElement) {
                focusableElement.focus();
            } else {
                modalRef.current.focus();
            }
        }
    }, [isOpen, autoFocus]);

    return {
        modalRef,
        modalProps: {
            role: 'dialog',
            'aria-modal': true,
            tabIndex: -1,
        },
    };
};
