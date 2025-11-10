'use client';

import { List, ListItem } from '@/components/ui';
import { useUser } from '@/contexts/UserContext';
import { useSelfieStep } from '@/hooks/useSelfieStep';
import { convertToFile, createBPMSFormData } from '@/lib/fileUtils';
import { ArrowPathIcon, CameraIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { Box, Typography } from '../ui/core';
import { Button } from '../ui/core/Button';
import LoadingButton from '../ui/core/LoadingButton';

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    stream: MediaStream | null;
    capturedPhoto: string | null;
    cameraLoading: boolean;
    closenessPercent: number;
    obstructionRatio: number;
}

function CameraView({
    videoRef,
    canvasRef,
    stream,
    capturedPhoto,
    cameraLoading,
    closenessPercent,
    obstructionRatio,
}: CameraViewProps) {
    return (
        <Box className="bg-dark relative mx-auto h-64 w-64 overflow-hidden rounded-full md:h-70 md:w-70">
            {cameraLoading && (
                <Box className="absolute inset-0 z-30 flex flex-col items-center justify-center space-y-4 rounded-full bg-gray-900 text-white">
                    <Box className="border-t-primary-500 h-12 w-12 animate-spin rounded-full border-4 border-gray-300"></Box>
                    <Box className="text-center">
                        <Typography variant="h3" className="mb-2 text-lg font-semibold">
                            در حال روشن کردن دوربین
                        </Typography>
                        <Typography variant="body1" className="text-sm text-gray-300">
                            لطفاً صبر کنید...
                        </Typography>
                    </Box>
                </Box>
            )}

            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute top-0 left-0 z-10 h-full w-full -scale-x-100 transform bg-black object-cover ${
                    stream && !capturedPhoto && !cameraLoading
                        ? 'visible opacity-100'
                        : 'invisible opacity-0'
                }`}
                controls={false}
                disablePictureInPicture
                disableRemotePlayback
            />

            {capturedPhoto && (
                <Box className="relative z-20 h-full w-full">
                    <Image
                        src={capturedPhoto}
                        alt="Captured selfie"
                        className="h-full w-full scale-x-100 transform rounded-full object-cover"
                        width={300}
                        height={300}
                    />
                    <Box className="border-opacity-20 pointer-events-none absolute inset-0 rounded-full border-2 border-white"></Box>
                </Box>
            )}

            {!capturedPhoto && stream && !cameraLoading && (
                <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full -rotate-90">
                    <circle
                        className="transition-all duration-300"
                        stroke={
                            closenessPercent === 100 && obstructionRatio < 0.15
                                ? 'var(--color-success-500)'
                                : closenessPercent < 80
                                  ? 'var(--color-error-800)'
                                  : 'var(--color-warning-500)'
                        }
                        strokeWidth="4"
                        fill="none"
                        r="49%"
                        cx="50%"
                        cy="50%"
                        style={{
                            strokeDasharray: `${2 * Math.PI * 49}%`,
                            strokeDashoffset: `${2 * Math.PI * 49 * (1 - (closenessPercent === 100 && obstructionRatio < 0.15 ? 100 : Math.min(closenessPercent, 95)) / 100)}%`,
                        }}
                    />
                </svg>
            )}
            <canvas ref={canvasRef} className="hidden" />
        </Box>
    );
}

interface InstructionsProps {
    capturedPhoto: string | null;
    onRetake: () => void;
    isUploading: boolean;
}

function Instructions({ capturedPhoto, onRetake, isUploading }: InstructionsProps) {
    return (
        <Box className="rounded-xl bg-gray-100 p-4">
            {!capturedPhoto ? (
                <ul className="space-y-1 text-center text-sm">
                    <li className="text-primary-800 font-bold">
                        صورت خود را کاملاً در قاب قرار دهید
                    </li>
                    <li className="text-error font-bold">
                        در مکانی مناسب و با روشنایی کافی قرار بگیرید
                    </li>
                    <li>منتظر بمانید تا صورت شما تشخیص داده شود</li>
                    <li>زمانی که دکمه «گرفتن عکس» سبز شد، کلیک کنید</li>
                </ul>
            ) : (
                <>
                    <ul className="space-y-1 text-center text-sm">
                        <li className="text-error-800 font-bold">عکس خود را بررسی کنید</li>
                        <li>اگر عکس مناسب است، روی «مرحله بعد» کلیک کنید</li>
                        <li>برای گرفتن عکس جدید، روی «عکس جدید» کلیک کنید</li>
                    </ul>
                    <Box className="mt-3 flex justify-center gap-4">
                        <Button
                            onClick={onRetake}
                            disabled={isUploading}
                            className="bg-warning-600 flex items-center justify-center px-5 py-3"
                        >
                            <ArrowPathIcon className="h-6 w-6 text-white" />
                            <Typography variant="body1" className="text-xs font-medium text-white">
                                عکس جدید
                            </Typography>
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
}

interface ControlsProps {
    capturedPhoto: string | null;
    isUploading: boolean;
    onConfirm: () => void;
}

function Controls({ capturedPhoto, isUploading, onConfirm }: ControlsProps) {
    return (
        <Box className="flex w-full items-center gap-2">
            <LoadingButton
                onClick={onConfirm}
                loading={isUploading}
                disabled={!capturedPhoto || isUploading}
            />
        </Box>
    );
}

interface StatusMessageProps {
    faceDetected: boolean;
    faceTooFar: boolean;
    closenessPercent: number;
    obstructionRatio: number;
    eyeFeatureRatio: number;
    MAX_OBSTRUCTION: number;
    MIN_EYE_RATIO: number;
}

function StatusMessage({
    faceDetected,
    faceTooFar,
    closenessPercent,
    obstructionRatio,
    eyeFeatureRatio,
    MAX_OBSTRUCTION,
    MIN_EYE_RATIO,
}: StatusMessageProps) {
    if (!faceDetected) {
        const message = faceTooFar
            ? 'لطفاً نزدیک‌تر بیایید'
            : obstructionRatio <= MAX_OBSTRUCTION
              ? 'عدم وضوح'
              : eyeFeatureRatio < MIN_EYE_RATIO
                ? 'مطمئن شوید چشم‌ها و ابروها به وضوح دیده می‌شوند'
                : 'صورت خود را در مقابل دوربین قرار دهید';

        return (
            <Typography variant="body1" className="text-center text-sm font-medium text-red-500">
                {message}
            </Typography>
        );
    }

    if (closenessPercent >= 85) {
        return (
            <Typography variant="body1" className="text-center text-sm font-medium text-green-500">
                صورت تشخیص داده شد
            </Typography>
        );
    }

    return null;
}

interface CaptureButtonProps {
    onCapture: () => void;
    disabled: boolean;
}

function CaptureButton({ onCapture, disabled }: CaptureButtonProps) {
    return (
        <Box className="flex flex-col items-center space-y-2">
            <Button
                onClick={onCapture}
                disabled={disabled}
                className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-300 ${
                    !disabled
                        ? 'bg-success-500 hover:bg-success-600 cursor-pointer text-white shadow-lg hover:shadow-xl active:scale-95'
                        : 'cursor-not-allowed bg-gray-400 text-gray-600 opacity-60'
                }`}
            >
                <CameraIcon className="h-5 w-5" />
                <Typography variant="body1" className="text-sm font-medium">
                    گرفتن عکس
                </Typography>
            </Button>
        </Box>
    );
}

