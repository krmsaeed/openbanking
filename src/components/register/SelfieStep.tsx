'use client';

import { useUser } from '@/contexts/UserContext';
import { useSelfieStep } from '@/hooks/useSelfieStep';
import { convertToFile, createBPMSFormData } from '@/lib/fileUtils';
import { ArrowPathIcon, CameraIcon, CheckIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import Image from 'next/image';
import { Box, Typography } from '../ui/core';
import { Button } from '../ui/core/Button';
import LoadingButton from '../ui/core/LoadingButton';

export default function CameraSelfie() {
    const { userData, setUserData } = useUser();
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

    const handleConfirm = async () => {
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
            .then((response) => {
                const { data } = response.data;
                setUserData({ ...userData, step: 3, randomText: data.body.randomText });
            })
            .finally(() => setIsUploading(false));
    };

    if (error) {
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
                        <ul className="text-error-600 list-inside list-disc text-right text-xs">
                            <li>دسترسی دوربین را در تنظیمات مرورگر فعال کنید</li>
                            <li>از https استفاده کنید</li>
                        </ul>
                    </Box>
                    <Box className="space-x mt-4 flex space-x-3">
                        <Button onClick={startCamera} size="sm" variant="outline">
                            تلاش مجدد
                        </Button>

                        <Button
                            onClick={() => setUserData({ step: 1 })}
                            size="sm"
                            variant="destructive"
                        >
                            انصراف
                        </Button>
                    </Box>
                </Box>
            </Box>
        );
    }

    if (!isClient) {
        return (
            <Box className="mx-auto max-w-md space-y-4">
                <Box className="mb-4 text-center">
                    <Typography variant="h2" className="text-xl font-bold text-gray-800">
                        عکس سلفی
                    </Typography>
                    <Typography variant="body1" className="text-sm text-gray-600">
                        برای احراز هویت، عکس سلفی خود را بگیرید
                    </Typography>
                </Box>
                <Box className="relative mx-auto aspect-square h-80 w-80 overflow-hidden rounded-full bg-black">
                    <Box className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-gray-900 text-white">
                        <CameraIcon className="h-16 w-16 text-gray-400" />
                        <Box className="text-center">
                            <Typography variant="h3" className="mb-2 text-lg font-semibold">
                                آماده عکس‌گیری
                            </Typography>
                            <Typography variant="body1" className="mb-4 text-sm text-gray-300">
                                در حال بارگذاری...
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="mx-auto max-w-md space-y-4">
            <Box className="bg-dark relative mx-auto h-70 w-70 overflow-hidden rounded-full">
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
                            src={capturedPhoto ?? ''}
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
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Box>

            {!capturedPhoto && stream && !cameraLoading && closenessPercent <= 80 && (
                <Box className="h-3 space-y-3 text-center">
                    <Typography
                        variant="body1"
                        className={`text-center text-sm font-medium transition-colors duration-300 ${!faceDetected && 'text-red-500'} ${faceDetected && closenessPercent >= 85 && 'text-green-500'}`}
                    >
                        {!faceDetected &&
                            (faceTooFar
                                ? 'لطفاً نزدیک‌تر بیایید'
                                : obstructionRatio <= MAX_OBSTRUCTION
                                  ? 'عدم وضوح '
                                  : eyeFeatureRatio < MIN_EYE_RATIO
                                    ? ' مطمئن شوید چشم‌ها و ابروها به وضوح دیده می‌شوند'
                                    : 'صورت خود را در مقابل دوربین قرار دهید')}
                    </Typography>
                </Box>
            )}

            {!capturedPhoto && stream && !cameraLoading && (
                <Box className="flex flex-col items-center space-y-2">
                    <Button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (closenessPercent === 100 && obstructionRatio < 0.15) {
                                capturePhoto();
                            }
                        }}
                        disabled={!(closenessPercent === 100 && obstructionRatio < 0.15)}
                        className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-all duration-300 ${
                            closenessPercent === 100 && obstructionRatio < 0.15
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
            )}
            <Box className="rounded-xl bg-gray-200 p-4">
                {!capturedPhoto ? (
                    <ul className="space-y-1 text-center text-sm">
                        <li className="text-primary-800 font-bold">
                            {' '}
                            صورت خود را کاملاً در قاب قرار دهید
                        </li>
                        <li> مستقیم به دوربین نگاه کنید</li>
                        <li> منتظر بمانید تا صورت شما تشخیص داده شود</li>
                        <li> زمانی که دکمه گرفتن عکس سبز شد، کلیک کنید </li>
                    </ul>
                ) : (
                    <>
                        <ul className="space-y-1 text-center text-sm">
                            <li className="text-error-800 font-bold"> عکس خود را بررسی کنید</li>
                            <li> اگر عکس مناسب است، روی «تایید» کلیک کنید</li>
                            <li> برای گرفتن عکس جدید، روی «عکس جدید» کلیک کنید</li>
                        </ul>
                        <Box className="mt-3 flex justify-center gap-4">
                            <Button
                                onClick={retakePhoto}
                                className="w-fu bg-error-400 flex items-center justify-center px-5 py-3"
                            >
                                <ArrowPathIcon className="h-6 w-6 text-white" />
                                <Typography
                                    variant="body1"
                                    className="text-xs font-medium text-white"
                                >
                                    عکس جدید
                                </Typography>
                            </Button>
                        </Box>
                    </>
                )}
            </Box>

            <Box className="flex w-full items-center gap-2">
                {/* <Button
                    onClick={() => setUserData({ step: 1 })}
                    variant="destructive"
                    className="gapo-3 flex w-full items-center justify-center px-5 py-3 text-white"
                >
                    <XMarkIcon className="h-5 w-5 text-white" />
                    انصراف
                </Button> */}
                <LoadingButton
                    onClick={handleConfirm}
                    loading={isUploading}
                    disabled={!capturedPhoto || isUploading}
                    className="bg-primary-400 flex w-full items-center justify-center gap-3 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {!isUploading && <CheckIcon className="h-5 w-5" />}
                    <Typography variant="body1" className="text-xs font-medium text-white">
                        {isUploading ? 'در حال ارسال...' : 'مرحله بعد'}
                    </Typography>
                </LoadingButton>
            </Box>
        </Box>
    );
}
