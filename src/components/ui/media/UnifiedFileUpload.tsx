"use client";

import { forwardRef, useCallback, useState, useRef, useEffect, useId } from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import {
    DocumentIcon,
    PhotoIcon,
    XMarkIcon,
    CloudArrowUpIcon,
    CameraIcon,
    VideoCameraIcon,
    PlayIcon,
    PauseIcon,
    StopIcon
} from "@heroicons/react/24/outline";
import { Button } from "../core/Button";
import { Box, Typography } from "../core";

const fileUploadVariants = cva(
    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer hover:bg-gray-50",
    {
        variants: {
            variant: {
                default: "border-gray-300 text-gray-600",
                error: "border-red-300 text-red-600 bg-red-50",
                success: "border-green-300 text-green-600 bg-green-50",
            },
            size: {
                sm: "p-4 h-24",
                md: "p-6 h-32",
                lg: "p-8 h-40",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

export interface UnifiedFileUploadProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    VariantProps<typeof fileUploadVariants> {
    onFileSelect?: (files: FileList | null) => void;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSizeMB?: number;
    files?: File[];
    onRemoveFile?: (index: number) => void;
    label?: string;
    description?: string;
    enableCamera?: boolean;
    enableVideo?: boolean;
    showPreview?: boolean;
}

const UnifiedFileUpload = forwardRef<HTMLInputElement, UnifiedFileUploadProps>(
    ({
        className,
        variant,
        size,
        onFileSelect,
        accept = "image/*,application/pdf",
        multiple = false,
        maxFiles = 5,
        maxSizeMB = 10,
        files = [],
        onRemoveFile,
        label = "فایل‌ها را اینجا بکشید یا کلیک کنید",
        description = "PNG، JPG یا PDF تا 10MB",
        enableCamera = false,
        enableVideo = false,
        showPreview = true,
        ...props
    }, ref) => {
        const [dragOver, setDragOver] = useState(false);
        const [showCamera, setShowCamera] = useState(false);
        const [isRecording, setIsRecording] = useState(false);
        const [isPaused, setIsPaused] = useState(false);
        const [recordingTime, setRecordingTime] = useState(0);
        const [recordingMode, setRecordingMode] = useState<'photo' | 'video'>('photo');
        const [previewUrls, setPreviewUrls] = useState<string[]>([]);

        const reactId = useId();
        const inputId = props.id || `file-input-${reactId.replace(/:/g, "-")}`;

        const videoRef = useRef<HTMLVideoElement>(null);
        const canvasRef = useRef<HTMLCanvasElement>(null);
        const mediaRecorderRef = useRef<MediaRecorder | null>(null);
        const streamRef = useRef<MediaStream | null>(null);
        const recordedChunksRef = useRef<Blob[]>([]);
        const timerRef = useRef<NodeJS.Timeout | null>(null);

        useEffect(() => {
            if (showPreview) {
                const urls = files.map(file => isImageFile(file) ? URL.createObjectURL(file) : '');
                setPreviewUrls(urls);

                return () => {
                    urls.forEach(url => {
                        if (url) URL.revokeObjectURL(url);
                    });
                };
            }
        }, [files, showPreview]);

        const isImageFile = (file: File) => file.type.startsWith('image/');

        const validateFiles = useCallback((selectedFiles: FileList | null): boolean => {
            if (!selectedFiles) return false;

            if (multiple && selectedFiles.length > maxFiles) {
                toast.error(`حداکثر ${maxFiles} فایل مجاز است`);
                return false;
            }

            for (let i = 0; i < selectedFiles.length; i++) {
                const fileSizeMB = selectedFiles[i].size / (1024 * 1024);
                if (fileSizeMB > maxSizeMB) {
                    toast.error(`حجم فایل ${selectedFiles[i].name} بیش از ${maxSizeMB}MB است`);
                    return false;
                }
            }

            return true;
        }, [multiple, maxFiles, maxSizeMB]);

        const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files;
            if (validateFiles(selectedFiles)) {
                onFileSelect?.(selectedFiles);
            }
        }, [onFileSelect, validateFiles]);

        const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragOver(false);
            const droppedFiles = e.dataTransfer.files;
            if (validateFiles(droppedFiles)) {
                onFileSelect?.(droppedFiles);
            }
        }, [onFileSelect, validateFiles]);

        const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragOver(true);
        }, []);

        const handleDragLeave = useCallback(() => {
            setDragOver(false);
        }, []);

        const handleClickUpload = () => {
            const input = document.getElementById(inputId) as HTMLInputElement;
            if (input) {
                input.value = '';
                input.click();
            }
        };

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: enableVideo
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                    setShowCamera(true);
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                toast.error('دسترسی به دوربین امکان‌پذیر نیست');
            }
        };

        const stopCamera = () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            setShowCamera(false);
            setIsRecording(false);
            setIsPaused(false);
            setRecordingTime(0);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };

        const takePhoto = () => {
            if (videoRef.current && canvasRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;

                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
                            const fileList = new DataTransfer();
                            fileList.items.add(file);
                            onFileSelect?.(fileList.files);
                            stopCamera();
                        }
                    }, 'image/jpeg', 0.8);
                }
            }
        };

        const startRecording = async () => {
            if (!streamRef.current) return;

            try {
                const mediaRecorder = new MediaRecorder(streamRef.current);
                recordedChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    const file = new File([blob], `video_${Date.now()}.webm`, { type: 'video/webm' });
                    const fileList = new DataTransfer();
                    fileList.items.add(file);
                    onFileSelect?.(fileList.files);
                    stopCamera();
                };

                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                setIsRecording(true);
                setIsPaused(false);
                setRecordingTime(0);

                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            } catch (error) {
                console.error('Error starting recording:', error);
                toast.error('خطا در شروع ضبط');
            }
        };

        const pauseRecording = () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.pause();
                setIsPaused(true);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
        };

        const resumeRecording = () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
                mediaRecorderRef.current.resume();
                setIsPaused(false);
                timerRef.current = setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            }
        };

        const stopRecording = () => {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
                setIsPaused(false);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
        };

        const formatTime = (seconds: number) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        };

        const getFileIcon = (fileName: string) => {
            const extension = fileName.split('.').pop()?.toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
                return <PhotoIcon className="w-5 h-5" />;
            }
            return <DocumentIcon className="w-5 h-5" />;
        };

        const formatFileSize = (bytes: number) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        if (showCamera) {
            return (
                <Box>
                    <Box className="relative bg-black rounded-xl overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            className="w-full h-64 object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />

                        {isRecording && (
                            <Box className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                                <Box className={`w-2 h-2 rounded-full bg-white ${isPaused ? '' : 'animate-pulse'}`} />
                                <span className="text-sm font-medium">
                                    {isPaused ? 'متوقف' : 'درحال ضبط'} {formatTime(recordingTime)}
                                </span>
                            </Box>
                        )}

                        <Button
                            onClick={stopCamera}
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-70"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </Button>

                        {enableVideo && !isRecording && (
                            <Box className="absolute top-4 left-1/2 transform -translate-x-1/2">
                                <Box className="flex bg-black bg-opacity-50 rounded-full p-1">
                                    <button
                                        onClick={() => setRecordingMode('photo')}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${recordingMode === 'photo'
                                            ? 'bg-white text-black'
                                            : 'text-white hover:bg-white hover:bg-opacity-20'
                                            }`}
                                    >
                                        عکس
                                    </button>
                                    <button
                                        onClick={() => setRecordingMode('video')}
                                        className={`px-3 py-1 rounded-full text-sm transition-colors ${recordingMode === 'video'
                                            ? 'bg-white text-black'
                                            : 'text-white hover:bg-white hover:bg-opacity-20'
                                            }`}
                                    >
                                        ویدیو
                                    </button>
                                </Box>
                            </Box>
                        )}
                    </Box>

                    <Box className="flex justify-center gap-4 mt-4">
                        {recordingMode === 'photo' && !isRecording && (
                            <Button
                                onClick={takePhoto}
                                className="flex items-center gap-2"
                            >
                                <CameraIcon className="w-5 h-5" />
                                گرفتن عکس
                            </Button>
                        )}

                        {recordingMode === 'video' && enableVideo && (
                            <Box className="flex gap-2">
                                {!isRecording ? (
                                    <Button
                                        onClick={startRecording}
                                        variant="destructive"
                                        className="flex items-center gap-2"
                                    >
                                        <VideoCameraIcon className="w-5 h-5" />
                                        شروع ضبط
                                    </Button>
                                ) : (
                                    <>
                                        {isPaused ? (
                                            <Button
                                                onClick={resumeRecording}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                            >
                                                <PlayIcon className="w-5 h-5" />
                                                ادامه
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={pauseRecording}
                                                className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
                                            >
                                                <PauseIcon className="w-5 h-5" />
                                                توقف
                                            </Button>
                                        )}

                                        <Button
                                            onClick={stopRecording}
                                            variant="destructive"
                                            className="flex items-center gap-2"
                                        >
                                            <StopIcon className="w-5 h-5" />
                                            پایان ضبط
                                        </Button>
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            );
        }

        return (
            <Box className="space-y-4">
                {files.length === 0 && (
                    <Box
                        className={cn(
                            fileUploadVariants({ variant, size, className }),
                            dragOver && "border-primary-500 bg-primary-50"
                        )}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={handleClickUpload}
                    >
                        <input
                            ref={ref}
                            type="file"
                            accept={accept}
                            multiple={multiple}
                            onChange={handleFileChange}
                            className="hidden"
                            id={inputId}
                            {...props}
                        />

                        <Box className="text-center">
                            <CloudArrowUpIcon className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                            <Typography variant="body2" weight="medium">
                                {label}
                            </Typography>
                            <Typography variant="caption" color="secondary" className="mt-1">
                                {description}
                            </Typography>
                        </Box>
                    </Box>
                )}

                {enableCamera && files.length === 0 && (
                    <Box className="flex justify-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={startCamera}
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <CameraIcon className="w-4 h-4" />
                            دوربین
                        </Button>

                        {enableVideo && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setRecordingMode('video');
                                    startCamera();
                                }}
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <VideoCameraIcon className="w-4 h-4" />
                                ویدیو
                            </Button>
                        )}
                    </Box>
                )}

                {files.length > 0 && (
                    <Box className="space-y-3">
                        <Typography variant="body2" weight="medium">
                            فایل‌های انتخاب شده:
                        </Typography>
                        <Box className="grid grid-cols-1 gap-3">
                            {files.map((file, index) => (
                                <Box key={index}>
                                    {isImageFile(file) && showPreview ? (
                                        <Box className="relative group">
                                            <Image
                                                src={previewUrls[index]}
                                                alt={`Preview ${index + 1}`}
                                                width={400}
                                                height={128}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                            <Box className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                                <Button
                                                    type="button"
                                                    onClick={handleClickUpload}
                                                    size="sm"
                                                    className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center"
                                                >
                                                    <CloudArrowUpIcon className="w-4 h-4" />
                                                </Button>
                                                {onRemoveFile && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => onRemoveFile(index)}
                                                        size="sm"
                                                        variant="destructive"
                                                        className="rounded-full w-8 h-8 flex items-center justify-center"
                                                    >
                                                        <XMarkIcon className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </Box>
                                            <Box className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                                {formatFileSize(file.size)}
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <Box className="flex items-center gap-3">
                                                <Box className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    {getFileIcon(file.name)}
                                                </Box>
                                                <Box className="flex-1 min-w-0">
                                                    <Typography variant="body2" weight="medium" className="truncate">
                                                        {file.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="secondary">
                                                        {formatFileSize(file.size)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            {onRemoveFile && (
                                                <Button
                                                    type="button"
                                                    onClick={() => onRemoveFile(index)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <XMarkIcon className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Box>
        );
    }
);

UnifiedFileUpload.displayName = "UnifiedFileUpload";

export { UnifiedFileUpload, fileUploadVariants };
