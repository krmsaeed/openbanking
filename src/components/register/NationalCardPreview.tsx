"use client";
import React from 'react';
import { NationalCardTemplate } from '@/components/forms';

interface Props {
    nationalCode?: string;
    birthDate?: string;
    show: boolean;
    onConfirm: () => void;
    onBack?: () => void;
}

export default function NationalCardPreview({ nationalCode = '', birthDate = '', show, onConfirm, onBack }: Props) {
    if (!show) return null;
    return (
        <div className="space-y-6">
            <NationalCardTemplate firstName={''} lastName={''} nationalCode={nationalCode} birthDate={birthDate} onConfirm={onConfirm} />
            {onBack && (
                <div className="text-right">
                    <button className="text-sm text-secondary underline" onClick={onBack}>بازگشت</button>
                </div>
            )}
        </div>
    );
}
