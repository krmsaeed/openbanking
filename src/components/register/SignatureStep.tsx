'use client';

import { useSignatureStep } from '@/hooks/useSignatureStep';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Box, Typography } from '../ui/core';
import { Button } from '../ui/core/Button';
import LoadingButton from '../ui/core/LoadingButton';

export function SignatureStep() {
    const {
        canvasRef,
        isLoading,
        hasSignature,
        startDrawing,
        draw,
        stopDrawing,
        clearSignature,
        handleSubmit,
    } = useSignatureStep();

    return (
        <Box className="space-y-4">
            <Box className="dark:bg-primary h-[25rem] w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-1 md:h-96">
                <canvas
                    ref={canvasRef}
                    className="bg-dark-900 h-full w-full cursor-crosshair touch-none rounded"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    height={500}
                />
            </Box>

            <Box className="flex items-center justify-between rounded-lg bg-gray-200 px-3 py-2">
                <Typography variant="caption" className="font-bold text-gray-800">
                    امضای خود را در کادر بالا بکشید
                </Typography>
                <Button
                    onClick={clearSignature}
                    disabled={!hasSignature}
                    className="bg-error-400 items-between flex gap-x-2 gap-y-4"
                >
                    <TrashIcon className="h-4 w-4" />
                    پاک کردن
                </Button>
            </Box>

            <Box className="w-full" />
            <Box className="flex items-center justify-between gap-4">
                <Box className="flex w-full items-center gap-2">
                    <LoadingButton
                        onClick={handleSubmit}
                        disabled={!hasSignature || isLoading}
                        loading={isLoading}
                        className="bg-primary-600 hover:bg-primary-700 flex w-full items-center justify-center gap-3 px-5 py-3 text-white"
                    >
                        {!isLoading && <CheckIcon className="h-5 w-5" />}
                        <Typography variant="body1" className="text-xs font-medium text-white">
                            {isLoading ? 'در حال ارسال...' : 'تایید'}
                        </Typography>
                    </LoadingButton>
                </Box>
            </Box>
        </Box>
    );
}
