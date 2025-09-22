"use client";

import { useState, useRef } from "react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
    accept = "image/*",
    error
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
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            {!selectedPhoto ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${error
                        ? 'border-red-300 bg-red-50 hover:border-red-400'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                        }`}
                >
                    <PhotoIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">برای انتخاب عکس کلیک کنید</p>
                    <p className="text-xs text-gray-500 mt-2">فرمت‌های مجاز: JPG، PNG</p>
                </div>
            ) : (
                <div className="relative">
                    {preview && previewUrl && (
                        <div className="relative inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="max-w-full h-48 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    <div className="mt-2 flex items-center space-x-4 space-x-reverse">
                        <p className="text-sm text-gray-600">
                            {selectedPhoto.name}
                        </p>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                            تغییر عکس
                        </button>
                    </div>
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
            />

            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
}
