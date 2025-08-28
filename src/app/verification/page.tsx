"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
    CameraIcon,
    ArrowRightIcon,
    DocumentIcon,
    CheckCircleIcon,
    XCircleIcon
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/core/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/core/Card";
import { Loading } from "@/components/ui/feedback/Loading";

export default function Verification() {
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
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            alert('دسترسی به دوربین امکان‌پذیر نیست');
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
            stream.getTracks().forEach(track => track.stop());
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
                router.push(isRegister ? "/dashboard" : "/");
            }, 3000);
        } else {
            alert(step === 1 ? "لطفاً امضای خود را ثبت کنید" : "لطفاً عکس سلفی بگیرید");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card padding="lg" className="max-w-md w-full">
                    <CardContent className="text-center">
                        <Loading className="mx-auto mb-6" />
                        <CardTitle className="mb-4">
                            در حال بررسی اطلاعات
                        </CardTitle>
                        <CardDescription>
                            لطفاً صبر کنید...
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="max-w-lg w-full">

                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8"
                >
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                    بازگشت
                </Button>

                <Card padding="lg">
                    <CardHeader>
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            {step === 1 ? (
                                <DocumentIcon className="h-6 w-6 text-white" />
                            ) : (
                                <CameraIcon className="h-6 w-6 text-white" />
                            )}
                        </div>

                        <CardTitle className="text-center">
                            تأیید هویت
                        </CardTitle>
                        <CardDescription className="text-center">
                            {step === 1 ? "امضای خود را ثبت کنید" : "عکس سلفی بگیرید"}
                        </CardDescription>

                        <div className="flex items-center justify-center mt-6">
                            <div className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    1
                                </div>
                                <div className={`w-16 h-1 mx-2 transition-colors ${step >= 2 ? 'bg-purple-600' : 'bg-gray-200'
                                    }`} />
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    2
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        ثبت امضا
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        امضای خود را در کادر زیر بکشید
                                    </p>
                                </div>

                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={200}
                                        className="w-full h-48 border border-gray-300 rounded-lg bg-white cursor-crosshair"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
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
                                        تأیید امضا
                                    </Button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        عکس سلفی
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-6">
                                        برای تأیید هویت، عکس سلفی بگیرید
                                    </p>
                                </div>

                                {!selfieImage && !stream && (
                                    <div className="text-center">
                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 bg-gray-50">
                                            <CameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                            <Button onClick={startCamera}>
                                                <CameraIcon className="h-5 w-5 ml-2" />
                                                شروع دوربین
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {stream && !selfieImage && (
                                    <div className="text-center space-y-4">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            className="w-full max-w-sm mx-auto rounded-xl border border-gray-300"
                                        />
                                        <Button onClick={capturePhoto}>
                                            <CameraIcon className="h-5 w-5 ml-2" />
                                            گرفتن عکس
                                        </Button>
                                    </div>
                                )}

                                {selfieImage && (
                                    <div className="text-center space-y-4">
                                        <img
                                            src={selfieImage}
                                            alt="Selfie"
                                            className="w-full max-w-sm mx-auto rounded-xl border border-gray-300"
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={retakePhoto}
                                                className="flex-1"
                                            >
                                                گرفتن مجدد
                                            </Button>
                                            <Button
                                                onClick={handleNext}
                                                className="flex-1"
                                            >
                                                تأیید عکس
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
