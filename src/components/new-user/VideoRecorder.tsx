"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { VideoCameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/core/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/core/Card";

interface VideoRecorderProps {
    onComplete: (file: File) => void;
    onCancel: () => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onComplete, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [cameraActive, setCameraActive] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const verificationTexts = [
        "این یک متن تستی است",

    ];

    const currentText = verificationTexts[currentTextIndex];

    useEffect(() => {
        if (recordingTime > 0) {
            timerRef.current = setTimeout(() => {
                setRecordingTime(recordingTime - 1);
            }, 1000);
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [recordingTime]);

    useEffect(() => {
        if (!videoFile && !isRecording && !streamRef.current && !cameraActive) {
            startCamera();
        }
    }, [videoFile, isRecording, cameraActive]);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
        };
    }, [videoPreviewUrl]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraActive(true);
            }
        } catch (_) {
            toast.error('دسترسی به دوربین امکان‌پذیر نیست');
        }
    };

    const startVideoRecording = async () => {
        if (!streamRef.current) return;

        try {
            const mediaRecorder = new MediaRecorder(streamRef.current);
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                const file = new File([blob], `verification_video_${Date.now()}.webm`, { type: 'video/webm' });

                const url = URL.createObjectURL(blob);
                setVideoPreviewUrl(url);

                setTimeout(() => {
                    setVideoFile(file);
                }, 100);
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setRecordingTime(30);
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('خطا در شروع ضبط');
        }
    };

    const stopVideoRecording = () => {
        navigator.mediaDevices.getUserMedia({ video: false, audio: false });
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                });
                streamRef.current = null;
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            setCameraActive(false);
            navigator.mediaDevices.getUserMedia({ video: false, audio: false });
            toast.success('ضبط ویدیو متوقف شد و دوربین خاموش شد');
        }
    };

    const handleComplete = () => {
        if (videoFile) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                navigator.mediaDevices.getUserMedia({ video: false, audio: false });
                streamRef.current = null;
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            setCameraActive(false);

            onComplete(videoFile);
        }
    };

    const handleRetakeVideo = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setCameraActive(false);

        setVideoFile(null);
        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
            setVideoPreviewUrl(null);
        }

        setCurrentTextIndex(0);

        toast.success('آماده برای ضبط مجدد');
    };

    const handleCancel = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }

        setCameraActive(false);
        navigator.mediaDevices.getUserMedia({ video: false, audio: false });
        onCancel();
    };

    const speakText = () => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(currentText);
            utterance.lang = 'fa-IR';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="space-y-6">
            <Card padding="lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <VideoCameraIcon className="w-6 h-6 text-red-600" />
                        ضبط ویدیو احراز هویت
                    </CardTitle>
                    <CardDescription>
                        متن نمایش داده شده را با صدای بلند بخوانید
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center">
                        {videoFile && videoPreviewUrl ? (
                            <div className="space-y-4">
                                <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                                    <h4 className="font-medium text-green-800 mb-3">پیش‌نمایش ویدیو ضبط شده:</h4>
                                    <video
                                        src={videoPreviewUrl}
                                        controls
                                        className="w-full max-w-md mx-auto rounded-lg border border-gray-300"
                                        style={{ maxHeight: '200px' }}
                                    >
                                        مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                                    </video>
                                </div>

                                <p className="text-green-600 font-medium">✓ ویدیو احراز هویت ضبط شد</p>

                                <div className="flex justify-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleRetakeVideo}
                                        className="flex items-center gap-2"
                                    >
                                        <VideoCameraIcon className="w-4 h-4" />
                                        ضبط مجدد
                                    </Button>

                                    <Button
                                        onClick={handleComplete}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                    >
                                        <VideoCameraIcon className="w-4 h-4" />
                                        تأیید ویدیو
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                                    <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            className="w-full h-64 object-cover"
                                            style={{ transform: 'scaleX(-1)' }}
                                        />
                                        <canvas ref={canvasRef} className="hidden" />

                                        {isRecording && (
                                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                <span className="text-sm font-medium">
                                                    ضبط: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4 p-3 bg-white border-2 border-blue-200 rounded-lg">
                                        <p className="text-base text-gray-800 leading-relaxed text-center">
                                            {currentText}
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-3">
                                        {!isRecording ? (
                                            <Button
                                                onClick={startVideoRecording}
                                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3"
                                            >
                                                <VideoCameraIcon className="w-5 h-5" />
                                                شروع ضبط
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={stopVideoRecording}
                                                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 px-6 py-3"
                                            >
                                                <XMarkIcon className="w-5 h-5" />
                                                پایان ضبط
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="text-center">
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        className="mx-auto"
                                    >
                                        انصراف
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
