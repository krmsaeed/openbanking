"use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/core/Button';

type Props = {
    onFileSelected?: (file: File) => void;
    accept?: string;
    className?: string;
    buttonLabel?: string;
};

export default function OcrReader({ onFileSelected, accept = 'image/*', className = '', buttonLabel = 'بارگذاری تصویر' }: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        onFileSelected?.(f);
    };

    return (
        <div className={className}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="hidden"
            />
            <Button size="sm" variant="ghost" onClick={() => inputRef.current?.click()}>
                {buttonLabel}
            </Button>
        </div>
    );
}
