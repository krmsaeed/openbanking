import { mediaStreamManager } from '@/lib/mediaStreamManager';
import { useCallback, useEffect, useRef, useState } from 'react';

const stopMediaTracks = (stream?: MediaStream | null): void => {
    if (!stream) return;
    try {
        stream.getTracks().forEach((track) => {
            try {
                track.stop();
            } catch {
                // ignore
            }
            track.enabled = false;
        });
    } catch {
        // ignore
    }
};

interface UseCameraOptions {
    video?: MediaTrackConstraints | boolean;
    audio?: MediaTrackConstraints | boolean;
}

interface UseCameraOptions {
    video?: MediaTrackConstraints | boolean;
    audio?: MediaTrackConstraints | boolean;
}

interface UseCameraResult {
    stream: MediaStream | null;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    isActive: boolean;
    isLoading: boolean;
    error: string | null;
    startCamera: () => Promise<void>;
    stopCamera: () => void;
    takePhoto: (onPhotoTaken?: (file: File) => void) => void;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraResult {
    const { video = true, audio = false } = options;

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = useCallback(async () => {
        setError(null);
        setIsLoading(true);

        try {
            if (streamRef.current) {
                mediaStreamManager.unregister(streamRef.current);
                stopMediaTracks(streamRef.current);
                streamRef.current = null;
                setStream(null);
                if (videoRef.current) {
                    try {
                        videoRef.current.pause();
                    } catch {
                        // ignore pause errors
                    }
                    videoRef.current.srcObject = null;
                }
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video,
                audio,
            });

            mediaStreamManager.register(mediaStream);
            streamRef.current = mediaStream;
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;

                if (videoRef.current.readyState >= 2) {
                    videoRef.current.play().catch(() => {
                        // ignore autoplay rejection
                    });
                } else {
                    videoRef.current.addEventListener(
                        'canplay',
                        () => {
                            videoRef.current?.play().catch(() => {
                                // ignore autoplay rejection
                            });
                        },
                        { once: true }
                    );
                }
            }

            setIsActive(true);
        } catch (err) {
            if (err instanceof Error) {
                const errorMessage =
                    err.name === 'NotAllowedError'
                        ? 'دسترسی به دوربین رد شد. لطفاً دسترسی را اجازه دهید.'
                        : err.name === 'NotFoundError'
                            ? 'دوربین یافت نشد. لطفاً از وجود دوربین اطمینان حاصل کنید.'
                            : 'خطا در دسترسی به دوربین. لطفاً دوباره تلاش کنید.';
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    }, [video, audio]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            mediaStreamManager.unregister(streamRef.current);
            stopMediaTracks(streamRef.current);
            streamRef.current = null;
            setStream(null);
        }

        if (videoRef.current) {
            try {
                videoRef.current.pause();
            } catch {
                // ignore pause errors
            }
            videoRef.current.srcObject = null;
        }

        setIsActive(false);
    }, []);

    const takePhoto = useCallback((onPhotoTaken?: (file: File) => void) => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const file = new File([blob], `photo_${Date.now()}.jpg`, {
                                type: 'image/jpeg',
                            });
                            onPhotoTaken?.(file);
                        }
                    },
                    'image/jpeg',
                    0.8
                );
            }
        }
    }, []);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        stream,
        videoRef,
        canvasRef,
        isActive,
        isLoading,
        error,
        startCamera,
        stopCamera,
        takePhoto,
    };
}
