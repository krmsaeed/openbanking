"use client";
import React from 'react';
import { VideoRecorder } from '@/components/new-user';

interface Props {
    onComplete: (file: File) => void;
    onBack: () => void;
}

export default function VideoStep({ onComplete, onBack }: Props) {
    return (
        <div className="space-y-6">
            <VideoRecorder onComplete={onComplete} onCancel={onBack} />
        </div>
    );
}
