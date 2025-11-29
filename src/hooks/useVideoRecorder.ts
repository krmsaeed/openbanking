
import { mediaStreamManager } from '@/lib/mediaStreamManager';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import toast from 'react-hot-toast';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

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
    isConverting: boolean;
    convertProgress: number;
}

interface VideoQualityInfo {
    width?: number;
    height?: number;
    frameRate?: number;
    deviceId?: string;
    facingMode?: string;
}

export function useVideoRecorder(): VideoRecorderResult & { videoQualityInfo: VideoQualityInfo | null } {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isConverting, setIsConverting] = useState(false);
    const [convertProgress, setConvertProgress] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [videoQualityInfo, setVideoQualityInfo] = useState<VideoQualityInfo | null>(null);


    const startCamera = useCallback(async () => {
        try {
            const constraints = {
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
                audio: true,
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            // Extract actual video track settings
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                const settings = videoTrack.getSettings();
                setVideoQualityInfo({
                    width: settings.width,
                    height: settings.height,
                    frameRate: settings.frameRate,
                    deviceId: settings.deviceId,
                    facingMode: settings.facingMode,
                });
            }

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
            const options: MediaRecorderOptions = {
                mimeType: 'video/webm;codecs=h264,opus',
                videoBitsPerSecond: 10000000,
                audioBitsPerSecond: 64000,
            };

            if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
                options.mimeType = 'video/webm;codecs=vp9,opus';
                options.videoBitsPerSecond = 10000000;
            }

            if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
                options.mimeType = 'video/webm;codecs=vp8,opus';
                options.videoBitsPerSecond = 10000000;
            }

            if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
                delete options.mimeType;
                options.videoBitsPerSecond = 10000000;
                options.audioBitsPerSecond = 64000;
            }

            const mediaRecorder = new MediaRecorder(streamRef.current, options);
            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };


            mediaRecorder.onstop = async () => {
                const mimeType = mediaRecorder.mimeType || 'video/webm';
                const blob = new Blob(recordedChunksRef.current, { type: mimeType });

                // Start converting immediately after recording stops
                setIsConverting(true);
                setConvertProgress(0);

                // ffmpeg.wasm: convert to mp4/h264 and mirror
                let mp4File: File | null = null;
                let mp4Url: string | null = null;
                try {
                    const ffmpeg = new FFmpeg();
                    ffmpeg.on('progress', ({ progress }) => {
                        console.log('FFmpeg progress:', progress);
                        const percent = Math.max(0, Math.min(100, Math.round(progress * 100)));
                        setConvertProgress(prev => Math.max(prev, percent));
                    });
                    await ffmpeg.load();
                    const inputName = 'input.webm';
                    const outputName = 'output.mp4';
                    await ffmpeg.writeFile(inputName, await fetchFile(blob));

                    await ffmpeg.exec(['-i', inputName, '-vf', 'hflip', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', outputName]);
                    const data = await ffmpeg.readFile(outputName);
                    // Convert FileData (Uint8Array) to ArrayBuffer for Blob
                    let mp4Blob: Blob;
                    if (data instanceof Uint8Array) {
                        // Copy to a new ArrayBuffer to avoid SharedArrayBuffer issues
                        const ab = new ArrayBuffer(data.length);
                        const view = new Uint8Array(ab);
                        view.set(data);
                        mp4Blob = new Blob([ab], { type: 'video/mp4' });
                    } else {
                        mp4Blob = new Blob([data], { type: 'video/mp4' });
                    }
                    mp4File = new File([mp4Blob], `verification_video_${Date.now()}.mp4`, { type: 'video/mp4' });
                    mp4Url = URL.createObjectURL(mp4Blob);
                } catch (err) {
                    console.error('ffmpeg mp4/h264 conversion failed, falling back to original blob', err);
                    mp4File = new File([blob], `verification_video_${Date.now()}.webm`, { type: mimeType });
                    mp4Url = URL.createObjectURL(blob);
                }

                setConvertProgress(100);
                setVideoPreviewUrl(mp4Url);
                setVideoFile(mp4File);
                setIsConverting(false);
            };

            mediaRecorder.start(1000);
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setRecordingTime(15);
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
        setConvertProgress(0);

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
        videoQualityInfo,
        isConverting,
        convertProgress,
    };
}
