"use client";
import React, { useState } from 'react';
import { Box, Typography } from '@/components/ui';
import { Button } from '@/components/ui/core/Button';
import LoadingButton from '@/components/ui/core/LoadingButton';
import Image from 'next/image';
import { Loading } from '@/components/ui/feedback/Loading';

type Props = {
    onConfirm: () => void;
    loading?: boolean;
};

export default function FinalConfirmation({ onConfirm, loading = false }: Props) {
    const [accepted, setAccepted] = useState(false);
    const [downloading, setDownloading] = useState<null | 'image' | 'pdf'>(null);

    const downloadAsFile = async (url: string, filename: string, key: 'image' | 'pdf') => {
        try {
            setDownloading(key);
            const res = await fetch(url, { credentials: 'same-origin' });
            if (!res.ok) throw new Error('failed to fetch');
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('download failed', err);
        } finally {
            setDownloading(null);
        }
    };

    return (
        <Box className="space-y-6">
            <Box className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <Typography variant="h3" className="font-medium text-green-900 mb-2 text-center">امضای دیجیتال</Typography>
                <Typography variant="body1" className="text-sm text-green-800 text-center">گواهی دیجیتال شما با موفقیت صادر شد. در این مرحله می‌توانید قرارداد بانکی را دانلود کنید.</Typography>
            </Box>

            <Box className="bg-white border rounded p-4 text-right">
                <Typography variant="body2" className="text-sm text-right">قرارداد بانکی</Typography>
                <Typography variant="body2" className="text-sm mt-2 text-right">لطفا فایل قرارداد را دانلود و نگهداری کنید.</Typography>

                <div className="mt-4 flex justify-center">
                    <div className="w-80 h-56 overflow-hidden rounded border">
                        <Image src={'/bank-contract-preview.jpg'} alt="contract preview" width={640} height={420} style={{ objectFit: 'contain' }} />
                    </div>
                </div>

                <div className="mt-4 flex gap-2 justify-center w-full md:w-[75%] mx-auto">
                    <Button onClick={() => downloadAsFile('/bank-contract-preview.jpg', 'bank-contract-preview.jpg', 'image')} className="w-full inline-flex items-center justify-center px-4 py-2 bg-secondary  text-white rounded">
                        {downloading === 'image' ? <Loading size="sm" className="ml-1" /> : null}
                        دانلود تصویر قرارداد
                    </Button>
                    <Button onClick={() => downloadAsFile('/bank-contract.pdf', 'bank-contract.pdf', 'pdf')} className="w-full inline-flex items-center justify-center px-4 py-2 bg-secondary text-white rounded">
                        {downloading === 'pdf' ? <Loading size="sm" className="ml-1" /> : null}
                        دانلود قرارداد (PDF)
                    </Button>
                </div>
            </Box>

            <label className="flex items-center gap-3">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
                <span className="text-sm">من قرارداد را مطالعه کردم و موافقم</span>
            </label>

            <LoadingButton
                onClick={() => accepted && onConfirm()}
                loading={loading}
                disabled={!accepted || loading}
                className="w-full"
            >
                تایید
            </LoadingButton>

        </Box>
    );
}
