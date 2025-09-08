"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { SignatureCapture } from "@/components/ui/specialized/SignatureCapture";

interface SignatureStepProps {
    onComplete: (file: File) => void;
    onCancel?: () => void;
}

export function SignatureStep({ onComplete, onCancel }: SignatureStepProps) {
    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle>امضای دیجیتال</CardTitle>
            </CardHeader>
            <CardContent>
                <SignatureCapture onComplete={onComplete} onCancel={onCancel || (() => { })} />
            </CardContent>
        </Card>
    );
}
