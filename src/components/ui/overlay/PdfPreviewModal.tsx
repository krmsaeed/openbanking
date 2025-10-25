'use client';

import { Box, Button } from '@/components/ui';
import { Modal } from '@/components/ui/overlay';
import { useState } from 'react';

interface PdfPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string;
    title?: string;
}

export function PdfPreviewModal({
    isOpen,
    onClose,
    pdfUrl,
    title = 'پیش‌نمایش قرارداد',
}: PdfPreviewModalProps) {
    const [loading, setLoading] = useState(true);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
            <Box className="relative h-[75vh] w-full">
                {loading && (
                    <Box className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-r-transparent"></div>
                    </Box>
                )}
                <iframe
                    src={`${pdfUrl}#toolbar=0#zoom=100`}
                    className="h-full w-full"
                    onLoad={() => setLoading(false)}
                />
            </Box>
            <Box className="mt-5 flex justify-center">
                <Button className="min-w-[20rem]" variant="primary" onClick={onClose}>
                    تایید
                </Button>
            </Box>
        </Modal>
    );
}
