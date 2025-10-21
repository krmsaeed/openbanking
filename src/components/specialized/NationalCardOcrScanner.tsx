'use client';

import { Box, Typography } from '@/components/ui';
import { Button } from '@/components/ui/core/Button';
import { Modal } from '@/components/ui/overlay';
import { OcrFields, ocrRecognizeFile, parseNationalCardFields } from '@/lib/ocr';
import { ArrowPathIcon, CameraIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

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
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [ocrValid, setOcrValid] = useState<boolean>(false);
    const [ocrLoading, setOcrLoading] = useState<boolean>(false);
    const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);

    const refreshDevices = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
            const devices = await navigator.mediaDevices.enumerateDevices();
            const allVids = devices.filter((d) => d.kind === 'videoinput');
            const preferUsb = process.env.NODE_ENV === 'development';
            let vids: MediaDeviceInfo[] = [];
            if (preferUsb) {
                vids = allVids.filter((v) => /usb|external|webcam/i.test(v.label));
                if (vids.length === 0) vids = allVids;
            } else {
                vids = allVids;
            }
            if (!selectedDeviceId && vids.length > 0) setSelectedDeviceId(vids[0].deviceId);
        } catch (e) {
            console.warn('refreshDevices failed', e);
        }
    }, [selectedDeviceId]);

    const openDeviceById = useCallback(
        async (deviceId: string, remember = false) => {
            setIsCameraOpen(true);
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
                try {
                    streamRef.current?.getTracks().forEach((t) => t.stop());
                } catch {}
                const s = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: deviceId } },
                    audio: false,
                });
                streamRef.current = s;
                if (videoRef.current) videoRef.current.srcObject = s;
                try {
                    const id = s.getVideoTracks()?.[0]?.getSettings?.()?.deviceId as
                        | string
                        | undefined;
                    if (id) setSelectedDeviceId(id);
                    else setSelectedDeviceId(deviceId);
                } catch {
                    setSelectedDeviceId(deviceId);
                }

                if (remember && process.env.NODE_ENV === 'development') {
                    localStorage.setItem('preferredUsbCameraId', deviceId);
                }
                try {
                    await refreshDevices();
                } catch {}
            } catch (e) {
                console.warn('openDeviceById failed', e);
                toast.error('باز کردن وبکم با خطا مواجه شد');
            }
        },
        [refreshDevices]
    );

    const requestCameraPermission = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error('دوربین در این مرورگر پشتیبانی نمی‌شود');
                return false;
            }
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            try {
                s.getTracks().forEach((t) => t.stop());
            } catch {}
            setPermissionGranted(true);
            setShowPermissionModal(false);
            try {
                await refreshDevices();
            } catch {}
            return true;
        } catch {
            setPermissionGranted(false);
            toast.error('دسترسی دوربین داده نشد');
            try {
                await refreshDevices();
            } catch {}
            return false;
        }
    }, [refreshDevices]);

    const handleRequestPermission = useCallback(() => {
        setShowPermissionModal(true);
    }, []);

    useEffect(() => {
        let mounted = true;
        const tryAutoOpen = async () => {
            if (!autoOpen || !selectedDeviceId || isCameraOpen) return;
            try {
                type PermissionStatusLike = { state?: string };
                type PermissionsLike = {
                    query?: (desc: { name: string }) => Promise<PermissionStatusLike>;
                };
                const nav = navigator as unknown as { permissions?: PermissionsLike };
                if (nav.permissions && typeof nav.permissions.query === 'function') {
                    try {
                        const res = await nav.permissions.query({ name: 'camera' });
                        if (!mounted) return;
                        if (res && res.state === 'granted') {
                            await openDeviceById(selectedDeviceId);
                        }
                    } catch {}
                } else {
                    try {
                        await openDeviceById(selectedDeviceId);
                    } catch {}
                }
            } catch (err) {
                console.warn('auto-open check failed', err);
            }
        };
        tryAutoOpen();
        return () => {
            mounted = false;
        };
    }, [selectedDeviceId, isCameraOpen, openDeviceById, autoOpen]);

    useEffect(() => {
        const localVideo = videoRef.current;
        refreshDevices();
        (async () => {
            try {
                await requestCameraPermission();
            } catch {}
        })();
        return () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                    setIsCameraOpen(false);
                }
                if (localVideo) localVideo.srcObject = null;
            } catch {}
        };
    }, [refreshDevices, requestCameraPermission]);

    useEffect(() => {
        if (!permissionGranted || !selectedDeviceId) return;

        if (process.env.NODE_ENV === 'development') {
            (async () => {
                try {
                    await openDeviceById(selectedDeviceId);
                } catch (e) {
                    console.warn('auto-open after permission failed', e);
                }
            })();
        }
    }, [permissionGranted, selectedDeviceId, openDeviceById]);

    const processOcr = async (file: File) => {
        setOcrLoading(true);
        try {
            const text = await ocrRecognizeFile(file);
            const fields = parseNationalCardFields(text);
            const ok = !!(fields.nationalId && /^\d{10}$/.test(fields.nationalId));
            setOcrValid(!!ok);
            if (!ok) toast.error('تصویر کارت ملی مطابق الگو تشخیص داده نشد');

            if (onCapture) {
                onCapture(file, ok, fields);
            }

            // If OCR looks valid, automatically confirm the capture for the parent
            // (instead of requiring the user to press a confirm button)
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
    };
    const handleCapture = () => {
        if (ocrLoading) return;
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        const w = video.videoWidth || 700;
        const h = video.videoHeight || 300;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                const file = new File([blob], `national-card-${Date.now()}.jpg`, {
                    type: blob.type,
                });
                const url = URL.createObjectURL(file);
                if (capturedUrl) URL.revokeObjectURL(capturedUrl);
                setCapturedUrl(url);

                processOcr(file);

                try {
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach((t) => t.stop());
                        streamRef.current = null;
                        setIsCameraOpen(false);
                    }
                    if (videoRef.current) videoRef.current.srcObject = null;
                } catch {}
            },
            'image/jpeg',
            0.9
        );
    };

    const handleReset = async () => {
        if (capturedUrl) {
            URL.revokeObjectURL(capturedUrl);
            setCapturedUrl(null);
            setOcrValid(false);
        }

        try {
            if (selectedDeviceId) {
                const s = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: selectedDeviceId } },
                    audio: false,
                });
                streamRef.current = s;
                if (videoRef.current) videoRef.current.srcObject = s;
                setIsCameraOpen(true);
            } else {
                toast.error('وبکم انتخاب نشده');
            }
        } catch (err) {
            console.warn('failed to restart camera', err);
            toast.error('دوربین بازنشانی نشد');
        }
    };

    return (
        <Box className="space-y-3">
            <Box className="relative overflow-hidden rounded bg-black">
                {!capturedUrl ? (
                    isCameraOpen ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full border-2 border-dashed bg-gray-200 p-1 sm:object-cover md:h-64"
                        />
                    ) : (
                        <Box
                            className="flex h-64 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
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
                    <Box className="relative h-64 w-full">
                        <Image
                            src={capturedUrl}
                            alt="preview"
                            fill
                            style={{ objectFit: 'contain' }}
                            unoptimized
                        />

                        {!ocrLoading && (
                            <Box className="absolute top-2 left-2">
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
                        disabled={ocrLoading || !isCameraOpen}
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
                            className="bg-warning-600 cursor-pointer text-white"
                        >
                            <ArrowPathIcon className="ml-2 h-5 w-5" />
                            <span>بازنشانی</span>
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Modal for Camera Permission */}
            <Modal
                isOpen={showPermissionModal}
                onClose={() => setShowPermissionModal(false)}
                title="دسترسی به دوربین"
                size="md"
            >
                <Box className="space-y-6 p-2 text-center">
                    <Box className="from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-700 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br">
                        <CameraIcon className="text-primary-600 h-10 w-10 dark:text-blue-400" />
                    </Box>

                    <Box className="space-y-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            دسترسی به دوربین
                        </h3>
                        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
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
