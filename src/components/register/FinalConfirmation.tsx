'use client';
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
            <Box className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
                <Typography variant="h3" className="mb-2 text-center font-medium text-green-900">
                    امضای دیجیتال
                </Typography>
                <Typography variant="body1" className="text-center text-sm text-green-800">
                    گواهی دیجیتال شما با موفقیت صادر شد. در این مرحله می‌توانید قرارداد بانکی را
                    دانلود کنید.
                </Typography>
            </Box>

            <Box className="rounded border bg-white p-4 text-right">
                <Typography variant="body2" className="text-right text-sm">
                    قرارداد بانکی
                </Typography>
                <Typography variant="body2" className="mt-2 text-right text-sm">
                    لطفا فایل قرارداد را دانلود و نگهداری کنید.
                </Typography>

                <div className="mt-4 flex justify-center">
                    <div className="h-56 w-80 overflow-hidden rounded border">
                        <Image
                            src={'/bank-contract-preview.jpg'}
                            alt="contract preview"
                            width={640}
                            height={420}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                </div>

                <div className="mx-auto mt-4 flex w-full justify-center gap-2 md:w-[75%]">
                    <Button
                        onClick={() =>
                            downloadAsFile(
                                '/bank-contract-preview.jpg',
                                'bank-contract-preview.jpg',
                                'image'
                            )
                        }
                        className="bg-secondary inline-flex w-full items-center justify-center rounded px-4 py-2 text-white"
                    >
                        {downloading === 'image' ? <Loading size="sm" className="ml-1" /> : null}
                        دانلود تصویر قرارداد
                    </Button>
                    <Button
                        onClick={() =>
                            downloadAsFile('/bank-contract.pdf', 'bank-contract.pdf', 'pdf')
                        }
                        className="bg-secondary inline-flex w-full items-center justify-center rounded px-4 py-2 text-white"
                    >
                        {downloading === 'pdf' ? <Loading size="sm" className="ml-1" /> : null}
                        دانلود قرارداد (PDF)
                    </Button>
                </div>
            </Box>

            <label className="flex items-center gap-3">
                <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                />
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
