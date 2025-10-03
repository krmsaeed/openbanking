'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { VideoRecorder } from '@/components/new-user/VideoRecorder';

export function VideoRecordStep() {
    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle>ضبط ویدیو</CardTitle>
            </CardHeader>
            <CardContent>
                <VideoRecorder />
            </CardContent>
        </Card>
    );
}
