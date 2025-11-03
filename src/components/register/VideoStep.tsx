'use client';

import { useUser } from '@/contexts/UserContext';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { convertToFile, createBPMSFormData } from '@/lib/fileUtils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { VideoRecorderView } from '../specialized/VideoRecorderView';

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
        setIsUploading,
        cameraActive,
        startVideoRecording,
        stopVideoRecording,
        handleRetake,
    } = useVideoRecorder();

    const handleUpload = async () => {
        setIsUploading(true);

        const file = await convertToFile(videoFile, 'verification_video', 'video/webm');
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
                    if (count >= 2) {
                        router.push('/');
                        clearUserData();
                        toast.error('احراز هویت با خطا مواجه شد.لطفاً دوباره تلاش کنید.');
                    }
                    handleRetake();
                }
            })
            .catch(() => {
                toast.error('عملیات با خطا مواجه شد.');
                clearUserData();
                router.push('/');
            })
            .finally(() => setIsUploading(false));
    };

    return (
        <VideoRecorderView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isRecording={isRecording}
            recordingTime={recordingTime}
            videoFile={videoFile}
            videoPreviewUrl={videoPreviewUrl}
            isUploading={isUploading}
            cameraActive={cameraActive}
            onStartRecording={startVideoRecording}
            onStopRecording={stopVideoRecording}
            onRetake={handleRetake}
            onConfirm={handleUpload}
            onBack={() => setUserData({ step: 2 })}
            randomText={userData.randomText ?? undefined}
        />
    );
};
