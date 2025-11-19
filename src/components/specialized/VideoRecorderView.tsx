'use client';
import { VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { RefObject } from 'react';
import { Box, Typography } from '../ui/core';
import { Button } from '../ui/core/Button';
import LoadingButton from '../ui/core/LoadingButton';

interface VideoRecorderViewProps {
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isRecording: boolean;
    recordingTime: number;
    videoFile: File | null;
    videoPreviewUrl: string | null;
    isUploading: boolean;
    isCompressing: boolean;
    cameraActive: boolean;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onRetake: () => void;
    onConfirm: () => void;
    onBack: () => void;
    randomText?: string;
}

export function VideoRecorderView({
    videoRef,
    canvasRef,
    isRecording,
    recordingTime,
    videoFile,
    videoPreviewUrl,
    isUploading,
    isCompressing,
    cameraActive,
    onStartRecording,
    onStopRecording,
    onRetake,
    onConfirm,
    randomText,
}: VideoRecorderViewProps) {
    const hasPreview = Boolean(videoFile && videoPreviewUrl);
    return (
        <Box className="space-y-6">
            <Box className="text-center">
                {hasPreview && (
                    <Box className="w-full space-y-4">
                        <Box className="w-full rounded-lg bg-gray-50 p-2">
                            <video
                                src={videoPreviewUrl ?? undefined}
                                controls
                                className="mx-auto w-full rounded-lg bg-gray-50"
                            >
                                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                            </video>
                        </Box>

                        <Box className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-gray-100 p-4">
                            <ul className="md:text-md space-y-1 rounded-lg bg-gray-200 p-3">
                                <li className="text-error font-bold">
                                    فیلم ضبط شده خود را بررسی کنید
                                </li>
                                <li> اگر فیلم مناسب است «مرحله بعد» را انتخاب کنید</li>
                                <li> برای رکورد جدید «ضبط مجدد» را انتخاب کنید</li>
                            </ul>
                            <Button
                                variant="secondary"
                                onClick={onRetake}
                                disabled={isUploading || isCompressing}
                                className="bg-warning-700 flex max-w-32 cursor-pointer items-center gap-2 text-white"
                            >
                                <VideoCameraIcon className="h-4 w-4" />
                                ضبط مجدد
                            </Button>
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
                                <Box className="mb-4 rounded-lg">
                                    <Box className="space-y-2 text-right">
                                        <Typography
                                            variant="h4"
                                            className="border-primary-100 mt-2 flex min-h-10 flex-col items-center justify-center rounded-lg border bg-gray-100 text-center text-base leading-relaxed"
                                        >
                                            {randomText}
                                        </Typography>
                                        <Box className="mt-2 flex flex-col items-center justify-between rounded-lg bg-gray-100 p-2">
                                            <ul className="p-2 text-center text-sm leading-relaxed text-gray-800">
                                                <li className="text-primary-800 font-bold">
                                                    متن نمایش داده‌شده را واضح بخوانید
                                                </li>
                                                <li>طول ویدیو: حدود 30 ثانیه.</li>
                                                <li>صورت در مرکز قاب قرار گیرد.</li>
                                            </ul>
                                            <Button
                                                onClick={onStartRecording}
                                                className="bg-success-600 flex items-center gap-2 px-6 py-3 text-white"
                                                disabled={!cameraActive}
                                            >
                                                <VideoCameraIcon className="h-5 w-5" />
                                                شروع ضبط
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                            {isRecording && (
                                <Typography
                                    variant="h4"
                                    className="border-primary-100 mt-2 mb-2 flex min-h-10 items-center justify-center rounded-lg border bg-gray-100 text-center text-base leading-relaxed"
                                >
                                    {randomText}
                                </Typography>
                            )}
                            <Box className="flex justify-center gap-3">
                                {isRecording && (
                                    <Button
                                        onClick={onStopRecording}
                                        disabled={!isRecording}
                                        className={`flex items-center gap-2 px-6 py-3 transition-colors ${
                                            isRecording
                                                ? 'bg-error-500 hover:bg-error-600 text-white'
                                                : 'cursor-not-allowed bg-gray-400 text-gray-600'
                                        }`}
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                        پایان ضبط
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Box>

            <Box className="flex w-full items-center gap-2">
                <LoadingButton
                    onClick={onConfirm}
                    loading={isUploading}
                    disabled={!hasPreview || isUploading || isCompressing}
                />
            </Box>
        </Box>
    );
}
