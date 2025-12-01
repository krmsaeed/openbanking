'use client';

import { useUser } from '@/contexts/UserContext';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { createBPMSFormData } from '@/lib/fileUtils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
        videoQualityInfo,
    } = useVideoRecorder();

    const handleUpload = async () => {
        if (!videoFile) return;

        setIsUploading(true);

        // Send the video file as webm
        const formData = createBPMSFormData(
            videoFile,
            'virtual-open-deposit',
            userData.processId,
            'ImageInquiry'
        );

        await axios.post('/api/bpms/deposit-files', formData)
            .then((res) => {
                setCount((prevCount) => prevCount + 1);
                if (res.data.body.verified) {
                    setUserData({ ...userData, step: 4 });
                } else {
                    showDismissibleToast('ویدئو شما تایید نشد. لطفاً دوباره تلاش کنید.', 'error');

                    handleRetake();
                }
            })
            .catch((error) => {
                console.log("🚀 ~ handleUpload ~ error:", error)
                const { data } = error.response.data;
                showDismissibleToast(data?.digitalMessageException?.message || 'خطایی رخ داد', 'error');
            }).finally(() => {
                setIsUploading(false);
            })


    };

    return (
        <VideoRecorderView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isRecording={isRecording}
            recordingTime={recordingTime}
            videoPreviewUrl={videoPreviewUrl}
            isUploading={isUploading}
            cameraActive={cameraActive}
            onStartRecording={startVideoRecording}
            onStopRecording={stopVideoRecording}
            onRetake={handleRetake}
            onConfirm={handleUpload}
            onBack={() => setUserData({ step: 2 })}
            randomText={userData.randomText ?? undefined}
            videoQualityInfo={videoQualityInfo}
        />
    );
};
