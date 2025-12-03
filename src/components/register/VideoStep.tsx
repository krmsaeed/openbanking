'use client';

import { useUser } from '@/contexts/UserContext';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { createBPMSFormData } from '@/lib/fileUtils';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import httpClient from '@/lib/httpClient';
import { VideoRecorderView } from '../specialized/VideoRecorderView';

export const VideoRecorderStep: React.FC = () => {
    const { userData, setUserData } = useUser();
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
        const formData = createBPMSFormData(
            videoFile,
            'virtual-open-deposit',
            userData.processId,
            'ImageInquiry'
        );
        await httpClient.post('/api/bpms/deposit-files', formData)
            .then((res) => {
                const body = res?.data?.body;
                if (!body) {
                    showDismissibleToast('پاسخ نامعتبر از سرور دریافت شد، لطفاً دوباره تلاش کنید', 'error');
                    handleRetake();
                    return;
                }

                if (body.verified) {
                    setUserData({ ...userData, step: 4 });
                } else {
                    showDismissibleToast('ویدئو شما تایید نشد. لطفاً دوباره تلاش کنید.', 'error');
                    handleRetake();
                }
            })
            .catch(async (error) => {
                const message = await resolveCatalogMessage(
                    error.response?.data,
                    'خطایی رخ داد'
                );
                showDismissibleToast(message, 'error');
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
