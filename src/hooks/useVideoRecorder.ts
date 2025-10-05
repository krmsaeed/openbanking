import { useUser } from '@/contexts/UserContext';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import toast from 'react-hot-toast';

interface UseVideoRecorderOptions {
    processId?: string | number | null;
    onSuccess?: () => void;
}

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
    handleUpload: () => Promise<void>;
    handleRetake: () => void;
}

type MaybeCrypto = { crypto?: { randomUUID?: () => string } };

export function useVideoRecorder(options: UseVideoRecorderOptions = {}): VideoRecorderResult {
    const { processId, onSuccess } = options;
    const { setUserData } = useUser();
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
            toast.success('ضبط ویدیو متوقف شد و دوربین خاموش شد');
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

    const handleUpload = useCallback(async () => {
        if (!videoFile) return;

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        const maybe = globalThis as unknown as MaybeCrypto;
        const uuid =
            maybe?.crypto && typeof maybe.crypto.randomUUID === 'function'
                ? maybe.crypto.randomUUID()
                : Date.now().toString(36);
        const videoName = `verification_video_${uuid}.webm`;
        const video = new File([videoFile], videoName, { type: 'video/webm' });

        const body = {
            serviceName: 'virtual-open-deposit',
            processId,
            formName: 'ImageInquiry',
            body: {},
        };

        const data = new FormData();
        data.append('messageDTO', JSON.stringify(body));
        data.append('files', video);

        setCameraActive(false);
        setIsUploading(true);

        await axios
            .post('/api/bpms/deposit-files', data)
            .then((res) => {
                const { data } = res;
                if (data?.body?.verified) {
                    setUserData({ step: 4 });
                    onSuccess?.();
                }
            })
            .finally(() => {
                setIsUploading(false);
            });
    }, [processId, videoFile, onSuccess, setUserData]);

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

        toast.success('آماده برای ضبط مجدد');
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
        cameraActive,
        startCamera,
        startVideoRecording,
        stopVideoRecording,
        handleUpload,
        handleRetake,
    };
}
