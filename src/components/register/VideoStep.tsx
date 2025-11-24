'use client';

import { useUser } from '@/contexts/UserContext';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { convertToFile, createBPMSFormData } from '@/lib/fileUtils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { VideoRecorderView } from '../specialized/VideoRecorderView';
import { Box, Typography } from '../ui/core';

export const VideoRecorderStep: React.FC = () => {
    const { userData, setUserData, clearUserData } = useUser();
    const [count, setCount] = useState(0);
    const router = useRouter();
    const {
        videoRef,
        canvasRef,
        isRecording,
        recordingTime,
        videoFile,
        videoPreviewUrl,
        isUploading,
        isCompressing,
        compressionProgress,
        setIsUploading,
        cameraActive,
        startVideoRecording,
        stopVideoRecording,
        handleRetake,
    } = useVideoRecorder();

    const handleUpload = async () => {
        if (!videoFile) return;

        setIsUploading(true);

        try {
            const file = await convertToFile(videoFile, 'verification_video', 'video/mp4');
            const formData = createBPMSFormData(
                file!,
                'virtual-open-deposit',
                userData.processId,
                'ImageInquiry'
            );

            await axios
                .post('/api/bpms/deposit-files', formData)
                .then((res) => {
                    setCount((prevCount) => prevCount + 1);
                    if (res.data.body.verified) {
                        setUserData({ ...userData, step: 4 });
                    } else {
                        toast.error('ویدئو شما تایید نشد. لطفاً دوباره تلاش کنید.');
                        if (count >= 2) {
                            router.push('/');
                            clearUserData();
                        }
                        handleRetake();
                    }
                })
                .catch((error) => {
                    const message = error.response?.data?.data?.digitalMessageException?.message;
                    toast.error(message, {
                        duration: 5000,
                    });
                    clearUserData();
                    router.push('/');
                });
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <>
            <VideoRecorderView
                videoRef={videoRef}
                canvasRef={canvasRef}
                isRecording={isRecording}
                recordingTime={recordingTime}
                videoFile={videoFile}
                videoPreviewUrl={videoPreviewUrl}
                isUploading={isUploading}
                isCompressing={isCompressing}
                cameraActive={cameraActive}
                onStartRecording={startVideoRecording}
                onStopRecording={stopVideoRecording}
                onRetake={handleRetake}
                onConfirm={handleUpload}
                onBack={() => setUserData({ step: 2 })}
                randomText={userData.randomText ?? undefined}
            />
            {isCompressing && (
                <Box className="mt-4 rounded-xl bg-blue-50 p-4 dark:bg-blue-900/30">
                    <Typography variant="body2" className="mb-2 text-center font-semibold">
                        در حال آماده سازی ویدیو... {compressionProgress}%
                    </Typography>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                            className="h-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${compressionProgress}%` }}
                        />
                    </div>
                </Box>
            )}
        </>
    );
};
