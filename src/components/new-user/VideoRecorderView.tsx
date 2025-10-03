"use client";

import { CheckIcon, VideoCameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { RefObject } from "react";
import { Button } from "../ui/core/Button";
import { Card, CardContent } from "../ui/core/Card";
import { Box, Typography } from "../ui/core";
import LoadingButton from "../ui/core/LoadingButton";

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
            <Card >
                <CardContent>
                    <Box className="text-center">
                        {hasPreview ? (
                            <Box className="space-y-4 w-full">
                                <Box className="rounded-lg p-1 bg-gray-200 w-full">
                                    <video
                                        src={videoPreviewUrl ?? undefined}
                                        controls
                                        className="w-full max-w-md mx-auto rounded-lg border border-gray-300"
                                        style={{ maxHeight: "200px" }}
                                    >
                                        مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                                    </video>
                                </Box>
                                <Box className="bg-gray-100  rounded-xl p-4">
                                    <ul className="text-sm text-error-800 space-y-1">
                                        <li> فیلم ضبط شده خود را بررسی کنید</li>
                                        <li> اگر فیلم مناسب است، روی «تایید» کلیک کنید</li>
                                        <li> برای رکورد جدید، روی «ضبط مجدد» کلیک کنید</li>
                                    </ul>
                                </Box>

                                <Box className="flex justify-center gap-3">
                                    <Button variant="secondary" onClick={onRetake} className="flex items-center gap-2">
                                        <VideoCameraIcon className="w-4 h-4" />
                                        ضبط مجدد
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
                            <Box className="space-y-4">
                                <Box className="  ">
                                    <Box className="relative border-dashed border-2 border-primary  bg-gray-300 rounded-lg overflow-hidden mb-4  p-1">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            className="w-full h-64 object-cover rounded-lg"
                                            style={{ transform: "scaleX(-1)" }}
                                        />
                                        <canvas ref={canvasRef} className="hidden" />

                                        {isRecording && (
                                            <Box className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                                                <Box className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                <span className="text-sm font-medium">
                                                    ضبط: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, "0")}
                                                </span>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box className="mb-4 p-3 bg-secondary-50 border-2 border-primary-300 rounded-lg">
                                        {!isRecording ? (
                                            <Box className="text-right space-y-2">
                                                <Typography variant="h4" className="text-base  border border-primary-200 min-h-10 bg-secondary-100 rounded-lg leading-relaxed text-center mt-2 flex justify-center items-center">{randomText}</Typography>
                                                <ul className="text-sm text-gray-700 list-disc list-inside leading-relaxed">
                                                    <li className="font-bold text-primary">متن نمایش داده‌شده را واضح بخوانید</li>
                                                    <li>طول ویدیو: حدود 30 ثانیه.</li>
                                                    <li>صورت در مرکز قاب قرار گیرد.</li>
                                                    <li>از نور پشت سر پرهیز کنید.</li>
                                                    <li>در محیطی کم‌صدا صحبت کنید.</li>
                                                </ul>
                                            </Box>
                                        ) : (
                                            <p className="text-base  leading-relaxed text-center mt-2">{randomText}</p>
                                        )}
                                    </Box>

                                    <Box className="flex justify-center gap-3">
                                        {!isRecording ? (
                                            <Button
                                                onClick={onStartRecording}
                                                className="flex items-center gap-2 bg-secondary hover:bg-secondary-600 px-6 py-3"
                                                disabled={!cameraActive}
                                            >
                                                <VideoCameraIcon className="w-5 h-5" />
                                                شروع ضبط
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={onStopRecording}
                                                disabled={!isRecording}
                                                className={`flex items-center gap-2 px-6 py-3 transition-colors ${isRecording
                                                    ? 'bg-error-500 hover:bg-error-600 text-white'
                                                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                    }`}
                                            >
                                                <XMarkIcon className="w-5 h-5" />
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

            <Box className="w-full flex gap-2 items-center">
                <Button
                    onClick={onBack}
                    variant="destructive"
                    className="w-full flex justify-center gap-3 px-5 py-3 items-center text-white"
                >
                    <XMarkIcon className="w-5 h-5 text-white" />
                    بازگشت
                </Button>
                <LoadingButton
                    onClick={onConfirm}
                    loading={isUploading}
                    disabled={!hasPreview || isUploading}
                    className="text-white gap-3 px-5 py-3 flex items-center justify-center w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {!isUploading && <CheckIcon className="h-5 w-5" />}
                    <Typography variant="body1" className="text-white text-xs font-medium">
                        {isUploading ? "در حال ارسال..." : "تایید"}
                    </Typography>
                </LoadingButton>
            </Box>
        </Box>
    );
}