function LoadingState() {
    return (
        <Box className="mx-auto max-w-md space-y-4">
            <Box className="relative mx-auto aspect-square h-80 w-80 overflow-hidden rounded-full bg-black">
                <Box className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-gray-900 text-white">
                    <CameraIcon className="h-16 w-16 text-gray-400" />
                    <Box className="text-center">
                        <Typography variant="h3" className="mb-2 text-lg font-semibold">
                            آماده عکس‌گیری
                        </Typography>
                        <Typography variant="body1" className="mb-4 text-sm text-gray-300">
                            در حال بارگذاری
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

interface ErrorStateProps {
    error: string;
    onRetry: () => void;
    onCancel: () => void;
}

function ErrorState({ error, onRetry, onCancel }: ErrorStateProps) {
    return (
        <Box className="mx-auto max-w-md space-y-4 text-center">
            <Box className="bg-error-50 border-error-200 rounded-xl border p-6">
                <CameraIcon className="text-error-400 mx-auto mb-4 h-12 w-12" />
                <Typography variant="h3" className="text-error-800 mb-2 text-lg font-semibold">
                    خطا در دسترسی به دوربین
                </Typography>
                <Typography variant="body1" className="text-error-700 mb-4 text-sm">
                    {error}
                </Typography>
                <Box className="space-y-2">
                    <Typography variant="body1" className="text-error-600 text-xs">
                        لطفاً:
                    </Typography>
                    <List className="text-error-600 list-inside list-disc text-right text-xs">
                        <ListItem>دسترسی دوربین را در تنظیمات مرورگر فعال کنید</ListItem>
                        <ListItem>از https استفاده کنید</ListItem>
                    </List>
                </Box>
                <Box className="mt-4 flex space-x-3 space-x-reverse">
                    <Button onClick={onCancel} size="sm" variant="destructive">
                        انصراف
                    </Button>
                    <Button onClick={onRetry} size="sm" variant="outline">
                        تلاش مجدد
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

export default function SelfieStep() {
    const { userData, setUserData, clearUserData } = useUser();
    const router = useRouter();
    const {
        videoRef,
        canvasRef,
        stream,
        capturedPhoto,
        error,
        isUploading,
        isClient,
        cameraLoading,
        faceDetected,
        faceTooFar,
        closenessPercent,
        obstructionRatio,
        eyeFeatureRatio,
        MIN_EYE_RATIO,
        MAX_OBSTRUCTION,
        startCamera,
        capturePhoto,
        retakePhoto,
        setIsUploading,
    } = useSelfieStep();

    const handleConfirm = useCallback(async () => {
        setIsUploading(true);
        const file = await convertToFile(capturedPhoto, 'selfie', 'image/jpeg', 0.8);
        const formData = createBPMSFormData(
            file!,
            'virtual-open-deposit',
            userData.processId,
            'GovahInquiry'
        );
        await axios
            .post('/api/bpms/deposit-files', formData)
            .then((res) => {
                const { data } = res;
                if (data.body.randomText === null) {
                    toast.error('تصویر شما تایید نشد. لطفاً دوباره تلاش کنید.');
                    clearUserData();
                    router.push('/');
                }
                setUserData({ ...userData, randomText: data?.body?.randomText, step: 3 });
            })
            .catch(() => {
                toast.error('عملیات با خطا مواجه شد.');
                clearUserData();
                router.push('/');
            })
            .finally(() => setIsUploading(false));
    }, [capturedPhoto, userData, setUserData, clearUserData, setIsUploading, router]);

    const handleCapture = useCallback(() => {
        if (closenessPercent === 100 && obstructionRatio < 0.15) {
            capturePhoto();
        }
    }, [closenessPercent, obstructionRatio, capturePhoto]);

    const handleCancel = useCallback(() => {
        setUserData({ step: 1 });
    }, [setUserData]);

    if (error) {
        return <ErrorState error={error} onRetry={startCamera} onCancel={handleCancel} />;
    }

    if (!isClient) {
        return <LoadingState />;
    }

    const canCapture = closenessPercent === 100 && obstructionRatio < 0.15;

    return (
        <Box className="mx-auto max-w-md space-y-4">
            <CameraView
                videoRef={videoRef}
                canvasRef={canvasRef}
                stream={stream}
                capturedPhoto={capturedPhoto}
                cameraLoading={cameraLoading}
                closenessPercent={closenessPercent}
                obstructionRatio={obstructionRatio}
            />

            {!capturedPhoto && stream && !cameraLoading && closenessPercent <= 80 && (
                <Box className="h-3 space-y-3 text-center">
                    <StatusMessage
                        faceDetected={faceDetected}
                        faceTooFar={faceTooFar}
                        closenessPercent={closenessPercent}
                        obstructionRatio={obstructionRatio}
                        eyeFeatureRatio={eyeFeatureRatio}
                        MAX_OBSTRUCTION={MAX_OBSTRUCTION}
                        MIN_EYE_RATIO={MIN_EYE_RATIO}
                    />
                </Box>
            )}

            {!capturedPhoto && stream && !cameraLoading && (
                <CaptureButton onCapture={handleCapture} disabled={!canCapture} />
            )}

            <Instructions
                capturedPhoto={capturedPhoto}
                onRetake={retakePhoto}
                isUploading={isUploading}
            />

            <Controls
                capturedPhoto={capturedPhoto}
                isUploading={isUploading}
                onConfirm={handleConfirm}
            />
        </Box>
    );
}
