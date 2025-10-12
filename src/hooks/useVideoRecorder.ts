import { mediaStreamManager } from '@/lib/mediaStreamManager';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import toast from 'react-hot-toast';

interface VideoRecorderResult {
    videoRef: RefObject<HTMLVideoElement | null>;
    canvasRef: RefObject<HTMLCanvasElement | null>;
    isRecording: boolean;
    recordingTime: number;
    videoFile: File | null;
    videoPreviewUrl: string | null;
    isUploading: boolean;
    cameraActive: boolean;
    startCamera: () => Promise<void>;
    startVideoRecording: () => Promise<void>;
    stopVideoRecording: () => void;
    handleRetake: () => void;
    setIsUploading: (value: boolean) => void;
}

export function useVideoRecorder(): VideoRecorderResult {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

            mediaStreamManager.register(stream);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraActive(true);
            }
        } catch (err) {
            console.warn('camera access failed', err);
            toast.error('دسترسی به دوربین امکان‌پذیر نیست');
        }
    }, []);

    useEffect(() => {
        if (!videoFile && !isRecording && !streamRef.current && !cameraActive) {
            void startCamera();
        }
    }, [videoFile, isRecording, cameraActive, startCamera]);

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (videoPreviewUrl) {
                URL.revokeObjectURL(videoPreviewUrl);
            }
        };
    }, [videoPreviewUrl]);

    useEffect(() => {
        const currentVideoRef = videoRef.current;
        const currentStream = streamRef.current;

        return () => {
            if (currentStream) {
                mediaStreamManager.unregister(currentStream);
            }

            if (streamRef.current && streamRef.current !== currentStream) {
                mediaStreamManager.unregister(streamRef.current);
            }

            streamRef.current = null;

            if (currentVideoRef) {
                currentVideoRef.srcObject = null;
            }
            setCameraActive(false);
        };
    }, []);

    const startVideoRecording = useCallback(async () => {
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
                const file = new File([blob], `verification_video_${Date.now()}.webm`, {
                    type: 'video/webm',
                });
                const url = URL.createObjectURL(blob);
                setVideoPreviewUrl(url);
                setTimeout(() => setVideoFile(file), 100);
            };

            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setRecordingTime(30);
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('خطا در شروع ضبط');
        }
    }, []);

    const stopVideoRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                streamRef.current = null;
            }

            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            setCameraActive(false);
        }
    }, [isRecording]);

    useEffect(() => {
        if (recordingTime > 0 && isRecording) {
            timerRef.current = setTimeout(() => {
                setRecordingTime((prev) => prev - 1);
            }, 1000);
        } else if (recordingTime === 0 && isRecording) {
            stopVideoRecording();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [recordingTime, isRecording, stopVideoRecording]);

    const handleRetake = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
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

        void startCamera();
    }, [videoPreviewUrl, startCamera]);

    return {
        videoRef,
        canvasRef,
        isRecording,
        recordingTime,
        videoFile,
        videoPreviewUrl,
        isUploading,
        setIsUploading,
        cameraActive,
        startCamera,
        startVideoRecording,
        stopVideoRecording,
        handleRetake,
    };
}
