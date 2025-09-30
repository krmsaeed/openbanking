"use client";

import { Card, CardContent, CardHeader, CardTitle, SignatureCapture } from "@/components/ui";

export function SignatureStep() {
    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle>امضای دیجیتال</CardTitle>
            </CardHeader>
            <CardContent>
                <SignatureCapture />
            </CardContent>
        </Card>
    );
}
