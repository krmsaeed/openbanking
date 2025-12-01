'use client';

import { Box, Typography } from '@/components/ui';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { Button } from '@/components/ui/core/Button';
import { Modal } from '@/components/ui/overlay';
import { useCamera } from '@/hooks/useCamera';
import { OcrFields, ocrRecognizeFile, parseNationalCardFields } from '@/lib/ocr';
import { ArrowPathIcon, CameraIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

type Props = {
    onCapture?: (file: File, isValid: boolean, fields?: OcrFields) => void;
    onConfirm?: (file: File, isValid: boolean) => void;
    autoOpen?: boolean;
    showConfirmButton?: boolean;
    fileError?: string | null;
};

export default function NationalCardOcrScanner({
    onCapture,
    onConfirm,
    autoOpen = true,
    fileError = null,
}: Props) {
    const {
        videoRef,
        canvasRef,
        isActive: isCameraOpen,
        startCamera,
        stopCamera,
        takePhoto,
    } = useCamera({
        video: {
            facingMode: 'environment',
        },
        audio: false,
    });

    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [ocrValid, setOcrValid] = useState<boolean>(false);
    const [ocrLoading, setOcrLoading] = useState<boolean>(false);
    const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
    const [captureLocked, setCaptureLocked] = useState<boolean>(false);

    const handleRequestPermission = useCallback(async () => {
        setShowPermissionModal(true);
    }, []);

    const requestCameraPermission = useCallback(async () => {
        try {
            await startCamera();
            setShowPermissionModal(false);
            return true;
        } catch {
            setShowPermissionModal(true);
            return false;
        }
    }, [startCamera]);

    useEffect(() => {
        if (autoOpen && !isCameraOpen && !capturedUrl) {
            startCamera().catch(() => { });
        }
    }, [autoOpen, isCameraOpen, capturedUrl, startCamera]);

    useEffect(() => {
        if (isCameraOpen && !capturedUrl) {
            setCaptureLocked(false);
        }
    }, [isCameraOpen, capturedUrl]);

    const processOcr = useCallback(
        async (file: File) => {
            setOcrLoading(true);
            try {
                const text = await ocrRecognizeFile(file);
                const fields = parseNationalCardFields(text);
                const nationalIdClean = fields.nationalId?.replace(/\s+/g, '') || '';
                const ok = !!(nationalIdClean && /^\d{6,12}$/.test(nationalIdClean));
                setOcrValid(!!ok);

                if (onCapture) {
                    onCapture(file, ok, fields);
                }

                if (ok && onConfirm) {
                    try {
                        onConfirm(file, true);
                    } catch (e) {
                        console.warn('onConfirm handler threw', e);
                    }
                }

                return { text, fields, valid: ok };
            } catch (e) {
                console.warn('ocr failed', e);
                setOcrValid(false);
                if (onCapture) {
                    onCapture(file, false);
                }
                return { text: '', fields: null, valid: false };
            } finally {
                setOcrLoading(false);
            }
        },
        [onCapture, onConfirm]
    );
    const handleCapture = useCallback(() => {
        if (ocrLoading || captureLocked) return;

        setCaptureLocked(true);

        takePhoto((file) => {
            const url = URL.createObjectURL(file);
            if (capturedUrl) URL.revokeObjectURL(capturedUrl);
            setCapturedUrl(url);
            processOcr(file);
            stopCamera();
        });
    }, [ocrLoading, captureLocked, takePhoto, capturedUrl, stopCamera, processOcr]);

    const handleReset = useCallback(async () => {
        if (capturedUrl) {
            URL.revokeObjectURL(capturedUrl);
            setCapturedUrl(null);
            setOcrValid(false);
        }

        setCaptureLocked(false);

        stopCamera();
        try {
            const granted = await requestCameraPermission();
            if (!granted) {
                showDismissibleToast('برای گرفتن عکس جدید اجازه‌ی دوربین لازم است', 'error');
            }
        } catch (err) {
            console.warn('failed to restart camera', err);
            showDismissibleToast('دوربین بازنشانی نشد', 'error');
        }
    }, [capturedUrl, requestCameraPermission, stopCamera]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return (
        <Box className="space-y-3">
            <Box className="relative overflow-hidden">
                {!capturedUrl ? (
                    isCameraOpen ? (
                        <Box className="rounded-lg border-2 border-dashed bg-gray-200">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="max-h-[350px] w-full rounded-lg object-cover p-1 md:h-64"
                            />
                        </Box>
                    ) : (
                        <Box
                            className="flex h-64 max-h-[350px] w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            onClick={handleRequestPermission}
                        >
                            <Box className="space-y-2 text-center">
                                <CameraIcon className="mx-auto h-12 w-12" />
                                <Typography variant="p" className="text-sm">
                                    برای فعال‌سازی دوربین کلیک کنید
                                </Typography>
                            </Box>
                        </Box>
                    )
                ) : (
                    <Box className="relative h-72 max-h-[350px] w-full rounded-lg border-2 border-dashed border-gray-900">
                        <Box className="m-auto h-full w-full rounded-lg">
                            <Image
                                src={capturedUrl}
                                alt="preview"
                                fill
                                className="rounded-lg object-cover p-1"
                                unoptimized
                            />
                        </Box>

                        {!ocrLoading && (
                            <Box className="absolute top-2 left-2 rounded-lg">
                                {ocrValid ? (
                                    <Box className="bg-success-500 flex items-center rounded-full border-2 border-white p-1 text-white shadow-xl backdrop-blur-sm">
                                        <CheckIcon className="h-6 w-6 font-bold" />
                                    </Box>
                                ) : (
                                    <Box className="flex items-center rounded-full border-2 border-white bg-rose-500 p-1 text-white backdrop-blur-lg">
                                        <XMarkIcon className="h-6 w-6 font-bold" />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {ocrLoading && (
                    <Box className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Box className="flex flex-col items-center gap-2">
                            <svg className="h-10 w-10 animate-spin text-white" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                            <Box className="text-sm text-white">در حال پردازش ...</Box>
                        </Box>
                    </Box>
                )}
            </Box>
            {<Typography className="text-sm text-red-600">{fileError}</Typography>}

            <Box className="flex items-center justify-center gap-2">
                {!capturedUrl && (
                    <Button
                        onClick={handleCapture}
                        size="sm"
                        variant="success"
                        disabled={ocrLoading || !isCameraOpen || captureLocked}
                        loading={ocrLoading}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <CameraIcon className="h-5 w-5" />
                            گرفتن عکس
                        </span>
                    </Button>
                )}

                {capturedUrl && (
                    <Box className="flex flex-col items-center gap-2">
                        <Button
                            size="sm"
                            onClick={handleReset}
                            disabled={ocrLoading && !ocrValid}
                            loading={ocrLoading}
                            className="bg-warning-700 cursor-pointer text-white"
                        >
                            <ArrowPathIcon className="ml-2 h-5 w-5" />
                            <span>بازنشانی</span>
                        </Button>
                    </Box>
                )}
            </Box>
            <Modal
                isOpen={showPermissionModal}
                onClose={() => setShowPermissionModal(false)}
                title="دسترسی به دوربین"
                size="md"
            >
                <Box className="space-y-2 p-2 text-center">
                    <Box className="from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-700 mx-auto flex items-center justify-center rounded-full bg-linear-to-br">
                        <CameraIcon className="text-primary-600 h-10 w-10 dark:text-blue-400" />
                    </Box>

                    <Box className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            دسترسی به دوربین
                        </h3>
                        <p className="leading-relaxed text-gray-600">
                            برای اسکن کارت ملی، نیاز به دسترسی دوربین دستگاه داریم. لطفاً در پنجره
                            بازشده دسترسی را تأیید کنید.
                        </p>
                    </Box>

                    <Box className="bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-800 rounded-lg border p-4">
                        <p className="text-secondary-800 dark:text-secondary-200 text-sm">
                            <strong>راهنما:</strong> اگر دسترسی داده نشد، از تنظیمات مرورگر دسترسی
                            دوربین را فعال کنید.
                        </p>
                    </Box>

                    <Box className="flex justify-center gap-3">
                        <Button
                            onClick={() => setShowPermissionModal(false)}
                            variant="secondary"
                            size="sm"
                        >
                            انصراف
                        </Button>
                        <Button onClick={requestCameraPermission} variant="primary" size="sm">
                            <CameraIcon className="ml-2 h-4 w-4" />
                            فعال‌سازی دوربین
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
