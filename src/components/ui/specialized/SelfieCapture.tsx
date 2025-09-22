"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CameraIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../core/Button";
import { Card, CardContent, CardHeader } from "../core/Card";
import { Box, Typography } from "../core";
import { Loading } from "../feedback/Loading";
import Image from "next/image";

interface SelfieCaptureProps {
    onComplete: (selfieFile: File) => void;
    onCancel: () => void;
    title?: string;
    description?: string;
}

export function SelfieCapture({
    onComplete,
    onCancel,
    title = "گرفتن عکس سلفی",
    description = "برای تأیید هویت، عکس سلفی بگیرید"
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
                    height: { ideal: 480 }
                }
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
            stream.getTracks().forEach(track => track.stop());
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

    
    const confirmPhoto = () => {
        if (!selfieImage) return;

        
        fetch(selfieImage)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                onComplete(file);
            })
            .catch(() => {
                setError('خطا در پردازش عکس');
            });
    };

    
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return (
        <Card padding="lg" className="w-full max-w-md mx-auto">
            <CardHeader>
                <Box className="text-center">
                    <Box className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                        <CameraIcon className="w-8 h-8 text-white" />
                    </Box>
                    <Typography variant="h6" className="mb-2">{title}</Typography>
                    <Typography variant="body2" color="secondary">{description}</Typography>
                </Box>
            </CardHeader>

            <CardContent>
                <Box className="space-y-6">
                    {error && (
                        <Box className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <Typography variant="caption" className="text-red-800 text-center block">
                                {error}
                            </Typography>
                        </Box>
                    )}

                    {!cameraStarted && !selfieImage && (
                        <Box className="text-center space-y-4">
                            <Box className="border-2 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50">
                                <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <Typography variant="body2" color="secondary" className="mb-4">
                                    برای شروع گرفتن عکس، روی دکمه زیر کلیک کنید
                                </Typography>
                                <Button
                                    onClick={startCamera}
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    {loading ? <Loading size="sm" /> : <CameraIcon className="h-5 w-5" />}
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
                                <Box className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <Box className="w-48 h-60 border-2 border-white border-dashed rounded-full opacity-50"></Box>
                                </Box>
                            </Box>

                            <Box className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                                <Typography variant="caption" className="text-primary-800 text-center block">
                                    صورت خود را داخل دایره قرار دهید و روی دکمه عکس کلیک کنید
                                </Typography>
                            </Box>

                            <Box className="flex gap-3">
                                <Button variant="outline" onClick={stopCamera} className="flex-1">
                                    <XMarkIcon className="w-4 h-4 ml-2" />
                                    لغو
                                </Button>
                                <Button onClick={capturePhoto} className="flex-1 bg-green-600 hover:bg-green-700">
                                    <CameraIcon className="w-5 h-5 ml-2" />
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

                            <Box className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <Typography variant="caption" className="text-green-800 text-center block">
                                    عکس با موفقیت گرفته شد. اگر از کیفیت راضی هستید تأیید کنید
                                </Typography>
                            </Box>

                            <Box className="flex gap-3">
                                <Button variant="outline" onClick={retakePhoto} className="flex-1">
                                    <ArrowPathIcon className="w-4 h-4 ml-2" />
                                    عکس دوباره
                                </Button>
                                <Button onClick={confirmPhoto} className="flex-1 bg-green-600 hover:bg-green-700">
                                    <CheckIcon className="w-4 h-4 ml-2" />
                                    تأیید عکس
                                </Button>
                            </Box>
                        </Box>
                    )}

                    <Box className="text-center pt-4 border-t border-gray-200">
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
