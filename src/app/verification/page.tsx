'use client';

import { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { CameraIcon, ArrowRightIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/core/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/core/Card';
import { Box, Typography } from '@/components/ui';
import { Loading } from '@/components/ui/feedback/Loading';
import Image from 'next/image';

function VerificationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRegister = searchParams?.get('type') === 'register';

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [signatureImage, setSignatureImage] = useState<string | null>(null);
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL();
        setSignatureImage(dataURL);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureImage(null);
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch {
            toast.error('دسترسی به دوربین امکان‌پذیر نیست');
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        if (!video) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const dataURL = canvas.toDataURL();
        setSelfieImage(dataURL);

        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
    };

    const retakePhoto = () => {
        setSelfieImage(null);
        startCamera();
    };

    const handleNext = () => {
        if (step === 1 && signatureImage) {
            setStep(2);
        } else if (step === 2 && selfieImage) {
            setLoading(true);
            setTimeout(() => {
                router.push(isRegister ? '/' : '/');
            }, 3000);
        } else {
            toast.error(step === 1 ? 'لطفاً امضای خود را ثبت کنید' : 'لطفاً عکس سلفی بگیرید');
        }
    };

    if (loading) {
        return (
            <Box className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
                <Card padding="lg" className="w-full max-w-md">
                    <CardContent className="text-center">
                        <Loading className="mx-auto mb-6" />
                        <Typography variant="h6" className="mb-4">
                            در حال بررسی اطلاعات
                        </Typography>
                        <Typography variant="body2" color="muted">
                            لطفاً صبر کنید...
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
            <Box className="w-full max-w-lg">
                <Button variant="ghost" onClick={() => router.back()} className="mb-8">
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                    بازگشت
                </Button>

                <Card padding="lg">
                    <CardHeader>
                        <Box className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600">
                            {step === 1 ? (
                                <DocumentIcon className="h-6 w-6 text-white" />
                            ) : (
                                <CameraIcon className="h-6 w-6 text-white" />
                            )}
                        </Box>

                        <Typography variant="h6" className="text-center">
                            تأیید هویت
                        </Typography>
                        <Typography variant="body2" color="muted" className="text-center">
                            {step === 1 ? 'امضای خود را ثبت کنید' : 'عکس سلفی بگیرید'}
                        </Typography>

                        <Box className="mt-6 flex items-center justify-center">
                            <Box className="flex items-center">
                                <Box
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                        step >= 1
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    1
                                </Box>
                                <Box
                                    className={`mx-2 h-1 w-16 transition-colors ${
                                        step >= 2 ? 'bg-purple-600' : 'bg-gray-200'
                                    }`}
                                />
                                <Box
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                        step >= 2
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    2
                                </Box>
                            </Box>
                        </Box>
                    </CardHeader>

                    <CardContent>
                        {step === 1 && (
                            <Box className="space-y-6">
                                <Box className="text-center">
                                    <Typography variant="h5" className="mb-2 text-gray-900">
                                        ثبت امضا
                                    </Typography>
                                    <Typography variant="body2" color="secondary" className="mb-6">
                                        امضای خود را در کادر زیر بکشید
                                    </Typography>
                                </Box>

                                <Box className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={200}
                                        className="h-48 w-full cursor-crosshair rounded-lg border border-gray-300 bg-white"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                    />
                                </Box>

                                <Box className="flex gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={clearSignature}
                                        className="flex-1"
                                    >
                                        پاک کردن
                                    </Button>
                                    <Button
                                        onClick={() => signatureImage && handleNext()}
                                        disabled={!signatureImage}
                                        className="flex-1"
                                    >
                                        تایید امضا
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {step === 2 && (
                            <Box className="space-y-6">
                                <Box className="text-center">
                                    <Typography variant="h5" className="mb-2 text-gray-900">
                                        عکس سلفی
                                    </Typography>
                                    <Typography variant="body2" color="secondary" className="mb-6">
                                        برای تأیید هویت، عکس سلفی بگیرید
                                    </Typography>
                                </Box>

                                {!selfieImage && !stream && (
                                    <Box className="text-center">
                                        <Box className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12">
                                            <CameraIcon className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                                            <Button onClick={startCamera}>
                                                <CameraIcon className="ml-2 h-5 w-5" />
                                                شروع دوربین
                                            </Button>
                                        </Box>
                                    </Box>
                                )}

                                {stream && !selfieImage && (
                                    <Box className="space-y-4 text-center">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            className="mx-auto w-full max-w-sm rounded-xl border border-gray-300"
                                        />
                                        <Button onClick={capturePhoto}>
                                            <CameraIcon className="ml-2 h-5 w-5" />
                                            گرفتن عکس
                                        </Button>
                                    </Box>
                                )}

                                {selfieImage && (
                                    <Box className="space-y-4 text-center">
                                        <Image
                                            src={selfieImage}
                                            width={400}
                                            height={400}
                                            alt="Selfie"
                                            className="mx-auto w-full max-w-sm rounded-xl border border-gray-300"
                                        />
                                        <Box className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={retakePhoto}
                                                className="flex-1"
                                            >
                                                گرفتن مجدد
                                            </Button>
                                            <Button onClick={handleNext} className="flex-1">
                                                تأیید عکس
                                            </Button>
                                        </Box>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}

export default function Verification() {
    return (
        <Suspense fallback={<Loading />}>
            <VerificationContent />
        </Suspense>
    );
}
