"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { VideoRecorder } from "@/components/new-user/VideoRecorder";

interface VideoRecordStepProps {
    onComplete: (file: File) => void;
    onCancel?: () => void;
}

export function VideoRecordStep({ onComplete, onCancel }: VideoRecordStepProps) {
    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle>ضبط ویدیو</CardTitle>
            </CardHeader>
            <CardContent>
                <VideoRecorder onComplete={onComplete} onCancel={onCancel || (() => { })} />
            </CardContent>
        </Card>
    );
}
