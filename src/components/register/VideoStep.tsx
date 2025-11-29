'use client';

import { useUser } from '@/contexts/UserContext';
import { useVideoRecorder } from '@/hooks/useVideoRecorder';
import { createBPMSFormData } from '@/lib/fileUtils';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
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
        recordedBlob,
        isUploading,
        setIsUploading,
        cameraActive,
        startCamera,
        startVideoRecording,
        stopVideoRecording,
        handleRetake,
        videoQualityInfo,
    } = useVideoRecorder();

    const handleUpload = async () => {
        const blobToSend = recordedBlob ?? (videoFile as Blob | null);
        if (!blobToSend) return;

        setIsUploading(true);

        try {
            // Mirror the video using ffmpeg (horizontal flip)
            let mirroredBlob = null;
            try {
                const ffmpeg = new FFmpeg();
                await ffmpeg.load();
                const inputName = 'input.mp4';
                const outputName = 'output.mp4';
                await ffmpeg.writeFile(inputName, await fetchFile(blobToSend));
                // Apply horizontal flip (hflip)
                await ffmpeg.exec(['-i', inputName, '-vf', 'hflip', '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', outputName]);
                const data = await ffmpeg.readFile(outputName);
                let mp4Blob;
                if (data instanceof Uint8Array) {
                    const ab = new ArrayBuffer(data.length);
                    const view = new Uint8Array(ab);
                    view.set(data);
                    mp4Blob = new Blob([ab], { type: 'video/mp4' });
                } else {
                    mp4Blob = new Blob([data], { type: 'video/mp4' });
                }
                mirroredBlob = mp4Blob;
            } catch (err) {
                console.error('ffmpeg mirroring failed, sending original video', err);
                mirroredBlob = blobToSend;
            }

            const file = new File([mirroredBlob], `verification_video_${Date.now()}.mp4`, { type: 'video/mp4' });

            const formData = createBPMSFormData(
                file,
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
                        toast.error('ویدئو شما تایید نشد. لطفاً دوباره تلاش کنید.');
                        if (count >= 2) {
                            router.push('/');
                            clearUserData();
                        }
                        handleRetake();
                    }
                })
                .catch((error) => {
                    const { data } = error.response;
                    toast.error(data?.digitalMessageException?.message, {
                        duration: 5000,
                    });
                    // clearUserData();
                    // router.push('/');
                });
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <VideoRecorderView
            videoRef={videoRef}
            canvasRef={canvasRef}
            isRecording={isRecording}
            recordingTime={recordingTime}
            videoFile={videoFile}
            videoPreviewUrl={videoPreviewUrl}
            recordedBlob={recordedBlob}
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
