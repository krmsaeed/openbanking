"use client";
import React from 'react';
import { SignatureCapture } from '@/components/ui/specialized/SignatureCapture';

interface Props {
    onComplete: (file: File) => void;
    onCancel: () => void;
}

export default function SignatureStep({ onComplete, onCancel }: Props) {
    return (
        <div className="space-y-6">
            <SignatureCapture onComplete={onComplete} onCancel={onCancel} />
        </div>
    );
}
