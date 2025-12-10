'use client';

import { Box, Button } from '@/components/ui';
import { Modal } from '@/components/ui/overlay';
import { useState, useEffect } from 'react';
import LoadingButton from '@/components/ui/core/LoadingButton';

interface PdfPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    title?: string;
    onConfirm?: () => void | Promise<void>;
    loading?: boolean;
}

export function PdfPreviewModal({
    isOpen,
    onClose,
    pdfUrl,
    title,
    onConfirm,
    loading: externalLoading = false,
}: PdfPreviewModalProps) {
    const [loading, setLoading] = useState(true);
    const [viewerUrl, setViewerUrl] = useState<string>(pdfUrl || '');

    // detect mobile devices (basic UA check)
    const isMobile =
        typeof navigator !== 'undefined' &&
        /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    // Convert data:application/pdf;base64,... to a Blob URL so browsers get correct mime type
    // and revoke previous object URLs when pdfUrl changes or component unmounts.
    useEffect(() => {
        let objectUrl: string | null = null;
        setLoading(true);

        try {
            if (pdfUrl && pdfUrl.startsWith('data:application/pdf')) {
                // Extract base64 part
                const commaIndex = pdfUrl.indexOf(',');
                const base64 = commaIndex >= 0 ? pdfUrl.slice(commaIndex + 1) : pdfUrl;
                const binary = atob(base64);
                const len = binary.length;
                const u8 = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    u8[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([u8], { type: 'application/pdf' });
                objectUrl = URL.createObjectURL(blob);
                setViewerUrl(objectUrl);
            } else {
                setViewerUrl(pdfUrl || '');
            }
        } catch (err) {
            // fallback to raw url when conversion fails
            console.error('Failed to prepare PDF for preview', err);
            setViewerUrl(pdfUrl || '');
        }

        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [pdfUrl]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="xl"
            closeOnClickOutside={false}
            showCloseButton={false}
        >
            <Box className="relative h-[75vh] w-full">
                {loading && (
                    <Box className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-r-transparent"></div>
                    </Box>
                )}
                <Box className="relative h-full w-full">
                    {!isMobile ? (
                        <iframe
                            src={viewerUrl}
                            className="h-full w-full"
                            onLoad={() => setLoading(false)}
                        />
                    ) : (
                        <Box className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 text-center">
                            <p className="text-sm text-gray-700">
                                نمایش پیش‌نمایش PDF در برخی مرورگرهای موبایل پشتیبانی نمی‌شود.
                                می‌توانید فایل را در برگه جدید باز یا دانلود کنید.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (viewerUrl) {
                                            window.open(viewerUrl, '_blank');
                                        }
                                    }}
                                >
                                    باز کردن در برگه جدید
                                </Button>
                                <Button
                                    onClick={() => {
                                        try {
                                            const link = document.createElement('a');
                                            link.href = viewerUrl;
                                            link.download = 'قرارداد.pdf';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        } catch (err) {
                                            console.error('Error downloading PDF:', err);
                                        }
                                    }}
                                >
                                    دانلود
                                </Button>
                            </div>
                        </Box>
                    )}
                    <style jsx>{`
                        html ~ body ~ #toolbar {
                            display: none !important;
                        }
                    `}</style>
                </Box>
            </Box>
            <Box className="mt-5 flex justify-center">
                {onConfirm ? (
                    <LoadingButton
                        className="min-w-[20rem]"
                        onClick={onConfirm}
                        loading={externalLoading}
                        disabled={externalLoading}
                        title="تایید"
                    />
                ) : (
                    <Button className="min-w-[20rem]" variant="primary" onClick={onClose}>
                        تایید
                    </Button>
                )}
            </Box>
        </Modal>
    );
}
