"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { SelfieCapture } from "@/components/ui/specialized/SelfieCapture";

interface SelfieStepProps {
    onNext: (file: File) => void;
    onBack?: () => void;
}

export function SelfieStep({ onNext, onBack }: SelfieStepProps) {
    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle>گرفتن سلفی</CardTitle>
            </CardHeader>
            <CardContent>
                <SelfieCapture onComplete={(file) => onNext(file)} onCancel={onBack || (() => { })} />
            </CardContent>
        </Card>
    );
}
