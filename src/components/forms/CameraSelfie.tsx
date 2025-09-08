"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { CameraIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../ui/core/Button";
import Image from "next/image";
import { Box, Typography } from "../ui/core";

interface CameraSelfieProps {
    onPhotoCapture: (photo: File) => void;
    onCancel?: () => void;
}

export default function CameraSelfie({ onPhotoCapture, onCancel }: CameraSelfieProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [faceConfidence, setFaceConfidence] = useState(0);
    const [faceTooFar, setFaceTooFar] = useState(false);
    const [closenessPercent, setClosenessPercent] = useState(0);
    const [lastBoxSkin, setLastBoxSkin] = useState<number | null>(null);
    const [targetSkin, setTargetSkin] = useState<number | null>(null);
    const [obstructionRatio, setObstructionRatio] = useState(0);
    const [eyeFeatureRatio, setEyeFeatureRatio] = useState(0);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        void setTargetSkin;
    }, [lastBoxSkin, targetSkin, setTargetSkin]);

    const MIN_EYE_RATIO = 0.03;
    const MAX_OBSTRUCTION = 0.08;

    const detectFace = useCallback(() => {
        if (!videoRef.current || !stream) return;

        const video = videoRef.current;

        if (video.readyState < 2 || video.paused) {
            return;
        }

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) return;

        try {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;

            if (canvas.width === 0 || canvas.height === 0) {
                return;
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const faceX = Math.floor(canvas.width * 0.5);
            const faceY = Math.floor(canvas.height * 0.4);
            const faceRadius = Math.min(canvas.width, canvas.height) * 0.15;
            const circularData = context.getImageData(
                faceX - faceRadius,
                faceY - faceRadius,
                faceRadius * 2,
                faceRadius * 2
            );
            const cData = circularData.data;
            const cSize = faceRadius * 2;

            let skinPixels = 0;
            let darkFeatures = 0;
            let eyeFeatures = 0;
            let symmetryScore = 0;
            let obstructionPixels = 0;
            let circularPixelCount = 0;
            let avgBrightness = 0;

            // Analyze pixels in circular pattern
            for (let y = 0; y < cSize; y++) {
                for (let x = 0; x < cSize; x++) {
                    const dx = x - faceRadius;
                    const dy = y - faceRadius;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Only analyze pixels within the circle
                    if (distance <= faceRadius) {
                        const i = (y * cSize + x) * 4;
                        if (i < cData.length) {
                            const r = cData[i];
                            const g = cData[i + 1];
                            const b = cData[i + 2];
                            const gray = (r + g + b) / 3;

                            circularPixelCount++;
                            avgBrightness += gray;

                            // Detect skin-like colors (warm tones)
                            if (r > g && r > b && r > 80 && r < 220 &&
                                g > 50 && g < 180 && b > 30 && b < 150) {
                                skinPixels++;
                            }

                            // Detect dark features (eyes, nose, mouth)
                            if (gray < 60) {
                                const isUpperHalf = y < faceRadius;
                                if (isUpperHalf) {
                                    darkFeatures++;
                                }
                            }

                            // Detect eyes specifically using a 3x3 local neighborhood average
                            // and a relative-darkness test so it works better across skin tones
                            // and lighting conditions.
                            let localAvg = gray;
                            try {
                                let localSum = 0;
                                let localCount = 0;
                                for (let ny = Math.max(0, y - 1); ny <= Math.min(cSize - 1, y + 1); ny++) {
                                    for (let nx = Math.max(0, x - 1); nx <= Math.min(cSize - 1, x + 1); nx++) {
                                        const ni = (ny * cSize + nx) * 4;
                                        if (ni < cData.length) {
                                            localSum += (cData[ni] + cData[ni + 1] + cData[ni + 2]) / 3;
                                            localCount++;
                                        }
                                    }
                                }
                                if (localCount > 0) localAvg = localSum / localCount;
                            } catch {
                                // fall back to single pixel brightness
                                localAvg = gray;
                            }

                            // eyes are typically darker than their immediate neighborhood and
                            // appear in the upper portion of the circular face crop
                            const eyeUpperBound = faceRadius * 0.7;
                            const isDarkRelative = gray < Math.min(60, localAvg * 0.85);
                            const isUpperRegion = y < eyeUpperBound;
                            if (isUpperRegion && isDarkRelative) {
                                eyeFeatures++;
                            }

                            // Detect potential obstructions (very dark or very bright pixels)
                            const isBright = gray > 220;
                            const isDark = gray < 30;
                            if (isBright || isDark) {
                                obstructionPixels++;
                            }

                            // Check symmetry (compare left and right sides)
                            if (x < faceRadius) {
                                const mirrorX = cSize - 1 - x;
                                const mirrorI = (y * cSize + mirrorX) * 4;
                                if (mirrorI < cData.length) {
                                    const mirrorGray = (cData[mirrorI] + cData[mirrorI + 1] + cData[mirrorI + 2]) / 3;
                                    const diff = Math.abs(gray - mirrorGray);
                                    symmetryScore += (50 - Math.min(diff, 50)) / 50;
                                }
                            }
                        }
                    }
                }
            }

            if (circularPixelCount === 0) return;

            avgBrightness = avgBrightness / circularPixelCount;
            const skinRatio = skinPixels / circularPixelCount;
            const featureRatio = darkFeatures / circularPixelCount;
            const eyeRatio = eyeFeatures / circularPixelCount;
            const obstructionRatio = obstructionPixels / circularPixelCount;
            const symmetryRatio = symmetryScore / (circularPixelCount / 3);

            // Proximity heuristic: sample a larger central box to estimate how much of the frame is face
            let centerBoxClose = true;
            // will hold the closeness percent computed synchronously for this frame
            let currentClosenessPercent: number | null = null;
            try {
                const boxW = Math.max(10, Math.floor(canvas.width * 0.5));
                const boxH = Math.max(10, Math.floor(canvas.height * 0.6));
                const boxX = Math.max(0, Math.floor(faceX - boxW / 2));
                const boxY = Math.max(0, Math.floor(faceY - boxH / 2));
                const boxData = context.getImageData(boxX, boxY, boxW, boxH).data;
                let boxSkin = 0;
                let boxTotal = 0;
                for (let i = 0; i < boxData.length; i += 4) {
                    const r = boxData[i];
                    const g = boxData[i + 1];
                    const b = boxData[i + 2];
                    // skin-like heuristic (broad)
                    if (r > g && r > b && r > 80 && g > 40 && b > 30) boxSkin++;
                    boxTotal++;
                }
                const boxSkinRatio = boxTotal > 0 ? boxSkin / boxTotal : 0;
                setLastBoxSkin(boxSkinRatio);

                // If user calibrated a target, compute percent relative to it
                // Compute a local closeness percent so we can use it synchronously in detection logic
                currentClosenessPercent = 0;
                if (targetSkin !== null) {
                    const rawRel = boxSkinRatio / Math.max(1e-6, targetSkin);
                    const percentRel = Math.round(Math.max(0, Math.min(1.5, rawRel)) * 100);
                    currentClosenessPercent = percentRel;
                    setClosenessPercent(percentRel);
                    // require ~95% of target to be considered close
                    centerBoxClose = percentRel >= 95;
                } else {
                    // Map boxSkinRatio into a 0-100 closeness percent using a reasonable range.
                    // Tweak these min/max values to match the example image; current range is [0.04, 0.25].
                    const minSkin = 0.08;
                    const maxSkin = 0.35;
                    const raw = Math.max(0, Math.min(1, (boxSkinRatio - minSkin) / (maxSkin - minSkin)));
                    const percent = Math.round(raw * 100);
                    currentClosenessPercent = percent;
                    setClosenessPercent(percent);
                    if (percent < 85) centerBoxClose = false;
                    else centerBoxClose = true;
                }
                setFaceTooFar(!centerBoxClose);

                // Conservative post-checks variables are defined after the box sampling
            } catch {
                // ignore sampling errors and assume not too far
                centerBoxClose = true;
            }

            // Calculate face confidence based on multiple factors
            const skinFactor = Math.min(skinRatio * 4, 1); // Good skin detection
            const featureFactor = Math.min(featureRatio * 10, 1); // Some dark features expected
            const eyeFactor = Math.min(eyeRatio * 20, 1); // Eye detection is crucial
            const brightnessFactor = avgBrightness > 50 && avgBrightness < 200 ? 1 : 0; // Good lighting
            const symmetryFactor = Math.min(symmetryRatio * 2, 1); // Face symmetry
            const obstructionFactor = obstructionRatio < 0.1 ? 1 : 0; // No major obstructions

            const confidence = (
                skinFactor * 0.25 +
                featureFactor * 0.20 +
                eyeFactor * 0.30 +
                brightnessFactor * 0.15 +
                symmetryFactor * 0.05 +
                obstructionFactor * 0.05
            );

            // Conservative thresholds that must pass in addition to the computed confidence.
            const requiredCloseness = 85;

            // require closeness for detection (user must come nearer)
            // use the per-frame computed closeness percent when available; otherwise fall back to centerBoxClose
            const detected = (
                confidence > 0.45 &&
                obstructionRatio < 0.15 &&
                centerBoxClose &&
                skinRatio >= 0.15 &&
                symmetryRatio >= 0.40 &&
                eyeRatio >= MIN_EYE_RATIO &&
                (currentClosenessPercent ?? 0) >= 85
            );



            setFaceDetected(detected);
            setFaceConfidence(confidence);
            setFaceTooFar(!centerBoxClose);
            setObstructionRatio(obstructionRatio); // New state update
            setEyeFeatureRatio(eyeRatio); // New state update
        } catch (error) {
            console.error('Face detection error:', error);
        }
    }, [stream, targetSkin]);

    useEffect(() => {
        if (!stream || !videoRef.current) return;

        const interval = setInterval(detectFace, 200); // Check every 500ms
        return () => clearInterval(interval);
    }, [stream, detectFace]);

    const startCamera = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640, min: 480 },
                    height: { ideal: 480, min: 360 }
                },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setStream(mediaStream);

                const video = videoRef.current;

                const handleCanPlay = () => {
                    video.play().catch(() => {
                        // Error handling is done in the catch block below
                    });
                };

                if (video.readyState >= 3) {
                    handleCanPlay();
                } else {
                    video.addEventListener('canplay', handleCanPlay, { once: true });
                }
            }
        } catch (err) {
            if (err instanceof Error) {
                const errorMessage = err.name === 'NotAllowedError'
                    ? 'دسترسی به دوربین رد شد. لطفاً دسترسی را اجازه دهید.'
                    : err.name === 'NotFoundError'
                        ? 'دوربین یافت نشد. لطفاً از وجود دوربین اطمینان حاصل کنید.'
                        : 'خطا در دسترسی به دوربین. لطفاً دوباره تلاش کنید.';
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    }, [stream]);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => {
                track.stop();
            });
            setStream(null);
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [stream]);

    const compressImage = useCallback((canvas: HTMLCanvasElement, maxWidth = 800, maxHeight = 600, quality = 0.7): string => {
        const compressCanvas = document.createElement('canvas');
        const compressContext = compressCanvas.getContext('2d');

        if (!compressContext) return canvas.toDataURL('image/jpeg', quality);

        let { width, height } = canvas;

        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }
        compressCanvas.width = width;
        compressCanvas.height = height;
        compressContext.drawImage(canvas, 0, 0, width, height);
        return compressCanvas.toDataURL('image/jpeg', quality);
    }, []);

    const capturePhoto = useCallback(() => {

        if (!videoRef.current || !canvasRef.current || !stream) {
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) {
            console.error('Could not get canvas context');
            return;
        }
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.scale(-1, 1);
        context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        context.restore();
        const compressedDataUrl = compressImage(canvas, 600, 600, 0.8);
        setCapturedPhoto(compressedDataUrl);
        setTimeout(() => {
            stopCamera();
        }, 200);

    }, [stream, stopCamera, compressImage]);

    const confirmPhoto = useCallback(() => {
        if (!capturedPhoto) return;

        // Convert compressed data URL to blob and file
        fetch(capturedPhoto)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'selfie_compressed.jpg', { type: 'image/jpeg' });
                console.log('Final compressed file size:', (file.size / 1024).toFixed(1) + 'KB');
                onPhotoCapture(file);
            })
            .catch(err => {
                console.error('Error creating compressed file:', err);
                // Fallback to canvas blob if fetch fails
                if (canvasRef.current) {
                    canvasRef.current.toBlob((blob) => {
                        if (blob) {
                            const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                            onPhotoCapture(file);
                        }
                    }, 'image/jpeg', 0.7);
                }
            });
    }, [capturedPhoto, onPhotoCapture]);

    // Retake photo
    const retakePhoto = useCallback(() => {
        setCapturedPhoto(null);
        startCamera();
    }, [startCamera]);

    useEffect(() => {
        if (stream && videoRef.current) {
            console.log('Stream updated, refreshing video...');
            const video = videoRef.current;

            if (video.srcObject !== stream) {
                video.srcObject = stream;
            }

            const playVideo = () => {
                video.play()
            };

            if (video.readyState >= 2) {
                playVideo();
            } else {
                video.addEventListener('loadeddata', playVideo, { once: true });
            }
        }
    }, [stream]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);


    if (error) {
        return (
            <Box className="max-w-md mx-auto text-center space-y-4">
                <Box className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <CameraIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <Typography variant="h3" className="text-lg font-semibold text-red-800 mb-2">خطا در دسترسی به دوربین</Typography>
                    <Typography variant="body1" className="text-red-700 text-sm mb-4">{error}</Typography>
                    <Box className="space-y-2">
                        <Typography variant="body1" className="text-xs text-red-600">لطفاً:</Typography>
                        <ul className="text-xs text-red-600 list-disc list-inside text-right">
                            <li>دسترسی دوربین را در تنظیمات مرورگر فعال کنید</li>
                            <li>از https استفاده کنید</li>
                            <li>دوربین توسط برنامه دیگری استفاده نشود</li>
                        </ul>
                    </Box>
                    <Box className="flex space-x-3 space-x-reverse mt-4">
                        <Button onClick={startCamera} size="sm" variant="outline">
                            تلاش مجدد
                        </Button>
                        {onCancel && (
                            <Button onClick={onCancel} size="sm" variant="ghost">
                                انصراف
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>
        );
    }

    // Show loading state until client-side hydration
    if (!isClient) {
        return (
            <Box className="max-w-md mx-auto space-y-4">
                <Box className="text-center mb-4">
                    <Typography variant="h2" className="text-xl font-bold text-gray-800">عکس سلفی</Typography>
                    <Typography variant="body1" className="text-gray-600 text-sm">برای احراز هویت، عکس سلفی خود را بگیرید</Typography>
                </Box>
                <Box className="relative bg-black rounded-full overflow-hidden aspect-square w-80 h-80 mx-auto">
                    <Box className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white space-y-4">
                        <CameraIcon className="h-16 w-16 text-gray-400" />
                        <Box className="text-center">
                            <Typography variant="h3" className="text-lg font-semibold mb-2">آماده عکس‌گیری</Typography>
                            <Typography variant="body1" className="text-sm text-gray-300 mb-4">در حال بارگذاری...</Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="max-w-md mx-auto space-y-4">

            {capturedPhoto && <Box className="">
                <Box className="bg-black bg-opacity-60 backdrop-blur-sm rounded-lg p-3">
                    <Typography variant="body1" className="text-white text-xs text-center">
                        عکس خود را بررسی کنید. اگر مناسب است تایید کنید، در غیر این صورت عکس جدید بگیرید.
                    </Typography>
                </Box>
            </Box>}
            <Box className="relative bg-black rounded-full overflow-hidden w-70 h-70 mx-auto">
                {/* Add circular progress */}
                {!capturedPhoto && stream && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90 z-30 pointer-events-none">
                        <circle
                            className="transition-all duration-300"
                            stroke={
                                closenessPercent <= 50
                                    ? '#EF4444'  // red-500
                                    : closenessPercent <= 85
                                        ? '#F59E0B'  // amber-500
                                        : '#22C55E'  // green-500
                            }
                            strokeWidth="4"
                            fill="none"
                            r="49%"  // تغییر به 49% برای پوشش کامل لبه
                            cx="50%"
                            cy="50%"
                            style={{
                                strokeDasharray: `${2 * Math.PI * 49}%`,  // محاسبه محیط دایره
                                strokeDashoffset: `${2 * Math.PI * 49 * (1 - closenessPercent / 100)}%`  // محاسبه offset بر اساس درصد
                            }}
                        />
                    </svg>
                )}

                {/* Rest of existing video/camera elements */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute top-0 left-0 w-full h-full object-cover transform -scale-x-100 bg-black z-10 ${stream && !capturedPhoto ? 'opacity-100 visible' : 'opacity-0 invisible'
                        }`}
                    controls={false}
                    disablePictureInPicture
                    disableRemotePlayback
                />

                {!stream && !capturedPhoto && !isLoading ? (
                    <Box className="absolute inset-0 -bottom-16 bg-gray-900 flex flex-col items-center justify-center text-white space-y-2 z-20">
                        <CameraIcon className="h-16 w-16 text-gray-400" />
                        <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                            <CameraIcon className="h-5 w-5 ml-2" />
                            روشن کردن دوربین
                        </Button>
                    </Box>
                ) : null}

                {!capturedPhoto ? (
                    isLoading && (
                        <Box className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                            <Box className="text-white text-center p-4 rounded-xl bg-black bg-opacity-70">
                                <Box className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-3"></Box>
                                <Box className="bg-white p-1">
                                    <Typography variant="body1" className="text-sm text-center ">در حال راه‌اندازی دوربین...</Typography>
                                    <Typography variant="body1" className="text-xs mt-2  text-center">لطفاً کمی صبر کنید</Typography>
                                </Box>
                            </Box>
                        </Box>
                    )

                ) : (
                    <Box className="relative w-full h-full z-20">
                        <Image
                            src={capturedPhoto || ""}
                            alt="Captured selfie"
                            width={500}
                            height={500}
                            className="w-full h-full object-cover rounded-full transform scale-x-100"
                        />

                        <Box className="absolute inset-0 border-2 border-white border-opacity-20 rounded-full pointer-events-none"></Box>
                    </Box>
                )}

                {/* Hidden canvas for photo capture */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </Box>
            {capturedPhoto && (
                <Box className="flex justify-center gap-4">
                    <Button
                        onClick={retakePhoto}
                        className="w-fu  px-5 py-3 flex items-center justify-center bg-blue-400 hover:bg-blue-500"
                        title="گرفتن عکس جدید"
                    >
                        <ArrowPathIcon className="h-6 w-6 text-white" />
                        <Typography variant="body1" className=" text-xs font-medium text-white">
                            عکس جدید
                        </Typography>
                    </Button>


                </Box>
            )}
            {/* Face detection status - outside the camera frame */}
            {!capturedPhoto && stream && closenessPercent !== 100 && (
                <Box className="text-center space-y-3">
                    <Typography variant="body1" className={`text-sm font-medium transition-colors duration-300 text-center
                        ${!faceDetected && "text-red-500"}
                        ${faceDetected && closenessPercent >= 95 && "text-green-500"}`}>
                        {!faceDetected && (
                            faceTooFar ? 'لطفاً نزدیک‌تر بیایید' :
                                obstructionRatio >= MAX_OBSTRUCTION ? 'لطفاً دست یا اشیاء را از جلوی صورت بردارید' :
                                    eyeFeatureRatio < MIN_EYE_RATIO ? 'لطفاً مطمئن شوید چشم‌ها و ابروها به وضوح دیده می‌شوند' :
                                        'صورت خود را در مقابل دوربین قرار دهید'
                        )}
                    </Typography>
                </Box>
            )}

            {/* Capture button - outside camera frame, below status */}
            {!capturedPhoto && stream && !isLoading && (
                <Box className="flex flex-col items-center space-y-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('External photo button clicked! Face detected:', faceDetected);
                            capturePhoto();
                        }}
                        disabled={closenessPercent !== 100 || obstructionRatio >= 0.15} // Disable if obstructionRatio is too high
                        className={`w-20 h-20 rounded-full border-4 transition-all duration-300 ${closenessPercent === 100 && obstructionRatio < 0.15
                            ? 'bg-green-500 border-green-600 hover:bg-green-600 shadow-lg hover:shadow-xl active:scale-95'
                            : 'bg-gray-300 border-gray-400 cursor-not-allowed opacity-50'
                            }`}
                        title={closenessPercent === 100 && obstructionRatio < 0.15 ? 'عکس بگیرید' : 'ابتدا نزدیکی را به 100٪ برسانید و مطمئن شوید که هیچ مانعی وجود ندارد'}
                    >
                        <Box className={`w-12 h-12 rounded-full mx-auto transition-colors ${closenessPercent === 100 && obstructionRatio < 0.15 ? 'bg-white' : 'bg-gray-500'
                            }`} />
                    </button>


                </Box>
            )}

            {/* Instructions */}
            <Box className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <Typography variant="body1" className="font-semibold text-blue-900 mb-2 text-center">راهنمای عکس‌برداری:</Typography>
                {!capturedPhoto ? (
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• صورت خود را کاملاً در قاب قرار دهید</li>
                        <li>• از نور کافی استفاده کنید</li>
                        <li>• عینک آفتابی نداشته باشید</li>
                        <li>• مستقیم به دوربین نگاه کنید</li>
                        <li>• منتظر بمانید تا صورت شما تشخیص داده شود</li>
                        <li>• روی دکمه سبز کلیک کنید تا عکس بگیرید</li>
                    </ul>
                ) : (
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• عکس خود را بررسی کنید</li>
                        <li>• اگر عکس مناسب است، روی «تایید» کلیک کنید</li>
                        <li>• برای گرفتن عکس جدید، روی «عکس جدید» کلیک کنید</li>
                    </ul>
                )}
            </Box>

            <Box className="w-full flex gap-2 items-center">
                <Button
                    onClick={onCancel}
                    variant="destructive"
                    className="w-full flex justify-center gapo-3 px-5 py-3 items-center text-white"
                >
                    <XMarkIcon className="w-5 h-5 text-white" />
                    انصراف
                </Button>
                <Button
                    variant="success"
                    onClick={confirmPhoto}
                    className="  text-white  gap-3 px-5 py-3 flex items-center justify-center  w-full"
                    title="تأیید عکس"
                >
                    <CheckIcon className="h-5 w-5" />
                    <Typography variant="body1" className="text-white text-xs font-medium">
                        تایید
                    </Typography>
                </Button>
            </Box>
        </Box>
    );
}
