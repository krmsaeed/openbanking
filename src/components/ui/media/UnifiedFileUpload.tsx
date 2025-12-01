'use client';

import { useCamera } from '@/hooks/useCamera';
import { useSimpleVideoRecorder } from '@/hooks/useSimpleVideoRecorder';
import { cn } from '@/lib/utils';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import {
    CameraIcon,
    CloudArrowUpIcon,
    DocumentIcon,
    PauseIcon,
    PhotoIcon,
    PlayIcon,
    StopIcon,
    VideoCameraIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { cva, type VariantProps } from 'class-variance-authority';
import Image from 'next/image';
import { forwardRef, memo, useCallback, useEffect, useId, useState } from 'react';
import { Box, Typography } from '../core';
import { Button } from '../core/Button';

const fileUploadVariants = cva(
    'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
    {
        variants: {
            variant: {
                default: 'border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400',
                error: 'border-red-300 text-red-600 bg-red-50 dark:border-red-600 dark:bg-red-900/20 dark:text-red-400',
                success:
                    'border-green-300 text-green-600 bg-green-50 dark:border-green-600 dark:bg-green-900/20 dark:text-green-400',
            },
            size: {
                xs: 'p-2 h-16',
                sm: 'p-4 h-24',
                md: 'p-6 h-32',
                lg: 'p-8 h-40',
                xl: 'p-10 h-48',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

interface FileUploadAreaProps extends VariantProps<typeof fileUploadVariants> {
    className?: string;
    onClick: () => void;
    label: string;
    description: string;
    dragOver: boolean;
}

const FileUploadArea = memo<FileUploadAreaProps>(
    ({ variant, size, className, onClick, label, description, dragOver }) => (
        <Box
            className={cn(
                fileUploadVariants({ variant, size, className }),
                dragOver && 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            )}
            onClick={onClick}
        >
            <Box className="text-center">
                <CloudArrowUpIcon className="mx-auto mb-2 h-10 w-10 text-gray-400 dark:text-gray-500" />
                <Typography variant="body2" weight="medium">
                    {label}
                </Typography>
                <Typography variant="caption" color="secondary" className="mt-1">
                    {description}
                </Typography>
            </Box>
        </Box>
    )
);

FileUploadArea.displayName = 'FileUploadArea';

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    isRecording: boolean;
    isPaused: boolean;
    recordingTime: number;
    recordingMode: 'photo' | 'video';
    enableVideo: boolean;
    onStopCamera: () => void;
    onTakePhoto: () => void;
    onStartRecording: () => void;
    onPauseRecording: () => void;
    onResumeRecording: () => void;
    onStopRecording: () => void;
    onRecordingModeChange: (mode: 'photo' | 'video') => void;
}

const CameraView = memo<CameraViewProps>(
    ({
        videoRef,
        canvasRef,
        isRecording,
        isPaused,
        recordingTime,
        recordingMode,
        enableVideo,
        onStopCamera,
        onTakePhoto,
        onStartRecording,
        onPauseRecording,
        onResumeRecording,
        onStopRecording,
        onRecordingModeChange,
    }) => {
        const formatTime = (seconds: number) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        };

        return (
            <Box>
                <Box className="relative overflow-hidden rounded-xl bg-black">
                    <video ref={videoRef} autoPlay muted className="h-64 w-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />

                    {isRecording && (
                        <Box className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-white">
                            <Box
                                className={`h-2 w-2 rounded-full bg-white ${isPaused ? '' : 'animate-pulse'}`}
                            />
                            <span className="text-sm font-medium">
                                {isPaused ? 'متوقف' : 'درحال ضبط'} {formatTime(recordingTime)}
                            </span>
                        </Box>
                    )}

                    <Button
                        onClick={onStopCamera}
                        variant="ghost"
                        size="sm"
                        className="bg-opacity-50 hover:bg-opacity-70 absolute top-4 right-4 bg-black text-white"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </Button>

                    {enableVideo && !isRecording && (
                        <Box className="absolute top-4 left-1/2 -translate-x-1/2 transform">
                            <Box className="bg-opacity-50 flex rounded-full bg-black p-1">
                                <button
                                    onClick={() => onRecordingModeChange('photo')}
                                    className={`rounded-full px-3 py-1 text-sm transition-colors ${recordingMode === 'photo'
                                            ? 'bg-white text-black'
                                            : 'hover:bg-opacity-20 text-white hover:bg-white'
                                        }`}
                                >
                                    عکس
                                </button>
                                <button
                                    onClick={() => onRecordingModeChange('video')}
                                    className={`rounded-full px-3 py-1 text-sm transition-colors ${recordingMode === 'video'
                                            ? 'bg-white text-black'
                                            : 'hover:bg-opacity-20 text-white hover:bg-white'
                                        }`}
                                >
                                    ویدیو
                                </button>
                            </Box>
                        </Box>
                    )}
                </Box>

                <Box className="mt-4 flex justify-center gap-4">
                    {recordingMode === 'photo' && !isRecording && (
                        <Button onClick={onTakePhoto} className="flex items-center gap-2">
                            <CameraIcon className="h-5 w-5" />
                            گرفتن عکس
                        </Button>
                    )}

                    {recordingMode === 'video' && enableVideo && (
                        <Box className="flex gap-2">
                            {!isRecording ? (
                                <Button
                                    onClick={onStartRecording}
                                    variant="destructive"
                                    className="flex items-center gap-2"
                                >
                                    <VideoCameraIcon className="h-5 w-5" />
                                    شروع ضبط
                                </Button>
                            ) : (
                                <>
                                    {isPaused ? (
                                        <Button
                                            onClick={onResumeRecording}
                                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                        >
                                            <PlayIcon className="h-5 w-5" />
                                            ادامه
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={onPauseRecording}
                                            className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700"
                                        >
                                            <PauseIcon className="h-5 w-5" />
                                            توقف
                                        </Button>
                                    )}

                                    <Button
                                        onClick={onStopRecording}
                                        variant="destructive"
                                        className="flex items-center gap-2"
                                    >
                                        <StopIcon className="h-5 w-5" />
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
);

CameraView.displayName = 'CameraView';

interface FilePreviewProps {
    file: File;
    index: number;
    previewUrl?: string;
    onRemove?: (index: number) => void;
    onReplace?: () => void;
}

const FilePreview = memo<FilePreviewProps>(({ file, index, previewUrl, onRemove, onReplace }) => {
    const isImageFile = (file: File) => file.type.startsWith('image/');

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
            return <PhotoIcon className="h-5 w-5" />;
        }
        return <DocumentIcon className="h-5 w-5" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (isImageFile(file) && previewUrl) {
        return (
            <Box className="group relative">
                <Image
                    src={previewUrl}
                    alt={`Preview ${index + 1}`}
                    width={400}
                    height={128}
                    className="h-32 w-full rounded-lg border border-gray-200 object-cover dark:border-gray-700"
                />
                <Box className="bg-opacity-50 absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black opacity-0 transition-opacity group-hover:opacity-100">
                    {onReplace && (
                        <Button
                            type="button"
                            onClick={onReplace}
                            size="sm"
                            className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-white"
                        >
                            <CloudArrowUpIcon className="h-4 w-4" />
                        </Button>
                    )}
                    {onRemove && (
                        <Button
                            type="button"
                            onClick={() => onRemove(index)}
                            size="sm"
                            variant="destructive"
                            className="flex h-8 w-8 items-center justify-center rounded-full"
                        >
                            <XMarkIcon className="h-4 w-4" />
                        </Button>
                    )}
                </Box>
                <Box className="bg-opacity-70 absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-xs text-white">
                    {formatFileSize(file.size)}
                </Box>
            </Box>
        );
    }

    return (
        <Box className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
            <Box className="flex items-center gap-3">
                <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
                    {getFileIcon(file.name)}
                </Box>
                <Box className="min-w-0 flex-1">
                    <Typography variant="body2" weight="medium" className="truncate">
                        {file.name}
                    </Typography>
                    <Typography variant="caption" color="secondary">
                        {formatFileSize(file.size)}
                    </Typography>
                </Box>
            </Box>
            {onRemove && (
                <Button
                    type="button"
                    onClick={() => onRemove(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                    <XMarkIcon className="h-4 w-4" />
                </Button>
            )}
        </Box>
    );
});

FilePreview.displayName = 'FilePreview';

interface FileListProps {
    files: File[];
    previewUrls: string[];
    onRemoveFile?: (index: number) => void;
    onReplaceFile?: () => void;
}

const FileList = memo<FileListProps>(({ files, previewUrls, onRemoveFile, onReplaceFile }) => (
    <Box className="space-y-3">
        <Typography variant="body2" weight="medium">
            فایل‌های انتخاب شده:
        </Typography>
        <Box className="grid grid-cols-1 gap-3">
            {files.map((file, index) => (
                <FilePreview
                    key={index}
                    file={file}
                    index={index}
                    previewUrl={previewUrls[index]}
                    onRemove={onRemoveFile}
                    onReplace={onReplaceFile}
                />
            ))}
        </Box>
    </Box>
));

FileList.displayName = 'FileList';

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
    (
        {
            className,
            variant,
            size,
            onFileSelect,
            accept = 'image/*,application/pdf',
            multiple = false,
            maxFiles = 5,
            maxSizeMB = 10,
            files = [],
            onRemoveFile,
            label = 'فایل‌ها را اینجا بکشید یا کلیک کنید',
            description = 'PNG، JPG یا PDF تا 10MB',
            enableCamera = false,
            enableVideo = false,
            showPreview = true,
            ...props
        },
        ref
    ) => {
        const [dragOver, setDragOver] = useState(false);
        const [recordingMode, setRecordingMode] = useState<'photo' | 'video'>('photo');
        const [previewUrls, setPreviewUrls] = useState<string[]>([]);

        const reactId = useId();
        const inputId = props.id || `file-input-${reactId.replace(/:/g, '-')}`;

        const {
            videoRef,
            canvasRef,
            isActive: cameraActive,
            startCamera,
            stopCamera,
            takePhoto,
        } = useCamera({ video: true, audio: enableVideo });

        const {
            isRecording,
            isPaused,
            recordingTime,
            startRecording,
            pauseRecording,
            resumeRecording,
            stopRecording,
        } = useSimpleVideoRecorder();

        useEffect(() => {
            if (showPreview) {
                const urls = files.map((file) =>
                    isImageFile(file) ? URL.createObjectURL(file) : ''
                );
                setPreviewUrls(urls);

                return () => {
                    urls.forEach((url) => {
                        if (url) URL.revokeObjectURL(url);
                    });
                };
            }
        }, [files, showPreview]);

        const isImageFile = (file: File) => file.type.startsWith('image/');

        const getFileIcon = (fileName: string) => {
            const extension = fileName.split('.').pop()?.toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
                return <PhotoIcon className="h-5 w-5" />;
            }
            return <DocumentIcon className="h-5 w-5" />;
        };

        const formatFileSize = (bytes: number) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        const validateFiles = useCallback(
            (selectedFiles: FileList | null): boolean => {
                if (!selectedFiles) return false;

                if (multiple && selectedFiles.length > maxFiles) {
                    showDismissibleToast(`حداکثر ${maxFiles} فایل مجاز است`, 'error');
                    return false;
                }

                for (let i = 0; i < selectedFiles.length; i++) {
                    const fileSizeMB = selectedFiles[i].size / (1024 * 1024);
                    if (fileSizeMB > maxSizeMB) {
                        showDismissibleToast(
                            `حجم فایل ${selectedFiles[i].name} بیش از ${maxSizeMB}MB است`,
                            'error'
                        );
                        return false;
                    }
                }

                return true;
            },
            [multiple, maxFiles, maxSizeMB]
        );

        const handleFileChange = useCallback(
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const selectedFiles = e.target.files;
                if (validateFiles(selectedFiles)) {
                    onFileSelect?.(selectedFiles);
                }
            },
            [onFileSelect, validateFiles]
        );

        const handleDrop = useCallback(
            (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                setDragOver(false);
                const droppedFiles = e.dataTransfer.files;
                if (validateFiles(droppedFiles)) {
                    onFileSelect?.(droppedFiles);
                }
            },
            [onFileSelect, validateFiles]
        );

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

        const handlePhotoTaken = useCallback(
            (file: File) => {
                const fileList = new DataTransfer();
                fileList.items.add(file);
                onFileSelect?.(fileList.files);
                stopCamera();
            },
            [onFileSelect, stopCamera]
        );

        const handleVideoRecorded = useCallback(
            (file: File) => {
                const fileList = new DataTransfer();
                fileList.items.add(file);
                onFileSelect?.(fileList.files);
                stopCamera();
            },
            [onFileSelect, stopCamera]
        );

        const handleStartRecording = useCallback(async () => {
            if (videoRef.current?.srcObject) {
                await startRecording(
                    videoRef.current.srcObject as MediaStream,
                    handleVideoRecorded
                );
            }
        }, [startRecording, videoRef, handleVideoRecorded]);

        if (cameraActive) {
            return (
                <CameraView
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    isRecording={isRecording}
                    isPaused={isPaused}
                    recordingTime={recordingTime}
                    recordingMode={recordingMode}
                    enableVideo={enableVideo}
                    onStopCamera={stopCamera}
                    onTakePhoto={() => takePhoto(handlePhotoTaken)}
                    onStartRecording={handleStartRecording}
                    onPauseRecording={pauseRecording}
                    onResumeRecording={resumeRecording}
                    onStopRecording={stopRecording}
                    onRecordingModeChange={setRecordingMode}
                />
            );
        }

        return (
            <Box className="space-y-4">
                {files.length === 0 && (
                    <Box
                        className={cn(
                            fileUploadVariants({ variant, size, className }),
                            dragOver && 'border-primary-500 bg-primary-50'
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
                            <CloudArrowUpIcon className="mx-auto mb-2 h-10 w-10 text-gray-400" />
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
                            <CameraIcon className="h-4 w-4" />
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
                                <VideoCameraIcon className="h-4 w-4" />
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
                                        <Box className="group relative">
                                            <Image
                                                src={previewUrls[index]}
                                                alt={`Preview ${index + 1}`}
                                                width={400}
                                                height={128}
                                                className="h-32 w-full rounded-lg border border-gray-200 object-cover"
                                            />
                                            <Box className="bg-opacity-50 absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    type="button"
                                                    onClick={handleClickUpload}
                                                    size="sm"
                                                    className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-white"
                                                >
                                                    <CloudArrowUpIcon className="h-4 w-4" />
                                                </Button>
                                                {onRemoveFile && (
                                                    <Button
                                                        type="button"
                                                        onClick={() => onRemoveFile(index)}
                                                        size="sm"
                                                        variant="destructive"
                                                        className="flex h-8 w-8 items-center justify-center rounded-full"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </Box>
                                            <Box className="bg-opacity-70 absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-xs text-white">
                                                {formatFileSize(file.size)}
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                                            <Box className="flex items-center gap-3">
                                                <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
                                                    {getFileIcon(file.name)}
                                                </Box>
                                                <Box className="min-w-0 flex-1">
                                                    <Typography
                                                        variant="body2"
                                                        weight="medium"
                                                        className="truncate"
                                                    >
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
                                                    <XMarkIcon className="h-4 w-4" />
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

UnifiedFileUpload.displayName = 'UnifiedFileUpload';

export { fileUploadVariants, UnifiedFileUpload };
