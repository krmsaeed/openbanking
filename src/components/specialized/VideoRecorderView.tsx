'use client';
import React, { RefObject } from 'react';
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
    isConverting?: boolean;
    convertProgress?: number;
    uploadProgress?: number;
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
    isConverting = false,
    convertProgress = 0,
    uploadProgress = 0,
}: VideoRecorderViewProps) {
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
                            >
                                مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                            </video>
                        </Box>

                        {isConverting && (
                            <Box className="mb-4 flex flex-col items-center justify-center">
                                <div className="mb-2 text-blue-700 font-bold">در حال آماده‌سازی ویدیو...</div>
                                <div className="w-full max-w-md bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                                    <div
                                        className="bg-blue-600 h-4 rounded-full transition-all duration-200"
                                        style={{ width: `${convertProgress}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1 text-xs text-gray-700">{convertProgress}%</div>
                            </Box>
                        )}

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
                                            <ul className="bg-gray-200 w-full rounded-md p-2 text-center text-sm leading-relaxed text-gray-800">
                                                <li className="text-primary-800 font-bold">
                                                    متن نمایش داده‌شده را واضح بخوانید
                                                </li>
                                                <li>طول ویدیو: حدود 30 ثانیه.</li>
                                                <li>صورت در مرکز قاب قرار گیرد.</li>
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

            {isConverting && (
                <Box className="mb-4 flex flex-col items-center justify-center">
                    <div className="mb-2 text-blue-700 font-bold">در حال آماده‌سازی ویدیو...</div>
                    <div className="w-full max-w-md bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                        <div
                            className="bg-blue-600 h-4 rounded-full transition-all duration-200"
                            style={{ width: `${convertProgress}%` }}
                        ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-700">{convertProgress}%</div>
                </Box>
            )}

            {isUploading && (
                <Box className="mb-4 flex flex-col items-center justify-center">
                    <div className="mb-2 text-green-700 font-bold">در حال آپلود ویدیو...</div>
                    <div className="w-full max-w-md bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                        <div
                            className="bg-green-600 h-4 rounded-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-700">{uploadProgress}%</div>
                </Box>
            )}

            <LoadingButton
                onClick={onConfirm}
                loading={isUploading}
                disabled={!hasPreview || isUploading}
            />
        </Box>
    );
}
