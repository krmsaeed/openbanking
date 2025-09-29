"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Select, Typography } from '@/components/ui';
import Image from 'next/image';
import { Button } from '@/components/ui/core/Button';
import toast from 'react-hot-toast';
import { CheckIcon, XMarkIcon, CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Controller, useForm } from 'react-hook-form';
import { ocrRecognizeFile, parseNationalCardFields, OcrFields } from '@/lib/ocr';
type BranchOption = { label: string; value: string };
type Props = {
    branches?: BranchOption[];
    onComplete: (file: File, branch: string) => void;
    onBack?: () => void;
};

export default function NationalCardScanner({ branches = [], onComplete, onBack }: Props) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

    const refreshDevices = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
            const devices = await navigator.mediaDevices.enumerateDevices();
            const allVids = devices.filter((d) => d.kind === 'videoinput');
            // During development prefer USB/external webcams so devs can test with USB cameras.
            // In production use the system default camera (don't filter by USB labels).
            const preferUsb = process.env.NODE_ENV === 'development';
            let vids: MediaDeviceInfo[] = [];
            if (preferUsb) {
                vids = allVids.filter((v) => /usb|external|webcam/i.test(v.label));
                if (vids.length === 0) vids = allVids;
            } else {
                vids = allVids;
            }
            setVideoDevices(vids);
            if (!selectedDeviceId && vids.length > 0) setSelectedDeviceId(vids[0].deviceId);
        } catch (e) {
            console.warn('refreshDevices failed', e);
        }
    }, [selectedDeviceId]);



    const openDeviceById = useCallback(async (deviceId: string, remember = false) => {
        setIsCameraOpen(true);
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
            try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { }
            const s = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: deviceId } }, audio: false });
            streamRef.current = s;
            if (videoRef.current) videoRef.current.srcObject = s;
            try {
                const id = s.getVideoTracks()?.[0]?.getSettings?.()?.deviceId as string | undefined;
                if (id) setSelectedDeviceId(id);
                else setSelectedDeviceId(deviceId);
            } catch { setSelectedDeviceId(deviceId); }
            // only persist a preferred USB camera during development where devs may expect this
            if (remember && process.env.NODE_ENV === 'development') localStorage.setItem('preferredUsbCameraId', deviceId);
            try { await refreshDevices(); } catch { }
        } catch (e) {
            console.warn('openDeviceById failed', e);
            toast.error('باز کردن وبکم با خطا مواجه شد');
        }
    }, [refreshDevices]);
    const [isCameraOpen, setIsCameraOpen] = useState(false);

    // whether camera permission was previously granted
    const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

    const requestCameraPermission = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return false;
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            // stop immediately - we only requested to get permission and device labels
            try { s.getTracks().forEach((t) => t.stop()); } catch { }
            setPermissionGranted(true);
            toast.success('دسترسی دوربین اعطا شد');
            try { await refreshDevices(); } catch { }
            return true;
        } catch (err) {
            console.warn('camera permission denied or failed', err);
            setPermissionGranted(false);
            toast.error('دسترسی دوربین داده نشد');
            try { await refreshDevices(); } catch { }
            return false;
        }
    }, [refreshDevices]);

    // If a device is selected and permission is already granted, open it automatically.
    useEffect(() => {
        let mounted = true;
        const tryAutoOpen = async () => {
            if (!selectedDeviceId || isCameraOpen) return;
            try {
                type PermissionStatusLike = { state?: string };
                type PermissionsLike = { query?: (desc: { name: string }) => Promise<PermissionStatusLike> };
                const nav = navigator as unknown as { permissions?: PermissionsLike };
                if (nav.permissions && typeof nav.permissions.query === 'function') {
                    try {
                        const res = await nav.permissions.query({ name: 'camera' });
                        if (!mounted) return;
                        if (res && res.state === 'granted') {
                            await openDeviceById(selectedDeviceId);
                        }
                    } catch {
                        // permissions.query may throw on some browsers; fallback to no-op
                    }
                } else {
                    // No permissions API - try opening but don't force prompt
                    try { await openDeviceById(selectedDeviceId); } catch { }
                }
            } catch (err) {
                console.warn('auto-open check failed', err);
            }
        };
        tryAutoOpen();
        return () => { mounted = false; };
    }, [selectedDeviceId, isCameraOpen, openDeviceById]);
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [, setOcrText] = useState<string>('');
    const [, setOcrFields] = useState<OcrFields | null>(null);
    const [ocrValid, setOcrValid] = useState<boolean>(false);
    const [ocrLoading, setOcrLoading] = useState<boolean>(false);


    const defaultBranches = branches.length
        ? branches.map((b) => ({ label: b, value: b }))
        : [
            { label: 'شعبه مرکزی', value: 'central' },
            { label: 'شعبه شهرک غرب', value: 'shahrak' },
            { label: 'شعبه آزادی', value: 'azadi' },
            { label: 'شعبه میرداماد', value: 'mirdamad' },
        ];
    const {
        control,
        getValues,
        setError,
        formState: { errors }
    } = useForm();

    // start camera stream when component mounts
    useEffect(() => {
        const localVideo = videoRef.current;

        // refresh device list (USB-only flow).
        refreshDevices();

        // prompt user for camera permission so device labels become available and
        // we can auto-open the preferred camera. This will show the browser prompt.
        // We're not forcing open here; openDeviceById will run separately if permission is granted.
        (async () => {
            try {
                await requestCameraPermission();
            } catch { }
        })();

        return () => {
            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                    setIsCameraOpen(false);
                }
                if (localVideo) localVideo.srcObject = null;
            } catch { }
        };
    }, [refreshDevices, openDeviceById, requestCameraPermission]);

    // When permission is granted, auto-open the selected device (helpful in dev)
    useEffect(() => {
        if (!permissionGranted) return;
        if (!selectedDeviceId) return;
        // prefer auto-open in development only
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

    const canCapture = true;

    const handleCapture = () => {
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
        canvas.toBlob((blob) => {
            if (!blob) return;
            const file = new File([blob], `national-card-${Date.now()}.jpg`, { type: blob.type });
            const url = URL.createObjectURL(file);
            if (capturedUrl) URL.revokeObjectURL(capturedUrl);
            setCapturedFile(file);
            setCapturedUrl(url);

            // run OCR and validate
            (async () => {
                setOcrLoading(true);
                try {
                    const text = await ocrRecognizeFile(file);
                    setOcrText(text);
                    const fields = parseNationalCardFields(text);
                    setOcrFields(fields);
                    const ok = !!(fields.nationalId && /^\d{10}$/.test(fields.nationalId));
                    setOcrValid(!!ok);
                    if (!ok) toast.error('تصویر کارت ملی مطابق الگو تشخیص داده نشد');
                } catch (e) {
                    console.warn('ocr on capture failed', e);
                    setOcrText(''); setOcrFields(null); setOcrValid(false);
                } finally {
                    setOcrLoading(false);
                }
            })();

            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                    setIsCameraOpen(false);
                }
                if (videoRef.current) videoRef.current.srcObject = null;
            } catch {
            }
        }, 'image/jpeg', 0.90);
    };

    const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (ocrLoading) return;
        const f = e.target.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        if (capturedUrl) URL.revokeObjectURL(capturedUrl);
        setCapturedFile(f);
        setCapturedUrl(url);

        // run OCR and validate on uploaded file
        (async () => {
            setOcrLoading(true);
            try {
                const text = await ocrRecognizeFile(f);
                setOcrText(text);
                const fields = parseNationalCardFields(text);
                setOcrFields(fields);
                const ok = !!(fields.nationalId && /^\d{10}$/.test(fields.nationalId));
                setOcrValid(!!ok);
                if (!ok) toast.error('تصویر کارت ملی مطابق الگو تشخیص داده نشد');
            } catch (e) {
                console.warn('ocr on upload failed', e);
                setOcrText(''); setOcrFields(null); setOcrValid(false);
            } finally {
                setOcrLoading(false);
            }
        })();

        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
            if (videoRef.current) videoRef.current.srcObject = null;
        } catch {

        }
    };

    const handleConfirm = () => {
        if (!capturedFile) return toast.error('لطفا ابتدا کارت را اسکن کنید');
        if (!ocrValid) return toast.error('لطفا تصویر کارت ملی معتبر بارگذاری کنید');
        const selectedBranch = (getValues('branch') || '') as string;
        if (!selectedBranch) {
            setError('branch', { type: 'manual', message: 'لطفا یک شعبه انتخاب کنید' });
            return;
        }
        onComplete(capturedFile, selectedBranch);
    };

    return (
        <Box className="space-y-4 ">
            <Box className="flex flex-col gap-4">
                <Box>
                    {/* <div className="flex gap-2 items-center">

                        <Button variant="ghost" size="sm" onClick={async () => { if (selectedDeviceId) await openDeviceById(selectedDeviceId); else toast('وبکم انتخاب نشده'); }}>باز کردن</Button>

                    </div> */}
                    <div className="relative bg-black rounded overflow-hidden">
                        {!capturedUrl ? (
                            isCameraOpen ? (
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                            ) : (
                                <div className="w-full h-64 flex items-center justify-center bg-gray-50 text-gray-500">وبکم باز نشده</div>
                            )
                        ) : (
                            <div className="w-full h-64 relative">
                                <Image src={capturedUrl} alt="preview" fill style={{ objectFit: 'contain' }} unoptimized />
                            </div>
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                        {ocrLoading && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <svg className="animate-spin h-10 w-10 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                    </svg>
                                    <div className="text-white text-sm">در حال پردازش ...</div>
                                </div>
                            </div>
                        )}
                    </div>


                    <div className="mt-2">
                        {ocrLoading &&
                            <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                        }
                        {!ocrLoading && capturedUrl && (
                            <div className="mt-2 text-sm">
                                <p className={`mt-2 text-sm ${ocrValid ? 'text-green-600' : 'text-red-600'}`}>{ocrValid ? 'کارت ملی معتبر شناسایی شد' : 'کارت ملی نامعتبر'}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 mt-3 items-center">

                        <div className="flex gap-2">
                            {!capturedUrl && <Button
                                onClick={handleCapture}
                                size="sm"
                                disabled={ocrLoading}
                                className={`${!canCapture ? 'opacity-50 pointer-events-none' : ''} ${ocrLoading ? 'opacity-60 pointer-events-none' : ''}`}
                            >

                                <span className="flex items-center gap-2 justify-center"><CameraIcon className="w-5 h-5" /> گرفتن عکس</span>
                            </Button>}
                            <input id="national-card-file-input" type="file" accept="image/*" onChange={handleFileFallback} className="hidden" />

                            {capturedUrl &&
                                <Button
                                    size="sm"
                                    onClick={async () => {
                                        if (capturedUrl) {
                                            URL.revokeObjectURL(capturedUrl);
                                            setCapturedUrl(null);
                                            setCapturedFile(null);
                                        }
                                        // restart camera for retake
                                        try {
                                            if (selectedDeviceId) {
                                                const s = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: selectedDeviceId } }, audio: false });
                                                streamRef.current = s;
                                                if (videoRef.current) videoRef.current.srcObject = s;
                                            } else {
                                                toast.error('وبکم انتخاب نشده');
                                                return;
                                            }
                                        } catch (err) {
                                            console.warn('failed to restart camera', err);
                                            toast.error('دوربین بازنشانی نشد');
                                        }
                                    }}
                                    disabled={ocrLoading}
                                    className={ocrLoading ? 'opacity-60 pointer-events-none bg-gray-200' : ''}
                                >
                                    <ArrowPathIcon className="w-5 h-5 ml-2 " />
                                    <span >بازنشانی</span>
                                </Button>}
                        </div>
                    </div>

                </Box>


                <Box>
                    <label className="block text-sm text-gray-700 mb-2">انتخاب شعبه</label>
                    <Controller
                        name='branch'
                        control={control}
                        defaultValue={''}
                        rules={{ required: 'لطفا یک شعبه انتخاب کنید' }}
                        render={({ field }) => (
                            <>
                                <Select
                                    {...field}
                                    autocomplete
                                    placeholder='شعبه'
                                    options={defaultBranches as BranchOption[]}
                                />
                                {errors.branch?.message && (
                                    <p className="mt-2 text-sm text-red-600">{String(errors.branch.message)}</p>
                                )}
                            </>
                        )}
                    />

                </Box>

                <Box className="w-full flex gap-2 items-center">
                    <Button
                        onClick={onBack}
                        variant="destructive"
                        className="w-full flex justify-center gapo-3 px-5 py-3 items-center text-white"
                    >
                        <XMarkIcon className="w-5 h-5 text-white" />
                        بازگشت
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirm}
                        className="  text-white gap-3 px-5 py-3 flex items-center justify-center  w-full bg-primary-600 hover:bg-primary-700"
                    >
                        <CheckIcon className="h-5 w-5" />
                        <Typography variant="body1" className="text-white text-xs font-medium">
                            تایید
                        </Typography>
                    </Button>

                </Box>
            </Box>
        </Box>
    );
}
