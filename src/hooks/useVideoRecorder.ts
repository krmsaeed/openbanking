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
    isCompressing: boolean;
    compressionProgress: number;
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
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionProgress, setCompressionProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // کمپرس ویدیو با حفظ صدا - روش ساده‌تر
    const compressVideoSimple = useCallback(async (originalBlob: Blob): Promise<File> => {
        setIsCompressing(true);
        setCompressionProgress(0);

        try {
            // مرحله 1: آماده‌سازی (0-15%)
            setCompressionProgress(5);

            const videoUrl = URL.createObjectURL(originalBlob);
            const video = document.createElement('video');
            video.src = videoUrl;
            video.muted = true;

            await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
            });

            setCompressionProgress(10);

            const scale = 0.7;
            const width = Math.floor(video.videoWidth * scale);
            const height = Math.floor(video.videoHeight * scale);

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { alpha: false })!;

            const canvasStream = canvas.captureStream(25);

            // استخراج audio
            const audioContext = new AudioContext();
            const sourceElement = document.createElement('video');
            sourceElement.src = videoUrl;
            sourceElement.muted = false;

            await sourceElement.play();
            sourceElement.pause();
            sourceElement.currentTime = 0;

            const source = audioContext.createMediaElementSource(sourceElement);
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);

            const audioTrack = destination.stream.getAudioTracks()[0];
            if (audioTrack) {
                canvasStream.addTrack(audioTrack);
            }

            setCompressionProgress(15);

            // شروع ضبط
            const recorder = new MediaRecorder(canvasStream, {
                mimeType: 'video/webm;codecs=vp8,opus',
                videoBitsPerSecond: 700000,
                audioBitsPerSecond: 64000,
            });

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.start(100);
            video.play();
            sourceElement.play();

            // مرحله 2: پردازش فریم‌ها (15-90%)
            let lastProgress = 15;
            const renderFrame = () => {
                if (video.ended || video.paused) return;
                ctx.drawImage(video, 0, 0, width, height);
                if (video.duration > 0) {
                    const progress = Math.floor(15 + (video.currentTime / video.duration) * 75);
                    if (progress > lastProgress && progress <= 90) {
                        lastProgress = progress;
                        setCompressionProgress(progress);
                    }
                }
                requestAnimationFrame(renderFrame);
            };

            renderFrame();

            // صبر برای پایان
            await new Promise<void>((resolve) => {
                video.onended = () => {
                    recorder.stop();
                    sourceElement.pause();
                    audioContext.close();
                    resolve();
                };
            });

            setCompressionProgress(92);

            // مرحله 3: دریافت blob (92-100%)
            const compressedBlob = await Promise.race([
                new Promise<Blob>((resolve) => {
                    recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/mp4' }));
                    if (recorder.state === 'inactive' && chunks.length > 0) {
                        resolve(new Blob(chunks, { type: 'video/mp4' }));
                    }
                }),
                new Promise<Blob>((_, reject) => {
                    const start = performance.now();
                    const check = () => {
                        if (performance.now() - start > 5000) {
                            reject(new Error('Recorder timeout'));
                        } else {
                            requestAnimationFrame(check);
                        }
                    };
                    requestAnimationFrame(check);
                }),
            ]);

            setCompressionProgress(95);
            URL.revokeObjectURL(videoUrl);
            setCompressionProgress(100);

            return new File([compressedBlob], `verification_video_${Date.now()}.mp4`, {
                type: 'video/mp4',
            });
        } catch (error) {
            console.error('Compression error:', error);
            throw error;
        } finally {
            setIsCompressing(false);
        }
    }, []);

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
            const options: MediaRecorderOptions = {
                mimeType: 'video/webm;codecs=h264,opus',
                videoBitsPerSecond: 1000000,
                audioBitsPerSecond: 64000,
            };

            if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
                options.mimeType = 'video/webm;codecs=vp9,opus';
                options.videoBitsPerSecond = 1000000;
            }

            if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
                options.mimeType = 'video/webm;codecs=vp8,opus';
                options.videoBitsPerSecond = 1000000;
            }

            if (!MediaRecorder.isTypeSupported(options.mimeType!)) {
                delete options.mimeType;
                options.videoBitsPerSecond = 1000000;
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

                try {
                    const compressedFile = await compressVideoSimple(blob);

                    const url = URL.createObjectURL(compressedFile);
                    setVideoPreviewUrl(url);
                    setTimeout(() => setVideoFile(compressedFile), 100);
                } catch (error) {
                    console.error('Compression failed:', error);
                    toast.error('خطا در فشرده‌سازی، از فایل اصلی استفاده می‌شود', {
                        id: 'compress',
                    });
                    const file = new File([blob], `verification_video_${Date.now()}.mp4`, {
                        type: 'video/mp4',
                    });
                    const url = URL.createObjectURL(blob);
                    setVideoPreviewUrl(url);
                    setTimeout(() => setVideoFile(file), 100);
                }
            };

            mediaRecorder.start(1000);
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
            setRecordingTime(15);
        } catch (error) {
            console.error('Error starting recording:', error);
            toast.error('خطا در شروع ضبط');
        }
    }, [compressVideoSimple]);

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
        isCompressing,
        compressionProgress,
        setIsUploading,
        cameraActive,
        startCamera,
        startVideoRecording,
        stopVideoRecording,
        handleRetake,
    };
}
