'use client';

import { Box, Button } from '@/components/ui';
import { Modal } from '@/components/ui/overlay';
import { useState } from 'react';
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
    title = 'پیش‌نمایش قرارداد',
    onConfirm,
    loading: externalLoading = false,
}: PdfPreviewModalProps) {
    const [loading, setLoading] = useState(true);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="xl"
            closeOnClickOutside={false}
        >
            <Box className="relative h-[75vh] w-full">
                {loading && (
                    <Box className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-r-transparent"></div>
                    </Box>
                )}
                <Box className="relative h-full w-full">
                    <iframe
                        src={`${pdfUrl}`}
                        className="h-full w-full"
                        onLoad={() => setLoading(false)}
                    />
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
