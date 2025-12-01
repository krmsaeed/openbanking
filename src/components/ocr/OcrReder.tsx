'use client';

import { Box } from '@/components/ui';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { ocrRecognizeFile, parseNationalCardFields } from '@/lib/ocr';
import { getCookie, setCookie } from '@/lib/utils';
import Image from 'next/image';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';

type Props = {
    onRecognize?: (text: string, file?: File) => void;
    showControls?: boolean;
};

export default function OcrReader({ onRecognize, showControls = true }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const capturedUrlRef = useRef<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [ocrChecked, setOcrChecked] = useState(false);
    const [ocrValid, setOcrValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);

    const clearPreview = useCallback(() => {
        if (capturedUrlRef.current) {
            URL.revokeObjectURL(capturedUrlRef.current);
            capturedUrlRef.current = null;
        }
        setCapturedUrl(null);
    }, []);

    const updatePreviewFromFile = useCallback((file: File) => {
        const nextUrl = URL.createObjectURL(file);
        if (capturedUrlRef.current) {
            URL.revokeObjectURL(capturedUrlRef.current);
        }
        capturedUrlRef.current = nextUrl;
        setCapturedUrl(nextUrl);
    }, []);

    const cleanupStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    }, []);

    const applyStream = useCallback(
        (stream: MediaStream) => {
            cleanupStream();
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraActive(true);
        },
        [cleanupStream]
    );

    const startWithConstraints = useCallback(
        async (constraints: MediaStreamConstraints) => {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            applyStream(stream);
            return stream;
        },
        [applyStream]
    );

    const startStream = useCallback(async () => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
            setErrorMessage('دسترسی به دوربین توسط مرورگر پشتیبانی نمی‌شود');
            return;
        }

        setErrorMessage(null);

        const savedDevice = getCookie('preferredUsbCameraId');
        if (savedDevice) {
            try {
                await startWithConstraints({ video: { deviceId: { exact: savedDevice } }, audio: false });
                return;
            } catch (error) {
                console.warn('Saved camera unavailable', error);
            }
        }

        try {
            await startWithConstraints({ video: true, audio: false });

            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const usbCamera = devices
                    .filter((device) => device.kind === 'videoinput')
                    .find((device) => /usb|external|webcam/i.test(device.label));

                if (usbCamera?.deviceId) {
                    await startWithConstraints({
                        video: { deviceId: { exact: usbCamera.deviceId } },
                        audio: false,
                    });
                    setCookie('preferredUsbCameraId', usbCamera.deviceId);
                }
            } catch (deviceError) {
                console.warn('Unable to enumerate cameras', deviceError);
            }
        } catch (error) {
            console.warn('Default camera failed', error);
            try {
                await startWithConstraints({ video: { facingMode: 'environment' }, audio: false });
            } catch (fallbackError) {
                console.error('Camera initialization failed', fallbackError);
                setErrorMessage('دسترسی به دوربین امکان‌پذیر نیست');
                showDismissibleToast('دسترسی به دوربین امکان‌پذیر نیست', 'error');
            }
        }
    }, [startWithConstraints]);

    const processOcr = useCallback(
        async (file: File, shouldUpdatePreview = true) => {
            setLoading(true);
            setErrorMessage(null);
            setOcrChecked(false);
            setOcrValid(false);

            try {
                if (shouldUpdatePreview) {
                    updatePreviewFromFile(file);
                }

                const text = await ocrRecognizeFile(file);
                const fields = parseNationalCardFields(text);
                const normalizedId = fields.nationalId?.replace(/\s+/g, '');
                const isValid = !!(normalizedId && /^\d{10}$/.test(normalizedId));

                setOcrChecked(true);
                setOcrValid(isValid);
                onRecognize?.(text, file);
            } catch (error) {
                console.error('OCR processing failed', error);
                setOcrChecked(true);
                setOcrValid(false);
                setErrorMessage('پردازش کارت ملی با مشکل مواجه شد. لطفاً دوباره تلاش کنید.');
                showDismissibleToast('پردازش کارت ملی با مشکل مواجه شد. لطفاً دوباره تلاش کنید.', 'error');
            } finally {
                setLoading(false);
            }
        },
        [onRecognize, updatePreviewFromFile]
    );

    const handleCapture = useCallback(async () => {
        if (!videoRef.current) return;

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current ?? document.createElement('canvas');
            const width = video.videoWidth || 1280;
            const height = video.videoHeight || 720;

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas context unavailable');
            }

            ctx.drawImage(video, 0, 0, width, height);

            const file = await new Promise<File>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Unable to capture frame'));
                            return;
                        }
                        resolve(new File([blob], `ocr-${Date.now()}.jpg`, { type: blob.type }));
                    },
                    'image/jpeg',
                    0.9
                );
            });

            cleanupStream();
            await processOcr(file);
        } catch (error) {
            console.error('Capture failed', error);
            showDismissibleToast('گرفتن عکس با مشکل مواجه شد', 'error');
        }
    }, [cleanupStream, processOcr]);

    const handleFileUpload = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            void processOcr(file);
            event.target.value = '';
        },
        [processOcr]
    );

    const stopCamera = useCallback(() => {
        cleanupStream();
    }, [cleanupStream]);

    const restartCamera = useCallback(async () => {
        cleanupStream();
        clearPreview();
        await startStream();
    }, [cleanupStream, clearPreview, startStream]);

    useEffect(() => {
        startStream();
        return () => {
            cleanupStream();
            clearPreview();
        };
    }, [startStream, cleanupStream, clearPreview]);

    useEffect(() => {
        return () => {
            if (capturedUrlRef.current) {
                URL.revokeObjectURL(capturedUrlRef.current);
            }
        };
    }, []);

    return (
        <Box className="space-y-4">
            <Box className="mx-auto w-full max-w-xl">
                <Box className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 p-2">
                    {capturedUrl ? (
                        <Image
                            src={capturedUrl}
                            alt="OCR capture preview"
                            width={640}
                            height={256}
                            className="h-64 w-full rounded-md object-cover"
                            unoptimized
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-64 w-full rounded-md border border-dashed border-gray-300 object-cover"
                        />
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                </Box>

                {showControls && (
                    <Box className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleCapture}
                            disabled={loading || !cameraActive}
                            className="rounded bg-primary-600 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            گرفتن عکس
                        </button>
                        <button
                            type="button"
                            onClick={stopCamera}
                            disabled={!cameraActive}
                            className="rounded bg-gray-200 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            توقف دوربین
                        </button>
                        <button
                            type="button"
                            onClick={restartCamera}
                            disabled={loading}
                            className="rounded bg-gray-100 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            راه‌اندازی مجدد
                        </button>
                        <label className="cursor-pointer rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                            آپلود عکس
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </Box>
                )}

                {loading && <p className="mt-2 text-sm text-gray-600">در حال پردازش...</p>}
                {errorMessage && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                        {errorMessage}
                    </p>
                )}
                {ocrChecked && (
                    <Box className="mt-3">
                        <Box
                            className={`inline-block rounded px-3 py-1 ${ocrValid ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                        >
                            {ocrValid ? 'کارت ملی معتبر' : 'کارت ملی نامعتبر'}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
