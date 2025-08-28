"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, CameraIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    FormField,
    useToast,
    CameraUpload
} from "@/components/ui";

export default function CameraTest() {
    const router = useRouter();
    const { success, error } = useToast();

    const [photoFiles, setPhotoFiles] = useState<File[]>([]);

    const [videoFiles, setVideoFiles] = useState<File[]>([]);

    const [mixedFiles, setMixedFiles] = useState<File[]>([]);

    const handlePhotoSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const newFiles = Array.from(files);
        setPhotoFiles(prev => [...prev, ...newFiles]);
        success(`${newFiles.length} فایل جدید اضافه شد`);
    };

    const handleVideoSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const newFiles = Array.from(files);
        setVideoFiles(prev => [...prev, ...newFiles]);
        success(`${newFiles.length} فایل جدید اضافه شد`);
    };

    const handleMixedSelect = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const newFiles = Array.from(files);
        setMixedFiles(prev => [...prev, ...newFiles]);
        success(`${newFiles.length} فایل جدید اضافه شد`);
    };

    const handlePhotoRemove = (index: number) => {
        setPhotoFiles(prev => prev.filter((_, i) => i !== index));
        success("فایل حذف شد");
    };

    const handleVideoRemove = (index: number) => {
        setVideoFiles(prev => prev.filter((_, i) => i !== index));
        success("فایل حذف شد");
    };

    const handleMixedRemove = (index: number) => {
        setMixedFiles(prev => prev.filter((_, i) => i !== index));
        success("فایل حذف شد");
    };

    const handleSubmit = () => {
        const totalFiles = photoFiles.length + videoFiles.length + mixedFiles.length;
        if (totalFiles === 0) {
            error("لطفاً حداقل یک فایل اضافه کنید");
            return;
        }

        success(`${totalFiles} فایل با موفقیت آپلود شد`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* عنوان صفحه */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard')}
                        className="mb-4"
                    >
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                        بازگشت به داشبورد
                    </Button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">تست دوربین و ویدیو</h1>
                        <p className="text-gray-600">امکان گرفتن عکس و ضبط ویدیو از طریق دوربین</p>
                    </div>
                </div>

                <div className="space-y-8">
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <CameraIcon className="w-6 h-6 text-blue-600" />
                                گرفتن عکس
                            </CardTitle>
                            <CardDescription>
                                فقط امکان گرفتن عکس از دوربین
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField label="عکس شخصی" description="با دوربین عکس بگیرید یا فایل بارگذاری کنید">
                                <CameraUpload
                                    files={photoFiles}
                                    onFileSelect={handlePhotoSelect}
                                    onRemoveFile={handlePhotoRemove}
                                    label="عکس خود را اینجا بکشید یا از دوربین استفاده کنید"
                                    accept="image/*"
                                    enableVideo={false}
                                    multiple
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <VideoCameraIcon className="w-6 h-6 text-red-600" />
                                ضبط ویدیو
                            </CardTitle>
                            <CardDescription>
                                فقط امکان ضبط ویدیو از دوربین
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField label="ویدیو معرفی" description="ویدیو کوتاهی از خود ضبط کنید">
                                <CameraUpload
                                    files={videoFiles}
                                    onFileSelect={handleVideoSelect}
                                    onRemoveFile={handleVideoRemove}
                                    label="ویدیو خود را اینجا بکشید یا از دوربین ضبط کنید"
                                    accept="video/*"
                                    enableVideo={true}
                                    multiple
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <div className="flex">
                                    <CameraIcon className="w-6 h-6 text-blue-600" />
                                    <VideoCameraIcon className="w-6 h-6 text-red-600 -ml-2" />
                                </div>
                                عکس و ویدیو
                            </CardTitle>
                            <CardDescription>
                                امکان گرفتن عکس و ضبط ویدیو هردو
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormField label="مدارک شناسایی" description="عکس یا ویدیو از مدارک خود بگیرید">
                                <CameraUpload
                                    files={mixedFiles}
                                    onFileSelect={handleMixedSelect}
                                    onRemoveFile={handleMixedRemove}
                                    label="مدارک را اینجا بکشید یا از دوربین استفاده کنید"
                                    accept="image/*,video/*"
                                    enableVideo={true}
                                    multiple
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    {(photoFiles.length > 0 || videoFiles.length > 0 || mixedFiles.length > 0) && (
                        <Card padding="lg">
                            <CardHeader>
                                <CardTitle>خلاصه فایل‌های آپلود شده</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{photoFiles.length}</div>
                                        <div className="text-sm text-gray-600">عکس</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{videoFiles.length}</div>
                                        <div className="text-sm text-gray-600">ویدیو (فقط ویدیو)</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{mixedFiles.length}</div>
                                        <div className="text-sm text-gray-600">ترکیبی</div>
                                    </div>
                                </div>

                                <div className="mt-6 text-center">
                                    <Button onClick={handleSubmit} className="flex items-center gap-2 mx-auto">
                                        <CameraIcon className="w-4 h-4" />
                                        تأیید و ارسال تمام فایل‌ها
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
