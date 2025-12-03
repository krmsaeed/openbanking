'use client';

import { useUser } from '@/contexts/UserContext';
import { useSignatureStep } from '@/hooks/useSignatureStep';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { convertToFile, createBPMSFormData } from '@/lib/fileUtils';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import { TrashIcon } from '@heroicons/react/24/outline';
import httpClient from '@/lib/httpClient';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Box, Typography } from '../ui/core';
import { Button } from '../ui/core/Button';
import LoadingButton from '../ui/core/LoadingButton';
export function SignatureStep() {
    const { canvasRef, hasSignature, startDrawing, draw, stopDrawing, clearSignature } =
        useSignatureStep();
    const { userData, setUserData, clearUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const handleSubmit = async () => {
        setIsLoading(true);
        const canvas = canvasRef.current;
        const file = await convertToFile(canvas, 'signature', 'image/png', 1.0);
        const formData = createBPMSFormData(
            file!,
            'virtual-open-deposit',
            userData.processId,
            'VideoInquiry'
        );

        await httpClient
            .post('/api/bpms/deposit-files', formData)
            .then(() => {
                setUserData({ ...userData, step: 5 });
            })
            .catch(async (error) => {
                const message = await resolveCatalogMessage(
                    error.response?.data,
                    'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
                );
                showDismissibleToast(message, 'error');
                clearUserData();
                router.push('/');
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <Box className="space-y-4">
            <Box className="dark:bg-primary h-100 w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-1 md:h-96">
                <canvas
                    ref={canvasRef}
                    className="bg-dark-900 touch-no const [transitionLoading, setTransitionLoading] = useState(false);ne h-full w-full cursor-crosshair rounded"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    height={500}
                />
            </Box>

            <Box className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2">
                <Typography variant="caption" className="font-bold text-gray-800">
                    امضای خود را در کادر بالا بکشید
                </Typography>
                <Button
                    onClick={clearSignature}
                    disabled={!hasSignature || isLoading}
                    className="bg-warning-700 items-between flex cursor-pointer gap-x-2 gap-y-4 text-white"
                >
                    <TrashIcon className="h-4 w-4" />
                    <Typography className="hidden md:inline"> پاک کردن</Typography>
                </Button>
            </Box>

            <Box className="w-full" />
            <Box className="flex items-center justify-between gap-4">
                <Box className="flex w-full items-center gap-2">
                    <LoadingButton
                        onClick={handleSubmit}
                        disabled={!hasSignature || isLoading}
                        loading={isLoading}
                    />
                </Box>
            </Box>
        </Box>
    );
}
