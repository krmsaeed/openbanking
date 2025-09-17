"use client";
import React from 'react';
import { CameraSelfie } from '@/components/forms';
import { Box } from '../ui';

interface Props {
    onPhotoCapture: (file: File) => void;
    onBack: () => void;
}

export default function SelfieStep({ onPhotoCapture, onBack }: Props) {
    return (
        <Box className="space-y-6">
            <CameraSelfie onPhotoCapture={onPhotoCapture} onCancel={onBack} />
        </Box>
    );
}
