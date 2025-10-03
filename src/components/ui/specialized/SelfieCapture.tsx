'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../core/Button';
import { Card, CardContent, CardHeader } from '../core/Card';
import { Box, Typography } from '../core';
import { Loading } from '../feedback/Loading';
import Image from 'next/image';

interface SelfieCaptureProps {
    onComplete: (selfieFile: File) => void;
    onCancel: () => void;
    title?: string;
    description?: string;
}

export function SelfieCapture({
    onComplete,
    onCancel,
    title = 'گرفتن عکس سلفی',
    description = 'برای تأیید هویت، عکس سلفی بگیرید',
}: SelfieCaptureProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cameraStarted, setCameraStarted] = useState(false);

    const startCamera = async () => {
        setLoading(true);
        setError(null);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
            });

            setStream(mediaStream);
            setCameraStarted(true);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch {
            setError('دسترسی به دوربین امکان‌پذیر نیست. لطفاً مجوز دوربین را بدهید.');
        } finally {
            setLoading(false);
        }
    };

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
        setCameraStarted(false);
    }, [stream]);

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        setSelfieImage(dataURL);
        stopCamera();
    };

    const retakePhoto = () => {
        setSelfieImage(null);
        startCamera();
    };
    const confirmPhoto = async () => {
        if (!selfieImage) return;
        setLoading(true);
        try {
            const res = await fetch(selfieImage);
            const blob = await res.blob();
            type MaybeCrypto = { crypto?: { randomUUID?: () => string } };
            const maybe = globalThis as unknown as MaybeCrypto;
            const uuid =
                maybe?.crypto && typeof maybe.crypto.randomUUID === 'function'
                    ? maybe.crypto.randomUUID()
                    : Date.now().toString(36);
            const filename = `selfie_${uuid}.jpg`;
            const file = new File([blob], filename, { type: 'image/jpeg' });
            onComplete(file);
        } catch {
            setError('خطا در پردازش عکس');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return (
        <Card padding="lg" className="mx-auto w-full max-w-md">
            <CardHeader>
                <Box className="text-center">
                    <Box className="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                        <CameraIcon className="h-8 w-8 text-white" />
                    </Box>
                    <Typography variant="h6" className="mb-2">
                        {title}
                    </Typography>
                    <Typography variant="body2" color="secondary">
                        {description}
                    </Typography>
                </Box>
            </CardHeader>

            <CardContent>
                <Box className="space-y-6">
                    {error && (
                        <Box className="rounded-lg border border-red-200 bg-red-50 p-3">
                            <Typography
                                variant="caption"
                                className="block text-center text-red-800"
                            >
                                {error}
                            </Typography>
                        </Box>
                    )}

                    {!cameraStarted && !selfieImage && (
                        <Box className="space-y-4 text-center">
                            <Box className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12">
                                <CameraIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                <Typography variant="body2" color="secondary" className="mb-4">
                                    برای شروع گرفتن عکس، روی دکمه زیر کلیک کنید
                                </Typography>
                                <Button
                                    onClick={startCamera}
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    {loading ? (
                                        <Loading size="sm" />
                                    ) : (
                                        <CameraIcon className="h-5 w-5" />
                                    )}
                                    شروع دوربین
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {cameraStarted && stream && !selfieImage && (
                        <Box className="space-y-4">
                            <Box className="relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full rounded-xl border border-gray-300 bg-black"
                                    style={{ transform: 'scaleX(-1)' }}
                                />
                                <Box className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <Box className="h-60 w-48 rounded-full border-2 border-dashed border-white opacity-50"></Box>
                                </Box>
                            </Box>

                            <Box className="bg-primary-50 border-primary-200 rounded-lg border p-3">
                                <Typography
                                    variant="caption"
                                    className="text-primary-800 block text-center"
                                >
                                    صورت خود را داخل دایره قرار دهید و روی دکمه عکس کلیک کنید
                                </Typography>
                            </Box>

                            <Box className="flex gap-3">
                                <Button variant="outline" onClick={stopCamera} className="flex-1">
                                    <XMarkIcon className="ml-2 h-4 w-4" />
                                    لغو
                                </Button>
                                <Button
                                    onClick={capturePhoto}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    <CameraIcon className="ml-2 h-5 w-5" />
                                    عکس بگیر
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {selfieImage && (
                        <Box className="space-y-4">
                            <Box className="relative">
                                <Image
                                    src={selfieImage}
                                    alt="Selfie"
                                    width={400}
                                    height={300}
                                    className="w-full rounded-xl border border-gray-300"
                                    style={{ transform: 'scaleX(-1)' }}
                                />
                            </Box>

                            <Box className="rounded-lg border border-green-200 bg-green-50 p-3">
                                <Typography
                                    variant="caption"
                                    className="block text-center text-green-800"
                                >
                                    عکس با موفقیت گرفته شد. اگر از کیفیت راضی هستید تأیید کنید
                                </Typography>
                            </Box>

                            <Box className="flex gap-3">
                                <Button variant="outline" onClick={retakePhoto} className="flex-1">
                                    <ArrowPathIcon className="ml-2 h-4 w-4" />
                                    عکس دوباره
                                </Button>
                                <Button
                                    onClick={confirmPhoto}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    loading={loading}
                                    disabled={loading}
                                >
                                    {!loading && <CheckIcon className="ml-2 h-4 w-4" />}
                                    {loading ? 'در حال ارسال...' : 'تأیید عکس'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    <Box className="border-t border-gray-200 pt-4 text-center">
                        <Button variant="ghost" onClick={onCancel}>
                            انصراف و بازگشت
                        </Button>
                    </Box>
                </Box>
            </CardContent>

            <canvas ref={canvasRef} className="hidden" />
        </Card>
    );
}
