"use client";

import { useEffect, useRef, useState } from 'react';
import { Box, Select, Typography } from '@/components/ui';
import Image from 'next/image';
import { Button } from '@/components/ui/core/Button';
import toast from 'react-hot-toast';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Controller, useForm } from 'react-hook-form';
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
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    // branch is stored in react-hook-form; read on confirm

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
    useEffect(() => {
        // start/stop helpers so we can restart camera on demand (e.g., Reset/Retake)
        let mounted = true;

        const startStream = async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                if (!mounted) {
                    s.getTracks().forEach((t) => t.stop());
                    return;
                }
                streamRef.current = s;
                if (videoRef.current) videoRef.current.srcObject = s;
            } catch (err) {
                console.warn('camera denied or unavailable', err);
                toast.error('دسترسی به دوربین امکان‌پذیر نیست. لطفا از بارگذاری تصویر استفاده کنید.');
            }
        };

        const stopStream = () => {
            if (streamRef.current) {
                try {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                } catch {
                    // ignore
                }
                streamRef.current = null;
            }
            if (videoRef.current) videoRef.current.srcObject = null;
        };

        startStream();

        return () => {
            mounted = false;
            stopStream();
            if (capturedUrl) URL.revokeObjectURL(capturedUrl);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCapture = () => {
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

            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                    streamRef.current = null;
                }
                if (videoRef.current) videoRef.current.srcObject = null;
            } catch {
            }
        }, 'image/jpeg', 0.9);
    };

    const handleFileFallback = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        if (capturedUrl) URL.revokeObjectURL(capturedUrl);
        setCapturedFile(f);
        setCapturedUrl(url);
        // stop camera stream since user provided a file
        try {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
            if (videoRef.current) videoRef.current.srcObject = null;
        } catch {
            // ignore
        }
    };

    const handleConfirm = () => {
        if (!capturedFile) return toast.error('لطفا ابتدا کارت را اسکن کنید');
        const selectedBranch = (getValues('branch') || '') as string;
        if (!selectedBranch) {
            setError('branch', { type: 'manual', message: 'لطفا یک شعبه انتخاب کنید' });
            return;
        }
        onComplete(capturedFile, selectedBranch);
    };

    return (
        <Box className="space-y-4 ">
            <Typography variant="body1" className="font-medium text-md text-right">
                اسکن کارت ملی
            </Typography>
            <Box className="flex flex-col gap-4">
                <Box>

                    <div className="relative bg-black rounded overflow-hidden">
                        {!capturedUrl ? (
                            <video ref={videoRef} autoPlay playsInline muted className="w-full h-64 object-cover" />
                        ) : (
                            <div className="w-full h-64 relative">
                                <Image src={capturedUrl} alt="preview" fill style={{ objectFit: 'contain' }} unoptimized />
                            </div>
                        )}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    <div className="flex gap-2 mt-3 justify-center">
                        <Button onClick={handleCapture} size="sm">
                            گرفتن عکس
                        </Button>
                        <input id="national-card-file-input" type="file" accept="image/*" onChange={handleFileFallback} className="hidden" />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (capturedUrl) {
                                    URL.revokeObjectURL(capturedUrl);
                                    setCapturedUrl(null);
                                    setCapturedFile(null);
                                }
                                // restart camera for retake
                                (async () => {
                                    try {
                                        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
                                        streamRef.current = s;
                                        if (videoRef.current) videoRef.current.srcObject = s;
                                    } catch (err) {
                                        console.warn('failed to restart camera', err);
                                    }
                                })();
                            }}
                        >
                            بازنشانی
                        </Button>
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
