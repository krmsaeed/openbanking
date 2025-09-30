"use client";
import { useState, useEffect, useId } from "react";
import Image from "next/image";
import { DocumentIcon, XMarkIcon, CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { Button } from "../core/Button";
import { Box, Typography } from "../core";

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
    accept = "image/*,application/pdf",
    multiple = false,
    id
}: SimpleFileUploadProps) {
    const [dragOver, setDragOver] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const reactId = useId();
    const inputId = id || `file-input-${reactId.replace(":", "-")}`;

    useEffect(() => {
        const urls = files.map(file => isImageFile(file) ? URL.createObjectURL(file) : '');
        setPreviewUrls(urls);

        return () => {
            urls.forEach(url => {
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
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                        }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleClickUpload}
                >
                    <Box className="text-gray-600 text-center">
                        <CloudArrowUpIcon className="w-10 h-10 mx-auto mb-2" />
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
                                    <Box className="relative group">
                                        <Image
                                            src={previewUrls[index]}
                                            alt={`Preview ${index + 1}`}
                                            width={400}
                                            height={128}
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                        <Box className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                            <Button
                                                type="button"
                                                onClick={handleClickUpload}
                                                size="sm"
                                                variant="outline"
                                                className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary-700 transition-colors border-0"
                                            >
                                                <CloudArrowUpIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={() => onRemoveFile(index)}
                                                size="sm"
                                                variant="outline"
                                                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors border-0"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </Button>
                                        </Box>
                                        <Box className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                            <Typography variant="caption" className="text-white">
                                                {(file.size / 1024 / 1024).toFixed(1)} MB
                                            </Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Box className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <Box className="flex items-center space-x-3 space-x-reverse">
                                            <Box className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <DocumentIcon className="w-5 h-5 text-gray-500" />
                                            </Box>
                                            <Box className="flex-1">
                                                <Typography variant="body2" weight="medium" className="text-gray-900 truncate">
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
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <XMarkIcon className="w-4 h-4" />
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
