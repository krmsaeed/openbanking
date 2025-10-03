'use client';
import { useState, useEffect, useId } from 'react';
import Image from 'next/image';
import { DocumentIcon, XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { Button } from '../core/Button';
import { Box, Typography } from '../core';

interface SimpleFileUploadProps {
    files: File[];
    onFileSelect: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
    label: string;
    accept?: string;
    multiple?: boolean;
    id?: string;
}

export function SimpleFileUpload({
    files,
    onFileSelect,
    onRemoveFile,
    label,
    accept = 'image/*,application/pdf',
    multiple = false,
    id,
}: SimpleFileUploadProps) {
    const [dragOver, setDragOver] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const reactId = useId();
    const inputId = id || `file-input-${reactId.replace(':', '-')}`;

    useEffect(() => {
        const urls = files.map((file) => (isImageFile(file) ? URL.createObjectURL(file) : ''));
        setPreviewUrls(urls);

        return () => {
            urls.forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [files]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        onFileSelect(selectedFiles);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFiles = e.dataTransfer.files;
        onFileSelect(droppedFiles);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleClickUpload = () => {
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input) {
            input.value = '';
            input.click();
        }
    };

    const isImageFile = (file: File) => {
        return file.type.startsWith('image/');
    };

    return (
        <Box>
            <input
                id={inputId}
                type="file"
                accept={accept}
                multiple={multiple}
                onChange={handleFileChange}
                value=""
                className="hidden"
            />

            {files.length === 0 && (
                <Box
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                        dragOver
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleClickUpload}
                >
                    <Box className="text-center text-gray-600">
                        <CloudArrowUpIcon className="mx-auto mb-2 h-10 w-10" />
                        <Typography variant="body2" weight="medium">
                            {label}
                        </Typography>
                        <Typography variant="caption" color="secondary" className="mt-1">
                            یا اینجا کلیک کنید
                        </Typography>
                    </Box>
                </Box>
            )}

            {files.length > 0 && (
                <Box className="mt-4 space-y-3">
                    <Typography variant="body2" weight="medium">
                        فایل‌های انتخاب شده:
                    </Typography>
                    <Box className="grid grid-cols-1 gap-3">
                        {files.map((file, index) => (
                            <Box key={index} className="relative">
                                {isImageFile(file) ? (
                                    <Box className="group relative">
                                        <Image
                                            src={previewUrls[index]}
                                            alt={`Preview ${index + 1}`}
                                            width={400}
                                            height={128}
                                            className="h-32 w-full rounded-lg border border-gray-200 object-cover"
                                        />
                                        <Box className="bg-opacity-50 absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                                type="button"
                                                onClick={handleClickUpload}
                                                size="sm"
                                                variant="outline"
                                                className="bg-primary hover:bg-primary-700 flex h-8 w-8 items-center justify-center rounded-full border-0 text-white transition-colors"
                                            >
                                                <CloudArrowUpIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => onRemoveFile(index)}
                                                size="sm"
                                                variant="outline"
                                                className="flex h-8 w-8 items-center justify-center rounded-full border-0 bg-red-500 text-white transition-colors hover:bg-red-600"
                                            >
                                                <XMarkIcon className="h-4 w-4" />
                                            </Button>
                                        </Box>
                                        <Box className="bg-opacity-70 absolute bottom-2 left-2 rounded bg-black px-2 py-1 text-xs text-white">
                                            <Typography variant="caption" className="text-white">
                                                {(file.size / 1024 / 1024).toFixed(1)} MB
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                                        <Box className="flex items-center space-x-3 space-x-reverse">
                                            <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200">
                                                <DocumentIcon className="h-5 w-5 text-gray-500" />
                                            </Box>
                                            <Box className="flex-1">
                                                <Typography
                                                    variant="body2"
                                                    weight="medium"
                                                    className="truncate text-gray-900"
                                                >
                                                    {file.name}
                                                </Typography>
                                                <Typography variant="caption" color="secondary">
                                                    {(file.size / 1024 / 1024).toFixed(1)} MB
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Button
                                            type="button"
                                            onClick={() => onRemoveFile(index)}
                                            variant="ghost"
                                            size="sm"
                                            className="p-1 text-red-500 hover:text-red-700"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
