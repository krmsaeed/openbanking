"use client"
import { useState, useEffect } from "react";

interface SimpleFileUploadProps {
    files: File[];
    onFileSelect: (files: FileList | null) => void;
    onRemoveFile: (index: number) => void;
    label: string;
    accept?: string;
    multiple?: boolean;
}

export function SimpleFileUpload({
    files,
    onFileSelect,
    onRemoveFile,
    label,
    accept = "image/*,application/pdf",
    multiple = false
}: SimpleFileUploadProps) {
    const [dragOver, setDragOver] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        // Create preview URLs for image files
        const urls = files.map(file => isImageFile(file) ? URL.createObjectURL(file) : '');
        setPreviewUrls(urls);

        // Cleanup function to revoke object URLs
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

    const isImageFile = (file: File) => {
        return file.type.startsWith('image/');
    };

    return (
        <div>
            <div
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="text-gray-600">
                    <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-400 mt-1">یا اینجا کلیک کنید</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-4 space-y-3">
                    <p className="text-sm font-medium">فایل‌های انتخاب شده:</p>
                    <div className="grid grid-cols-1 gap-3">
                        {files.map((file, index) => (
                            <div key={index} className="relative">
                                {isImageFile(file) ? (
                                    <div className="relative group">
                                        <img
                                            src={previewUrls[index]}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => onRemoveFile(index)}
                                                className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                                title="حذف فایل"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                            {(file.size / 1024 / 1024).toFixed(1)} MB
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center space-x-3 space-x-reverse">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onRemoveFile(index)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="حذف فایل"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
