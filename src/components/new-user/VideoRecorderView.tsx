'use client';

import { CheckIcon, VideoCameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { RefObject } from 'react';
import { Button } from '../ui/core/Button';
import { Card, CardContent } from '../ui/core/Card';
import { Box, Typography } from '../ui/core';
import LoadingButton from '../ui/core/LoadingButton';

interface VideoRecorderViewProps {
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isRecording: boolean;
    recordingTime: number;
    videoFile: File | null;
    videoPreviewUrl: string | null;
    isUploading: boolean;
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
    cameraActive,
    onStartRecording,
    onStopRecording,
    onRetake,
    onConfirm,
    onBack,
    randomText,
}: VideoRecorderViewProps) {
    const hasPreview = Boolean(videoFile && videoPreviewUrl);

    return (
        <Box className="space-y-6">
            <Card>
                <CardContent>
                    <Box className="text-center">
                        {hasPreview ? (
                            <Box className="w-full space-y-4">
                                <Box className="w-full rounded-lg bg-gray-200 p-1">
                                    <video
                                        src={videoPreviewUrl ?? undefined}
                                        controls
                                        className="mx-auto w-full max-w-md rounded-lg border border-gray-300"
                                        style={{ maxHeight: '200px' }}
                                    >
                                        مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                                    </video>
                                </Box>
                                <Box className="rounded-xl bg-gray-100 p-4">
                                    <ul className="text-error-800 space-y-1 text-sm">
                                        <li> فیلم ضبط شده خود را بررسی کنید</li>
                                        <li> اگر فیلم مناسب است، روی «تایید» کلیک کنید</li>
                                        <li> برای رکورد جدید، روی «ضبط مجدد» کلیک کنید</li>
                                    </ul>
                                </Box>

                                <Box className="flex justify-center gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={onRetake}
                                        className="flex items-center gap-2"
                                    >
                                        <VideoCameraIcon className="h-4 w-4" />
                                        ضبط مجدد
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box className="space-y-4">
                                <Box className=" ">
                                    <Box className="border-primary relative mb-4 overflow-hidden rounded-lg border-2 border-dashed bg-gray-300 p-1">
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
                                                    {(recordingTime % 60)
                                                        .toString()
                                                        .padStart(2, '0')}
                                                </span>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box className="bg-secondary-50 border-primary-300 mb-4 rounded-lg border-2 p-3">
                                        {!isRecording ? (
                                            <Box className="space-y-2 text-right">
                                                <Typography
                                                    variant="h4"
                                                    className="border-primary-200 bg-secondary-100 mt-2 flex min-h-10 items-center justify-center rounded-lg border text-center text-base leading-relaxed"
                                                >
                                                    {randomText}
                                                </Typography>
                                                <ul className="list-inside list-disc text-sm leading-relaxed text-gray-700">
                                                    <li className="text-primary font-bold">
                                                        متن نمایش داده‌شده را واضح بخوانید
                                                    </li>
                                                    <li>طول ویدیو: حدود 30 ثانیه.</li>
                                                    <li>صورت در مرکز قاب قرار گیرد.</li>
                                                    <li>از نور پشت سر پرهیز کنید.</li>
                                                    <li>در محیطی کم‌صدا صحبت کنید.</li>
                                                </ul>
                                            </Box>
                                        ) : (
                                            <p className="mt-2 text-center text-base leading-relaxed">
                                                {randomText}
                                            </p>
                                        )}
                                    </Box>

                                    <Box className="flex justify-center gap-3">
                                        {!isRecording ? (
                                            <Button
                                                onClick={onStartRecording}
                                                className="bg-secondary hover:bg-secondary-600 flex items-center gap-2 px-6 py-3"
                                                disabled={!cameraActive}
                                            >
                                                <VideoCameraIcon className="h-5 w-5" />
                                                شروع ضبط
                                            </Button>
                                        ) : (
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
                </CardContent>
            </Card>

            <Box className="flex w-full items-center gap-2">
                <Button
                    onClick={onBack}
                    variant="destructive"
                    className="flex w-full items-center justify-center gap-3 px-5 py-3 text-white"
                >
                    <XMarkIcon className="h-5 w-5 text-white" />
                    بازگشت
                </Button>
                <LoadingButton
                    onClick={onConfirm}
                    loading={isUploading}
                    disabled={!hasPreview || isUploading}
                    className="bg-primary flex w-full items-center justify-center gap-3 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {!isUploading && <CheckIcon className="h-5 w-5" />}
                    <Typography variant="body1" className="text-xs font-medium text-white">
                        {isUploading ? 'در حال ارسال...' : 'تایید'}
                    </Typography>
                </LoadingButton>
            </Box>
        </Box>
    );
}
