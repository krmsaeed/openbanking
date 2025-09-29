"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { CheckIcon, VideoCameraIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/core/Button";
import { Card, CardContent } from "../ui/core/Card";
import { Box, Typography } from "../ui";
import { useUser } from "@/contexts/UserContext";
import axios from "axios";

interface VideoRecorderProps {
    onComplete: (file: File) => void;
    onCancel: () => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onComplete, onCancel }) => {
    const { setUserData, userData } = useUser()
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        if (recordingTime > 0) {
            timerRef.current = setTimeout(() => {
                setRecordingTime(recordingTime - 1);
            }, 1000);
        } else if (recordingTime === 0 && isRecording) {
            stopVideoRecording();
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [recordingTime, isRecording]);

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
        } catch (err) {
            console.warn('camera access failed', err);
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

    const stopVideoRecording = useCallback(() => {
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
    }, [isRecording]);

    const handleComplete = async () => {
        if (videoFile) {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                navigator.mediaDevices.getUserMedia({ video: false, audio: false });
                streamRef.current = null;
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
            type MaybeCrypto = { crypto?: { randomUUID?: () => string } };
            const maybe = (globalThis as unknown as MaybeCrypto);
            const uuid = maybe?.crypto && typeof maybe.crypto.randomUUID === 'function'
                ? maybe.crypto.randomUUID()
                : Date.now().toString(36);
            const videoName = `verification_video_${uuid}.webm`;
            const video = new File([videoFile], videoName, { type: 'video/webm' });
            const body = {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'ImageInquiry',
                body: {},
            };
            const data = new FormData();
            data.append('messageDTO', JSON.stringify(body));
            data.append('files', video);
            setCameraActive(false);
            await axios.post('/api/bpms/deposit-files', data).then(res => {

                setUserData({ ...userData, step: 4 });
            });
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

        // reset any local prompts

        toast.success('آماده برای ضبط مجدد');
    };

    return (
        <Box className="space-y-6">
            <Card padding="lg">

                <CardContent>
                    <Box className="text-center">
                        {videoFile && videoPreviewUrl ? (
                            <Box className="space-y-4 w-full">
                                <Box className="rounded-lg p-1 bg-gray-200 w-full">
                                    <video
                                        src={videoPreviewUrl}
                                        controls
                                        className="w-full max-w-md mx-auto rounded-lg border border-gray-300"
                                        style={{ maxHeight: '200px' }}
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
                                    <Button
                                        variant="secondary"
                                        onClick={handleRetakeVideo}
                                        className="flex items-center gap-2"
                                    >
                                        <VideoCameraIcon className="w-4 h-4" />
                                        ضبط مجدد
                                    </Button>


                                </Box>
                                <Box className="w-full flex gap-2 items-center">
                                    <Button
                                        onClick={onCancel}
                                        variant="destructive"
                                        className="w-full flex justify-center gapo-3 px-5 py-3 items-center text-white"
                                    >
                                        <XMarkIcon className="w-5 h-5 text-white" />
                                        بازگشت
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleComplete}
                                        className="  text-white gap-3 px-5 py-3 flex items-center justify-center  w-full bg-primary-600 hover:bg-primary-700"
                                    >
                                        <CheckIcon className="h-5 w-5" />
                                        <Typography variant="body1" className="text-white text-xs font-medium">
                                            تایید
                                        </Typography>
                                    </Button>

                                </Box>
                            </Box>
                        ) : (
                            <Box className="space-y-4">
                                <Box className="border-2 border-dashed border-primary-100 rounded-lg p-4 bg-gray-100">
                                    <Box className="relative bg-black rounded-lg overflow-hidden mb-4">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            className="w-full h-64 object-cover"
                                            style={{ transform: 'scaleX(-1)' }}
                                        />
                                        <canvas ref={canvasRef} className="hidden" />

                                        {isRecording && (
                                            <Box className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                                                <Box className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                                <span className="text-sm font-medium">
                                                    ضبط: {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                                                </span>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box className="mb-4 p-3 bg-gray-100 border-2 border-blue-300 rounded-lg">
                                        {!isRecording && <Box className="text-right space-y-2">
                                            <p className="text-sm font-medium text-gray-800">راهنمای ضبط ویدیو</p>
                                            <ul className="text-sm text-gray-700 list-disc list-inside leading-relaxed">
                                                <li className="font-bold text-primary-600">
                                                    متن نمایش داده‌شده را واضح بخوانید
                                                </li>
                                                <li>طول ویدیو: حدود 30 ثانیه .</li>
                                                <li> صورت  در مرکز قاب قرار گیرد،.</li>
                                                <li>  از نور پشت سر پرهیز کنید.</li>
                                                <li> در محیطی کم‌صدا صحبت کنید .</li>
                                            </ul>
                                        </Box>}
                                        {isRecording && <p className="text-base text-gray-500 leading-relaxed text-center mt-2">
                                            {userData?.randomText}
                                        </p>}
                                    </Box>

                                    <Box className="flex justify-center gap-3">
                                        {!isRecording ? (
                                            <Button
                                                onClick={startVideoRecording}
                                                className="flex items-center gap-2 bg-secondary hover:bg-secondary-600 px-6 py-3"
                                            >
                                                <VideoCameraIcon className="w-5 h-5" />
                                                شروع ضبط
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={stopVideoRecording}
                                                className="flex items-center gap-2 bg-gray-300 hover:bg-gray-700 px-6 py-3"
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
        </Box>
    );
};
