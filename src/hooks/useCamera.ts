import { mediaStreamManager } from '@/lib/mediaStreamManager';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseCameraOptions {
    video?: MediaTrackConstraints | boolean;
    audio?: MediaTrackConstraints | boolean;
}

interface UseCameraResult {
    stream: MediaStream | null;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isActive: boolean;
    isLoading: boolean;
    error: string | null;
    startCamera: () => Promise<void>;
    stopCamera: () => void;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraResult {
    const { video = true, audio = false } = options;

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = useCallback(async () => {
        setError(null);
        setIsLoading(true);

        try {
            if (streamRef.current) {
                mediaStreamManager.unregister(streamRef.current);
                streamRef.current = null;
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
                    videoRef.current.play().catch(() => {});
                } else {
                    videoRef.current.addEventListener(
                        'canplay',
                        () => {
                            videoRef.current?.play().catch(() => {});
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
            streamRef.current = null;
            setStream(null);
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsActive(false);
    }, []);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return {
        stream,
        videoRef,
        isActive,
        isLoading,
        error,
        startCamera,
        stopCamera,
    };
}
