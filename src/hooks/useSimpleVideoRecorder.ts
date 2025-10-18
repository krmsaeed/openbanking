'use client';

import { useCallback, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export interface UseSimpleVideoRecorderReturn {
    isRecording: boolean;
    isPaused: boolean;
    recordingTime: number;
    startRecording: (stream: MediaStream, onVideoRecorded?: (file: File) => void) => Promise<void>;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => void;
}

export const useSimpleVideoRecorder = (): UseSimpleVideoRecorderReturn => {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    const startRecording = useCallback(
        async (stream: MediaStream, onVideoRecorded?: (file: File) => void) => {
            try {
                const mediaRecorder = new MediaRecorder(stream);
                recordedChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                mediaRecorder.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    const file = new File([blob], `video_${Date.now()}.webm`, {
                        type: 'video/webm',
                    });
                    onVideoRecorded?.(file);
                    setIsRecording(false);
                    setIsPaused(false);
                    setRecordingTime(0);
                };

                mediaRecorder.start();
                mediaRecorderRef.current = mediaRecorder;
                setIsRecording(true);
                setIsPaused(false);
                setRecordingTime(0);

                timerRef.current = setInterval(() => {
                    setRecordingTime((prev) => prev + 1);
                }, 1000);
            } catch (error) {
                console.error('Error starting recording:', error);
                toast.error('خطا در شروع ضبط');
            }
        },
        []
    );

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, []);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, []);

    return {
        isRecording,
        isPaused,
        recordingTime,
        startRecording,
        pauseRecording,
        resumeRecording,
        stopRecording,
    };
};
