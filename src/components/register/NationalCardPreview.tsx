'use client';
import { NationalCardTemplate } from '@/components/forms';

interface Props {
    nationalCode?: string;
    birthDate?: string;
    show: boolean;
    onConfirm: () => void;
    onBack?: () => void;
}

export default function NationalCardPreview({
    nationalCode = '',
    birthDate = '',
    show,
    onConfirm,
}: Props) {
    if (!show) return null;
    return (
        <NationalCardTemplate
            firstName={''}
            lastName={''}
            nationalCode={nationalCode}
            birthDate={birthDate}
            onConfirm={onConfirm}
        />
    );
}
