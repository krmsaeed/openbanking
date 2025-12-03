'use client';
import React, { RefObject, useRef, useEffect } from 'react';
import { VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Box, Typography } from '../ui/core';
import { Button } from '../ui/core/Button';
import LoadingButton from '../ui/core/LoadingButton';

interface VideoQualityInfo {
    width?: number;
    height?: number;
    frameRate?: number;
    deviceId?: string;
    facingMode?: string;
}

interface VideoRecorderViewProps {
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isRecording: boolean;
    recordingTime: number;
    videoPreviewUrl: string | null;
    isUploading: boolean;
    cameraActive: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onRetake: () => void;
    onConfirm: () => void;
    onBack: () => void;
    randomText?: string;
    videoQualityInfo?: VideoQualityInfo | null;
}

export function VideoRecorderView({
    videoRef,
    canvasRef,
    isRecording,
    recordingTime,
    videoPreviewUrl,
    isUploading,
    cameraActive,
    onStartRecording,
    onStopRecording,
    onRetake,
    onConfirm,
    randomText,
}: VideoRecorderViewProps) {
    const previewVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (previewVideoRef.current && videoPreviewUrl) {
            const video = previewVideoRef.current;
            video.load();

            setTimeout(() => {
                if (video.duration === 0) {
                    video.load();
                }
            }, 100);
        }
    }, [videoPreviewUrl]);


    const hasPreview = Boolean(videoPreviewUrl);

    return (
        <Box className="space-y-6">
            <Box className="text-center">
                {hasPreview && (
                    <Box className="w-full space-y-2">
                        <Box className="w-full rounded-lg bg-gray-50 p-2">
                            <video
                                src={videoPreviewUrl ?? undefined}
                                controls
                                className="mx-auto w-full rounded-lg bg-gray-50"
                                preload="metadata"
                                ref={previewVideoRef}
                                onContextMenu={(e) => e.preventDefault()}
                                disablePictureInPicture
                                controlsList="nodownload"
                            >
                                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                            </video>

                        </Box>

                        <Box className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-gray-100 p-2">
                            <Button
                                variant="secondary"
                                onClick={onRetake}
                                disabled={isUploading}
                                className="bg-warning-700 flex max-w-32 cursor-pointer items-center gap-2 text-white"
                            >
                                <VideoCameraIcon className="h-4 w-4" />
                                ضبط مجدد
                            </Button>
                            <ul className="md:text-md space-y-1 rounded-lg bg-gray-200 p-3">
                                <li className="text-error font-bold">
                                    فیلم ضبط شده خود را بررسی کنید
                                </li>
                                <li> اگر فیلم مناسب است «مرحله بعد» را انتخاب کنید</li>
                                <li> برای رکورد جدید «ضبط مجدد» را انتخاب کنید</li>
                            </ul>

                        </Box>
                    </Box>
                )}

                {!hasPreview && (
                    <Box className="space-y-4">
                        <Box className=" ">
                            <Box className="relative mb-4 overflow-hidden rounded-lg border-2 border-dashed border-gray-900 bg-gray-200 p-1">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    className="h-64 w-full rounded-lg object-cover"
                                    style={{ transform: 'scaleX(-1)' }}
                                />
                                <canvas ref={canvasRef} className="hidden" />

                                {isRecording && (
                                    <Box className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-white">
                                        <Box className="h-2 w-2 animate-pulse rounded-full bg-white" />
                                        <span className="text-sm font-medium">
                                            ضبط: {Math.floor(recordingTime / 60)}:
                                            {(recordingTime % 60).toString().padStart(2, '0')}
                                        </span>
                                    </Box>
                                )}
                            </Box>

                            {!isRecording && (
                                <Box className=" rounded-lg">
                                    <Box className="space-y-2 text-right">
                                        <Typography
                                            variant="h4"
                                            className="border-primary-100  flex min-h-10 flex-col items-center justify-center rounded-lg border bg-gray-100 text-center text-base leading-relaxed"
                                        >
                                            {randomText}
                                        </Typography>
                                        <Box className=" flex flex-col items-center justify-between rounded-lg bg-gray-100 p-2">
                                            <Button
                                                onClick={onStartRecording}
                                                className="bg-success-600 mb-2 flex items-center gap-2 px-6 py-3 text-white"
                                                disabled={!cameraActive}
                                            >
                                                <VideoCameraIcon className="h-5 w-5" />
                                                شروع ضبط
                                            </Button>
                                            <ul className="bg-gray-200 w-full rounded-md p-2 text-sm leading-relaxed text-gray-900">
                                                <li className="text-primary-800 font-bold text-center mb-1">
                                                    شرایط تصویربرداری
                                                </li>
                                                <li>
                                                    <span className="text-primary-600 ml-1">•</span> تصویربرداری باید در محیطی آرام و بدون صداهای مزاحم و با نور کافی انجام شود.
                                                </li>
                                                <li><span className="text-warning-600 ml-1">•</span> در پس‌زمینه چهره اصلی نباید تصویری از چهره فرد دیگر، قاب عکس، مجسمه یا هر چیزی شبیه به چهره وجود داشته باشد.</li>
                                                <li><span className="text-error-600 ml-1">•</span> خوانش متن باید به صورت واضح، با سرعت یکنواخت و بدون وقفه، به زبان فارسی و بدون لحجه باشد</li>
                                            </ul>

                                        </Box>
                                    </Box>
                                </Box>
                            )}
                            <Box className="flex justify-center gap-3">
                                {isRecording && (
                                    <Button
                                        onClick={onStopRecording}
                                        disabled={!isRecording}
                                        className={`mb-2 flex items-center gap-2 px-6 py-3 transition-colors ${isRecording
                                            ? 'bg-error-500 hover:bg-error-600 text-white'
                                            : 'cursor-not-allowed bg-gray-400 text-gray-600'
                                            }`}
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                        پایان ضبط
                                    </Button>
                                )}
                            </Box>
                            {isRecording && (
                                <Typography
                                    variant="h4"
                                    className="border-primary-100  flex min-h-10 items-center justify-center rounded-lg border bg-gray-100 text-center text-base leading-relaxed"
                                >
                                    {randomText}
                                </Typography>
                            )}

                        </Box>
                    </Box>
                )}
            </Box>

            <LoadingButton
                onClick={onConfirm}
                loading={isUploading}
                disabled={!hasPreview || isUploading}
            />
        </Box>
    );
}
