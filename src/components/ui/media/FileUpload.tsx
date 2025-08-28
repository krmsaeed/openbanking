import { forwardRef, useCallback } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { DocumentIcon, PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

const fileUploadVariants = cva(
    "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer hover:bg-gray-50",
    {
        variants: {
            variant: {
                default: "border-gray-300 text-gray-600",
                error: "border-red-300 text-red-600 bg-red-50",
                success: "border-green-300 text-green-600 bg-green-50",
            },
            size: {
                sm: "p-4 h-24",
                md: "p-6 h-32",
                lg: "p-8 h-40",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

export interface FileUploadProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>,
    VariantProps<typeof fileUploadVariants> {
    onFileSelect?: (files: FileList | null) => void;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    maxSizeMB?: number;
    files?: File[];
    onRemoveFile?: (index: number) => void;
    label?: string;
    description?: string;
}

const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
    ({
        className,
        variant,
        size,
        onFileSelect,
        accept = "image/*,application/pdf",
        multiple = false,
        maxFiles = 5,
        maxSizeMB = 10,
        files = [],
        onRemoveFile,
        label = "فایل‌ها را اینجا بکشید یا کلیک کنید",
        description = "PNG، JPG یا PDF تا 10MB",
        ...props
    }, ref) => {

        const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const selectedFiles = e.target.files;
            if (selectedFiles) {
                if (multiple && selectedFiles.length > maxFiles) {
                    toast.error(`حداکثر ${maxFiles} فایل مجاز است`);
                    return;
                }

                for (let i = 0; i < selectedFiles.length; i++) {
                    const fileSizeMB = selectedFiles[i].size / (1024 * 1024);
                    if (fileSizeMB > maxSizeMB) {
                        toast.error(`حجم فایل ${selectedFiles[i].name} بیش از ${maxSizeMB}MB است`);
                        return;
                    }
                }

                onFileSelect?.(selectedFiles);
            }
        }, [onFileSelect, multiple, maxFiles, maxSizeMB]);

        const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const droppedFiles = e.dataTransfer.files;
            if (droppedFiles.length > 0) {
                if (multiple && droppedFiles.length > maxFiles) {
                    toast.error(`حداکثر ${maxFiles} فایل مجاز است`);
                    return;
                }

                for (let i = 0; i < droppedFiles.length; i++) {
                    const fileSizeMB = droppedFiles[i].size / (1024 * 1024);
                    if (fileSizeMB > maxSizeMB) {
                        toast.error(`حجم فایل ${droppedFiles[i].name} بیش از ${maxSizeMB}MB است`);
                        return;
                    }
                }

                onFileSelect?.(droppedFiles);
            }
        }, [onFileSelect, multiple, maxFiles, maxSizeMB]);

        const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
        }, []);

        const getFileIcon = (fileName: string) => {
            const extension = fileName.split('.').pop()?.toLowerCase();
            if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
                return <PhotoIcon className="w-5 h-5" />;
            }
            return <DocumentIcon className="w-5 h-5" />;
        };

        const formatFileSize = (bytes: number) => {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        return (
            <div className="space-y-4">
                <div
                    className={cn(fileUploadVariants({ variant, size, className }))}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => document.getElementById(props.id || 'file-upload')?.click()}
                >
                    <input
                        ref={ref}
                        type="file"
                        accept={accept}
                        multiple={multiple}
                        onChange={handleFileChange}
                        className="hidden"
                        id={props.id || 'file-upload'}
                        {...props}
                    />

                    <div className="text-center">
                        <DocumentIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-gray-500 mt-1">{description}</p>
                    </div>
                </div>

                {files.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">فایل‌های انتخاب شده:</p>
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3 space-x-reverse">
                                    {getFileIcon(file.name)}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                {onRemoveFile && (
                                    <button
                                        type="button"
                                        onClick={() => onRemoveFile(index)}
                                        className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
);

FileUpload.displayName = "FileUpload";

export { FileUpload, fileUploadVariants };
