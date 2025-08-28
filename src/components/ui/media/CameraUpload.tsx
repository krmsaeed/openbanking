"use client";
import { useState, useRef } from "react";
import { CameraIcon, VideoCameraIcon, XMarkIcon, PlayIcon, PauseIcon, StopIcon } from "@heroicons/react/24/outline";
import { Button } from "../core/Button";

interface CameraUploadProps {
    files: File[];
    onFileSelect: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
    label: string;
    accept?: string;
    multiple?: boolean;
    enableVideo?: boolean;
}

export function CameraUpload({
    files,
    onFileSelect,
    onRemoveFile,
    label,
    accept = "image/*,video/*",
    multiple = false,
    enableVideo = true
}: CameraUploadProps) {
    const [dragOver, setDragOver] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordingMode, setRecordingMode] = useState<'photo' | 'video'>('photo');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        onFileSelect(selectedFiles);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = e.dataTransfer.files;
        onFileSelect(droppedFiles);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
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
            alert('دسترسی به دوربین امکان‌پذیر نیست');
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
                        onFileSelect(fileList.files);
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
                onFileSelect(fileList.files);
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
            alert('خطا در شروع ضبط');
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

    if (showCamera) {
        return (
            <div className="relative">
                <div className="relative bg-black rounded-xl overflow-hidden">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        className="w-full h-64 object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Recording indicator */}
                    {isRecording && (
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full">
                            <div className={`w-2 h-2 rounded-full bg-white ${isPaused ? '' : 'animate-pulse'}`} />
                            <span className="text-sm font-medium">
                                {isPaused ? 'متوقف' : 'درحال ضبط'} {formatTime(recordingTime)}
                            </span>
                        </div>
                    )}

                    {/* Close button */}
                    <button
                        onClick={stopCamera}
                        className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>

                    {/* Mode selector */}
                    {enableVideo && !isRecording && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                            <div className="flex bg-black bg-opacity-50 rounded-full p-1">
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
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-4">
                    {recordingMode === 'photo' && !isRecording && (
                        <Button
                            onClick={takePhoto}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                        >
                            <CameraIcon className="w-5 h-5" />
                            گرفتن عکس
                        </Button>
                    )}

                    {recordingMode === 'video' && enableVideo && (
                        <div className="flex gap-2">
                            {!isRecording ? (
                                <Button
                                    onClick={startRecording}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
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
                                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                                    >
                                        <StopIcon className="w-5 h-5" />
                                        پایان ضبط
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* File Drop Zone */}
            <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="text-gray-600">
                    <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-400 mt-1">یا اینجا کلیک کنید</p>
                </div>
            </div>

            {/* Camera Button */}
            <div className="flex justify-center gap-2 mt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={startCamera}
                    className="flex items-center gap-2"
                >
                    <CameraIcon className="w-4 h-4" />
                    استفاده از دوربین
                </Button>

                {enableVideo && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setRecordingMode('video');
                            startCamera();
                        }}
                        className="flex items-center gap-2"
                    >
                        <VideoCameraIcon className="w-4 h-4" />
                        ضبط ویدیو
                    </Button>
                )}
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">فایل‌های انتخاب شده:</p>
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                                {file.type.startsWith('image/') && (
                                    <CameraIcon className="w-4 h-4 text-blue-600" />
                                )}
                                {file.type.startsWith('video/') && (
                                    <VideoCameraIcon className="w-4 h-4 text-red-600" />
                                )}
                                <span className="text-sm truncate">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                    ({(file.size / 1024 / 1024).toFixed(1)} MB)
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => onRemoveFile(index)}
                                className="text-red-500 hover:text-red-700 p-1"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
