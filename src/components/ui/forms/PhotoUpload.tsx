'use client';

import { Box } from '@/components/ui';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRef, useState } from 'react';

interface PhotoUploadProps {
    label: string;
    onPhotoSelect: (file: File) => void;
    preview?: boolean;
    accept?: string;
    error?: string;
}

export function PhotoUpload({
    label,
    onPhotoSelect,
    preview = true,
    accept = 'image/*',
    error,
}: PhotoUploadProps) {
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedPhoto(file);
            onPhotoSelect(file);

            if (preview) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreviewUrl(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            }
        }
    };

    const handleRemovePhoto = () => {
        setSelectedPhoto(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Box className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            {!selectedPhoto ? (
                <Box
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                        error
                            ? 'border-red-300 bg-red-50 hover:border-red-400'
                            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                >
                    <PhotoIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-gray-600">برای انتخاب عکس کلیک کنید</p>
                    <p className="mt-2 text-xs text-gray-500">فرمت‌های مجاز: JPG، PNG</p>
                </Box>
            ) : (
                <Box className="relative">
                    {preview && previewUrl && (
                        <Box className="relative inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="h-48 max-w-full rounded-lg border object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="absolute top-2 right-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </Box>
                    )}

                    <Box className="mt-2 flex items-center space-x-4 space-x-reverse">
                        <p className="text-sm text-gray-600">{selectedPhoto.name}</p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-blue-600 hover:text-blue-700"
                        >
                            تغییر عکس
                        </button>
                    </Box>
                </Box>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
            />

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </Box>
    );
}
