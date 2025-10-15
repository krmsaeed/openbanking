'use client';

import { Box } from '@/components/ui';
import { Button } from '@/components/ui/core/Button';
import { Modal } from '@/components/ui/overlay';
import { useUser } from '@/contexts/UserContext';
import { OcrFields, ocrRecognizeFile, parseNationalCardFields } from '@/lib/ocr';
import { setCookie } from '@/lib/utils';
import { ArrowPathIcon, CameraIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
    onCapture?: (file: File, isValid: boolean, fields?: OcrFields) => void;
    onConfirm?: (file: File, isValid: boolean) => void;
    autoOpen?: boolean;
    showConfirmButton?: boolean;
};
export default function NationalCardOcrScanner({ onCapture, onConfirm, autoOpen = true }: Props) {
    const { userData } = useUser();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    function useEvent<T extends (...args: unknown[]) => unknown>(handler: T) {
        const ref = useRef<T | null>(handler);
        useEffect(() => {
            ref.current = handler;
        }, [handler]);
        return useCallback((...args: Parameters<T>): ReturnType<T> => {
            const fn = ref.current as T;
            return fn(...(args as Parameters<T>)) as ReturnType<T>;
        }, []);
    }
    const stripAudioTracks = (ms: MediaStream | null) => {
        if (!ms) return ms;
        try {
            const audioTracks = ms.getAudioTracks() || [];
            audioTracks.forEach((t) => {
                try {
                    t.stop();
                    try {
                        ms.removeTrack(t);
                    } catch {}
                } catch {}
            });
        } catch {}
        return ms;
    };

    const logAction = async (action: string, payload: Record<string, unknown> = {}) => {
        try {
            const logData = {
                level: 'debug',
                message: `NationalCardOcrScanner - ${action}`,
                data: {
                    ...payload,
                    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                    ts: new Date().toISOString(),
                },
            };
            console.debug('📱', logData);
            try {
                await fetch('/api/logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(logData),
                });
            } catch (e) {
                console.warn('logAction POST failed', e);
            }
        } catch (e) {
            console.warn('logAction failed', e);
        }
    };
    const stopOtherVideoStreams = () => {
        try {
            const videos = Array.from(document.querySelectorAll('video')) as HTMLVideoElement[];
            videos.forEach((v) => {
                try {
                    if (v === videoRef.current) return;
                    const s = v.srcObject as MediaStream | null;
                    if (s) {
                        try {
                            s.getTracks().forEach((t) => t.stop());
                        } catch {}
                        try {
                            v.srcObject = null;
                        } catch {}
                    }
                } catch {}
            });
        } catch {}
    };
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [ocrValid, setOcrValid] = useState<boolean>(false);
    const [ocrLoading, setOcrLoading] = useState<boolean>(false);
    const [showPermissionModal, setShowPermissionModal] = useState<boolean>(false);
    const refreshDevices = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
            const devices = await navigator.mediaDevices.enumerateDevices();
            const allVids = devices.filter((d) => d.kind === 'videoinput');
            const preferUsb = process.env.NODE_ENV === 'development';
            let vids: MediaDeviceInfo[] = [];
            if (preferUsb) {
                vids = allVids.filter((v) => /usb|external|webcam/i.test(v.label));
                if (vids.length === 0) vids = allVids;
            } else {
                vids = allVids;
            }
            if (!selectedDeviceId && vids.length > 0) {
                try {
                    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');
                    const exactLabel = /^\s*camera\s*0\s*,\s*facing\s*back\s*$/i;
                    const backCandidate =
                        vids.find((v) => exactLabel.test(v.label)) ||
                        vids.find((v) => /camera\s*0/i.test(v.label)) ||
                        vids.find((v) => /back|rear|environment/i.test(v.label));
                    if (isMobile && backCandidate) {
                        setSelectedDeviceId(backCandidate.deviceId);
                    } else {
                        setSelectedDeviceId(vids[0].deviceId);
                    }
                } catch {
                    setSelectedDeviceId(vids[0].deviceId);
                }
            }
        } catch {}
    }, [selectedDeviceId]);
    // const pathname = usePathname();
    // useEffect(() => {
    //     return () => {
    //         try {
    //             if (streamRef.current) {
    //                 streamRef.current.getTracks().forEach((t) => t.stop());
    //                 streamRef.current = null;
    //             }
    //         } catch {}
    //     };
    // }, []);

    // useEffect(() => {
    //     setShowPermissionModal(true);
    // }, [pathname]);

    const openDeviceById = useCallback(
        async (deviceId: string, remember = false) => {
            try {
                if (navigator.permissions && typeof navigator.permissions.query === 'function') {
                    try {
                        const p = await navigator.permissions.query({
                            name: 'camera',
                        } as PermissionDescriptor);
                        console.log(
                            '🚀 ~ NationalCardOcrScanner.tsx:81 ~ NationalCardOcrScanner ~ p:',
                            p
                        );
                        if (p && p.state === 'denied') {
                            toast.error('دسترسی دوربین داده نشد');
                            return;
                        }
                    } catch {}
                } else {
                    try {
                        const test = await navigator.mediaDevices.getUserMedia({
                            video: true,
                            audio: false,
                        });
                        test.getTracks().forEach((t) => t.stop());
                    } catch {
                        toast.error('دسترسی دوربین داده نشد');
                        return;
                    }
                }
            } catch {}
            setIsCameraOpen(true);
            try {
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
                try {
                    streamRef.current?.getTracks().forEach((t) => t.stop());
                } catch {}
                try {
                    stopOtherVideoStreams();
                } catch {}

                let s: MediaStream | null = null;
                const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');
                if (isMobile) {
                    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                        try {
                            await logAction('before-enumerate');
                            const devs = await navigator.mediaDevices.enumerateDevices();
                            await logAction('after-enumerate', { devicesCount: devs.length });
                            const exactLabel = /^\s*camera\s*0\s*,\s*facing\s*back\s*$/i;
                            const isAndroid = /Android/i.test(navigator.userAgent || '');
                            let candidate: MediaDeviceInfo | undefined;
                            candidate = devs.find(
                                (d) => d.kind === 'videoinput' && exactLabel.test(d.label)
                            );
                            if (!candidate && isAndroid) {
                                candidate = devs.find(
                                    (d) => d.kind === 'videoinput' && /camera\s*0/i.test(d.label)
                                );
                            }
                            if (!candidate) {
                                candidate = devs.find(
                                    (d) =>
                                        d.kind === 'videoinput' &&
                                        /camera\s*0/i.test(d.label) &&
                                        /facing\s*back/i.test(d.label)
                                );
                            }
                            if (!candidate) {
                                const backMatcher = /back|rear|environment|main|wide-angle|wide/i;
                                candidate = devs.find(
                                    (d) => d.kind === 'videoinput' && backMatcher.test(d.label)
                                );
                            }
                            if (candidate && candidate.deviceId) {
                                try {
                                    await logAction('before-getUserMedia-deviceId', {
                                        deviceId: candidate.deviceId,
                                    });
                                    s = await navigator.mediaDevices.getUserMedia({
                                        video: { deviceId: { exact: candidate.deviceId } },
                                        audio: false,
                                    });
                                    await logAction('after-getUserMedia-deviceId', {
                                        success: !!s,
                                    });
                                } catch (e) {
                                    await logAction('getUserMedia-deviceId-failed', {
                                        deviceId: candidate.deviceId,
                                        error: String(e),
                                    });
                                }
                            }
                        } catch {}
                    }

                    if (!s) {
                        try {
                            await logAction('before-getUserMedia-facingMode-exact');
                            s = await navigator.mediaDevices.getUserMedia({
                                video: { facingMode: { exact: 'environment' } },
                                audio: false,
                            } as MediaStreamConstraints);
                            await logAction('after-getUserMedia-facingMode-exact', {
                                success: !!s,
                            });
                        } catch (e) {
                            await logAction('getUserMedia-facingMode-exact-failed', {
                                error: String(e),
                            });
                        }
                        if (!s) {
                            try {
                                await logAction('before-getUserMedia-facingMode-ideal');
                                s = await navigator.mediaDevices.getUserMedia({
                                    video: { facingMode: { ideal: 'environment' } },
                                    audio: false,
                                } as MediaStreamConstraints);
                                await logAction('after-getUserMedia-facingMode-ideal', {
                                    success: !!s,
                                });
                            } catch (e) {
                                await logAction('getUserMedia-facingMode-ideal-failed', {
                                    error: String(e),
                                });
                            }
                        }
                    }
                }

                if (!s) {
                    s = await navigator.mediaDevices.getUserMedia({
                        video: { deviceId: { exact: deviceId } },
                        audio: false,
                    });
                }
                streamRef.current = stripAudioTracks(s);
                if (videoRef.current) videoRef.current.srcObject = streamRef.current;
                try {
                    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || '');

                    const currentFacing = String(
                        s.getVideoTracks()?.[0]?.getSettings?.()?.facingMode || ''
                    );
                    if (isMobile && !/environment|back|rear/i.test(currentFacing)) {
                        let replacement: MediaStream | null = null;
                        try {
                            await logAction('before-getUserMedia-replacement-facing-exact');
                            replacement = await navigator.mediaDevices.getUserMedia({
                                video: { facingMode: { exact: 'environment' } },
                                audio: false,
                            } as MediaStreamConstraints);
                            await logAction('after-getUserMedia-replacement-facing-exact', {
                                success: !!replacement,
                            });
                        } catch (e) {
                            await logAction('getUserMedia-replacement-facing-exact-failed', {
                                error: String(e),
                            });
                        }
                        if (!replacement) {
                            try {
                                await logAction('before-getUserMedia-replacement-facing-ideal');
                                replacement = await navigator.mediaDevices.getUserMedia({
                                    video: { facingMode: { ideal: 'environment' } },
                                    audio: false,
                                } as MediaStreamConstraints);
                                await logAction('after-getUserMedia-replacement-facing-ideal', {
                                    success: !!replacement,
                                });
                            } catch (e) {
                                await logAction('getUserMedia-replacement-facing-ideal-failed', {
                                    error: String(e),
                                });
                            }
                        }

                        if (
                            !replacement &&
                            navigator.mediaDevices &&
                            navigator.mediaDevices.enumerateDevices
                        ) {
                            try {
                                const devs = await navigator.mediaDevices.enumerateDevices();
                                const exactLabel = /^\s*camera\s*0\s*,\s*facing\s*back\s*$/i;
                                const isAndroid = /Android/i.test(navigator.userAgent || '');
                                let candidate: MediaDeviceInfo | undefined;
                                candidate = devs.find(
                                    (d) => d.kind === 'videoinput' && exactLabel.test(d.label)
                                );
                                if (!candidate && isAndroid) {
                                    candidate = devs.find(
                                        (d) =>
                                            d.kind === 'videoinput' && /camera\s*0/i.test(d.label)
                                    );
                                }
                                if (!candidate) {
                                    candidate = devs.find(
                                        (d) =>
                                            d.kind === 'videoinput' &&
                                            /camera\s*0/i.test(d.label) &&
                                            /facing\s*back/i.test(d.label)
                                    );
                                }
                                if (!candidate) {
                                    const backMatcher =
                                        /back|rear|environment|main|wide-angle|wide/i;
                                    candidate = devs.find(
                                        (d) => d.kind === 'videoinput' && backMatcher.test(d.label)
                                    );
                                }
                                if (candidate && candidate.deviceId) {
                                    try {
                                        await logAction(
                                            'before-getUserMedia-replacement-deviceId',
                                            { deviceId: candidate.deviceId }
                                        );
                                        replacement = await navigator.mediaDevices.getUserMedia({
                                            video: { deviceId: { exact: candidate.deviceId } },
                                            audio: false,
                                        });
                                        await logAction('after-getUserMedia-replacement-deviceId', {
                                            success: !!replacement,
                                        });
                                    } catch (e) {
                                        await logAction(
                                            'getUserMedia-replacement-deviceId-failed',
                                            { deviceId: candidate.deviceId, error: String(e) }
                                        );
                                    }
                                }
                            } catch {}
                        }

                        if (replacement) {
                            try {
                                s.getTracks().forEach((t) => t.stop());
                            } catch {}
                            streamRef.current = stripAudioTracks(replacement);
                            if (videoRef.current) videoRef.current.srcObject = streamRef.current;
                            await logAction('replacement-attached', {
                                deviceId:
                                    streamRef.current?.getVideoTracks()?.[0]?.getSettings?.()
                                        ?.deviceId || null,
                            });
                            try {
                                const id2 = replacement.getVideoTracks()?.[0]?.getSettings?.()
                                    ?.deviceId as string | undefined;
                                if (id2) setSelectedDeviceId(id2);
                            } catch {}
                            // ensure playback and refresh devices
                            videoRef.current?.play?.().catch(() => {});
                            refreshDevices().catch(() => {});
                            s = replacement;
                        }
                    }
                } catch {}
                try {
                    const id = s.getVideoTracks()?.[0]?.getSettings?.()?.deviceId as
                        | string
                        | undefined;
                    if (id) setSelectedDeviceId(id);
                    else setSelectedDeviceId(deviceId);
                } catch {
                    setSelectedDeviceId(deviceId);
                }

                if (remember && process.env.NODE_ENV === 'development') {
                    setCookie('preferredUsbCameraId', deviceId);
                }
                try {
                    await refreshDevices();
                } catch {}
            } catch {
                toast.error('باز کردن وبکم با خطا مواجه شد');
            }
        },
        [refreshDevices]
    );

    const requestCameraPermission = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                toast.error('دوربین در این مرورگر پشتیبانی نمی‌شود');
                return false;
            }
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            try {
                s.getTracks().forEach((t) => t.stop());
            } catch {}
            setPermissionGranted(true);
            setShowPermissionModal(false);
            try {
                await refreshDevices();
            } catch {}
            return true;
        } catch {
            setPermissionGranted(false);
            toast.error('دسترسی دوربین داده نشد');
            try {
                await refreshDevices();
            } catch {}
            return false;
        }
    }, [refreshDevices]);

    const handleRequestPermission = useEvent(() => {
        setShowPermissionModal(true);
    });

    useEffect(() => {
        let mounted = true;
        const tryAutoOpen = async () => {
            if (!autoOpen || !selectedDeviceId || isCameraOpen) return;
            try {
                type PermissionStatusLike = { state?: string };
                type PermissionsLike = {
                    query?: (desc: { name: string }) => Promise<PermissionStatusLike>;
                };
                const nav = navigator as unknown as { permissions?: PermissionsLike };
                if (nav.permissions && typeof nav.permissions.query === 'function') {
                    try {
                        const res = await nav.permissions.query({ name: 'camera' });
                        if (!mounted) return;
                        if (res && res.state === 'granted') {
                            await openDeviceById(selectedDeviceId);
                        }
                    } catch {}
                } else {
                    try {
                        await openDeviceById(selectedDeviceId);
                    } catch {}
                }
            } catch (err) {
                console.warn('auto-open check failed', err);
            }
        };
        tryAutoOpen();
        return () => {
            mounted = false;
        };
    }, [selectedDeviceId, isCameraOpen, openDeviceById, autoOpen]);

    useEffect(() => {
        const localVideo = videoRef.current;
        refreshDevices();
        (async () => {
            try {
                await requestCameraPermission();
            } catch {}
        })();
        return () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                    setIsCameraOpen(false);
                }
                if (localVideo) localVideo.srcObject = null;
            } catch {}
        };
    }, [refreshDevices, requestCameraPermission]);

    useEffect(() => {
        const localVideo = videoRef.current;
        return () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                    setIsCameraOpen(false);
                }
                if (localVideo) {
                    localVideo.srcObject = null;
                }
            } catch {}
        };
    }, [userData.step]);

    useEffect(() => {
        if (!permissionGranted || !selectedDeviceId) return;

        if (process.env.NODE_ENV === 'development') {
            (async () => {
                try {
                    await openDeviceById(selectedDeviceId);
                } catch (e) {
                    console.warn('auto-open after permission failed', e);
                }
            })();
        }
    }, [permissionGranted, selectedDeviceId, openDeviceById]);

    const processOcr = async (file: File) => {
        setOcrLoading(true);
        try {
            const text = await ocrRecognizeFile(file);
            const fields = parseNationalCardFields(text);
            const ok = !!(fields.nationalId && /^\d{10}$/.test(fields.nationalId));
            setOcrValid(!!ok);
            if (!ok) toast.error('تصویر کارت ملی مطابق الگو تشخیص داده نشد');

            if (onCapture) {
                onCapture(file, ok, fields);
            }

            return { text, fields, valid: ok };
        } catch (e) {
            console.warn('ocr failed', e);

            setOcrValid(false);
            if (onCapture) {
                onCapture(file, false);
            }
            return { text: '', fields: null, valid: false };
        } finally {
            setOcrLoading(false);
        }
    };

    const blobToFile = (blob: Blob, fileName: string) => {
        try {
            return new File([blob], fileName, { type: blob.type });
        } catch {
            return new Blob([blob], { type: blob.type }) as unknown as File;
        }
    };
    const handleCapture = useEvent(() => {
        if (ocrLoading) return;
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
        canvas.toBlob(
            (blob) => {
                if (!blob) return;
                type MaybeCrypto = { crypto?: { randomUUID?: () => string } };
                const maybe = globalThis as unknown as MaybeCrypto;
                const uuid =
                    maybe?.crypto && typeof maybe.crypto.randomUUID === 'function'
                        ? maybe.crypto.randomUUID()
                        : Date.now().toString(36);
                const fileName = `selfie_${uuid}.jpg`;
                const file = blobToFile(blob, fileName);
                const url = URL.createObjectURL(file);
                if (capturedUrl) URL.revokeObjectURL(capturedUrl);
                setCapturedUrl(url);
                processOcr(file).then((res) => {
                    try {
                        if (onConfirm) onConfirm(file, !!res.valid);

                        if (res.valid) {
                            try {
                                if (streamRef.current) {
                                    streamRef.current.getTracks().forEach((t) => t.stop());
                                    streamRef.current = null;
                                    setIsCameraOpen(false);
                                }
                                if (videoRef.current) videoRef.current.srcObject = null;
                            } catch {}
                        }
                    } catch (e) {
                        console.warn('onConfirm handler failed', e);
                    }
                });
            },
            'image/jpeg',
            0.9
        );
    });
    const handleReset = useEvent(async () => {
        if (capturedUrl) {
            URL.revokeObjectURL(capturedUrl);
            setCapturedUrl(null);
            setOcrValid(false);
        }
        try {
            if (selectedDeviceId) {
                const s = await navigator.mediaDevices.getUserMedia({
                    video: { deviceId: { exact: selectedDeviceId } },
                    audio: false,
                });
                streamRef.current = stripAudioTracks(s);
                if (videoRef.current) videoRef.current.srcObject = streamRef.current;
                setIsCameraOpen(true);
            } else {
                toast.error('وبکم انتخاب نشده');
            }
        } catch (err) {
            console.warn('failed to restart camera', err);
            toast.error('دوربین بازنشانی نشد');
        }
    });
    return (
        <Box className="space-y-3">
            <Box className="relative overflow-hidden rounded-md">
                {!capturedUrl ? (
                    isCameraOpen ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="border-primary h-64 w-full rounded-md border-2 border-dashed object-cover p-1"
                        />
                    ) : (
                        <Box
                            className="flex h-64 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            onClick={handleRequestPermission}
                        >
                            <Box className="space-y-2 text-center">
                                <CameraIcon className="mx-auto h-12 w-12" />
                                <p className="text-sm">برای فعال‌سازی دوربین کلیک کنید</p>
                            </Box>
                        </Box>
                    )
                ) : (
                    <Box className="border-primary relative h-full w-full rounded-md border-2 border-dashed p-1 md:h-64">
                        <Image
                            src={capturedUrl}
                            alt="preview"
                            className="max-h-60 rounded-lg object-cover"
                            width={500}
                            height={200}
                        />
                        {!ocrLoading && (
                            <Box className="absolute bottom-4 left-1/2 -translate-x-1/2 transform">
                                {ocrValid ? (
                                    <Box className="flex items-center gap-2 rounded-full border-2 border-white bg-gradient-to-r from-green-500 to-emerald-500 p-2 text-white shadow-xl backdrop-blur-sm">
                                        <CheckIcon className="h-5 w-5" />
                                    </Box>
                                ) : (
                                    <Box
                                        onClick={handleReset}
                                        className="flex items-center gap-2 rounded-full border-2 border-white bg-gradient-to-r from-red-500 to-rose-500 p-2 text-white shadow-xl backdrop-blur-sm"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {ocrLoading && (
                    <Box className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Box className="flex flex-col items-center gap-2">
                            <svg className="h-10 w-10 animate-spin text-white" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                            <Box className="text-sm text-white">در حال پردازش ...</Box>
                        </Box>
                    </Box>
                )}
            </Box>

            <Box className="mt-2"></Box>

            <Box className="flex items-center justify-center gap-2">
                {!capturedUrl && (
                    <Button
                        onClick={handleCapture}
                        size="sm"
                        variant="success"
                        disabled={ocrLoading || !isCameraOpen}
                        loading={ocrLoading}
                    >
                        <span className="flex items-center justify-center gap-2">
                            <CameraIcon className="h-5 w-5" />
                            گرفتن عکس
                        </span>
                    </Button>
                )}

                {capturedUrl && (
                    <Button
                        size="sm"
                        onClick={handleReset}
                        disabled={ocrLoading}
                        loading={ocrLoading}
                        className="bg-error"
                    >
                        <ArrowPathIcon className="ml-2 h-5 w-5" />
                        <span>بازنشانی</span>
                    </Button>
                )}
            </Box>

            <Modal
                isOpen={showPermissionModal}
                onClose={() => setShowPermissionModal(false)}
                title="دسترسی به دوربین"
                size="md"
            >
                <Box className="space-y-6 p-2 text-center">
                    <Box className="from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-700 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br">
                        <CameraIcon className="text-primary-600 h-10 w-10 dark:text-blue-400" />
                    </Box>

                    <Box className="space-y-3">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            دسترسی به دوربین
                        </h3>
                        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
                            برای اسکن کارت ملی، نیاز به دسترسی دوربین دستگاه داریم. لطفاً در پنجره
                            بازشده دسترسی را تأیید کنید.
                        </p>
                    </Box>

                    <Box className="bg-secondary-50 dark:bg-secondary-900/20 border-secondary-200 dark:border-secondary-800 rounded-lg border p-4">
                        <p className="text-secondary-800 dark:text-secondary-200 text-sm">
                            <strong>راهنما:</strong> اگر دسترسی داده نشد، از تنظیمات مرورگر دسترسی
                            دوربین را فعال کنید.
                        </p>
                    </Box>

                    <Box className="flex justify-center gap-3">
                        <Button
                            onClick={() => setShowPermissionModal(false)}
                            variant="secondary"
                            size="sm"
                        >
                            انصراف
                        </Button>
                        <Button onClick={requestCameraPermission} variant="primary" size="sm">
                            <CameraIcon className="ml-2 h-4 w-4" />
                            فعال‌سازی دوربین
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
