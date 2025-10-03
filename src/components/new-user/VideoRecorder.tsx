"use client";

import { useUser } from "@/contexts/UserContext";
import { VideoRecorderView } from "./VideoRecorderView";
import { useVideoRecorder } from "@/hooks/useVideoRecorder";

export const VideoRecorder: React.FC = () => {
    const { userData, setUserData } = useUser();

    const {
        videoRef,
        canvasRef,
        isRecording,
        recordingTime,
        videoFile,
        videoPreviewUrl,
        isUploading,
        cameraActive,
        startVideoRecording,
        stopVideoRecording,
        handleUpload,
        handleRetake,
    } = useVideoRecorder({
        processId: userData.processId,
        onSuccess: () => setUserData({ step: 4 }),
    });

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
