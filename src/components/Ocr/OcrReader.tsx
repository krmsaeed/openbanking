'use client';

import { Box } from '@/components/ui';
import { ocrRecognizeFile, parseNationalCardFields } from '@/lib/ocr';
import { getCookie, setCookie } from '@/lib/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

type Props = {
    onRecognize?: (text: string, file?: File) => void;
    showControls?: boolean;
};

export default function OcrReader({ onRecognize, showControls = true }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [loading, setLoading] = useState(false);
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [ocrChecked, setOcrChecked] = useState(false);
    const [ocrValid, setOcrValid] = useState(false);

    const startStream = useCallback(async () => {
        try {
            try {
                const saved = getCookie('preferredUsbCameraId');
                if (saved) {
                    try {
                        const s = await navigator.mediaDevices.getUserMedia({
                            video: { deviceId: { exact: saved } },
                            audio: false,
                        });
                        streamRef.current = s;
                        if (videoRef.current) videoRef.current.srcObject = s;
                        return;
                    } catch {}
                }
            } catch {}
            const tempStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
            });
            let usbDeviceId: string | null = null;
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const vids = devices.filter((d) => d.kind === 'videoinput');
                const usb = vids.find((v) => /usb|external|webcam/i.test(v.label));
                usbDeviceId = usb?.deviceId ?? null;
            } catch {}
            if (usbDeviceId) {
                try {
                    tempStream.getTracks().forEach((t) => t.stop());
                    const s = await navigator.mediaDevices.getUserMedia({
                        video: { deviceId: { exact: usbDeviceId } },
                        audio: false,
                    });
                    streamRef.current = s;
                    if (videoRef.current) videoRef.current.srcObject = s;
                    try {
                        setCookie('preferredUsbCameraId', usbDeviceId);
                    } catch {}
                    return;
                } catch (e) {
                    console.warn('failed to open usb device, using temp stream', e);
                }
            }
            streamRef.current = tempStream;
            if (videoRef.current) videoRef.current.srcObject = tempStream;
        } catch (e) {
            console.warn('startStream failed', e);
            try {
                const s = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' },
                    audio: false,
                });
                streamRef.current = s;
                if (videoRef.current) videoRef.current.srcObject = s;
            } catch {
                console.warn('fallback startStream failed');
            }
        }
    }, []);

    useEffect(() => {
        const localVideo = videoRef.current;
        (async () => {
            await startStream();
        })();
        return () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                }
                if (localVideo) localVideo.srcObject = null;
            } catch {}
        };
    }, [startStream]);

    const capture = async () => {
        if (!videoRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current || document.createElement('canvas');
        const w = video.videoWidth || 1280;
        const h = video.videoHeight || 720;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, w, h);
        setLoading(true);
        const file: File | null = await new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) return resolve(null);
                    const f = new File([blob], `ocr-${Date.now()}.jpg`, { type: blob.type });
                    resolve(f);
                },
                'image/jpeg',
                0.9
            );
        });
        if (!file) {
            setLoading(false);
            return;
        }
        try {
            const url = URL.createObjectURL(file);
            if (capturedUrl) URL.revokeObjectURL(capturedUrl);
            setCapturedUrl(url);
            const resText = await ocrRecognizeFile(file);
            const fields = parseNationalCardFields(resText);
            const ok = !!(fields.nationalId && /^\d{10}$/.test(fields.nationalId));
            setOcrChecked(true);
            setOcrValid(ok);
            if (onRecognize) onRecognize(resText, file);
        } catch (e) {
            console.warn('ocr failed', e);
            if (onRecognize) onRecognize('', undefined);
        } finally {
            setLoading(false);
        }
    };

    const stopCamera = () => {
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
            if (videoRef.current) videoRef.current.srcObject = null;
        } catch {}
    };

    return (
        <Box className="space-y-4">
            <Box className="mx-auto w-full max-w-xl">
                <Box className="relative overflow-hidden rounded bg-black">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-64 w-full object-cover"
                    />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </Box>
                {showControls && (
                    <Box className="mt-3 flex gap-2">
                        <button
                            onClick={capture}
                            disabled={loading}
                            className="bg-primary-600 rounded px-3 py-2 text-white"
                        >
                            گرفتن عکس
                        </button>
                        <button onClick={stopCamera} className="rounded bg-gray-200 px-3 py-2">
                            توقف دوربین
                        </button>
                        <label className="cursor-pointer rounded border bg-white px-3 py-2">
                            آپلود عکس
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const f = e.target.files?.[0];
                                    if (!f) return;
                                    setLoading(true);
                                    try {
                                        const t = await ocrRecognizeFile(f);
                                        const fields = parseNationalCardFields(t);
                                        const ok = !!(
                                            fields.nationalId && /^\d{10}$/.test(fields.nationalId)
                                        );
                                        setOcrChecked(true);
                                        setOcrValid(ok);
                                        const url = URL.createObjectURL(f);
                                        if (capturedUrl) URL.revokeObjectURL(capturedUrl);
                                        setCapturedUrl(url);
                                        if (onRecognize) onRecognize(t, f);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="hidden"
                            />
                        </label>
                    </Box>
                )}

                {loading && <p className="text-sm">Processing...</p>}
                {ocrChecked && (
                    <Box className="mt-3">
                        <Box
                            className={`inline-block rounded px-3 py-1 ${ocrValid ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                        >
                            {ocrValid ? 'کارت ملی معتبر' : 'کارت ملی نامعتبر'}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
