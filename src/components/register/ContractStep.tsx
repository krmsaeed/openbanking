'use client';
import { Box, Button, Card, CardContent, Input, Typography } from '@/components/ui';
import { PdfPreviewModal } from '@/components/ui/overlay/PdfPreviewModal';
import {
    ArrowDownTrayIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    EyeIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
const PDF_URL = '/test.pdf';
function useContractStep() {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const router = useRouter();
    const handleAccept = async () => {
        if (!agreed) {
            setError('لطفا ابتدا شرایط قرارداد را مطالعه و تأیید کنید.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (Math.random() > 0.9) {
                        reject(new Error('خطا در اتصال به سرور'));
                    } else {
                        resolve(true);
                    }
                }, 2000);
            });

            router.push('/payment/gateway');
        } catch (err) {
            console.error('Contract acceptance error:', err);
            setError(err instanceof Error ? err.message : 'خطای نامشخص رخ داده است');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        try {
            setPdfUrl(PDF_URL);
            setShowPreview(true);
        } catch (err) {
            setError(
                'خطا در نمایش پیش‌نمایش: ' + (err instanceof Error ? err.message : String(err))
            );
        }
    };

    const handleDownload = () => {
        try {
            const element = document.createElement('a');
            element.href = PDF_URL;
            element.download = 'contract.pdf';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (err) {
            setError(
                'خطا در دانلود فایل قرارداد: ' + (err instanceof Error ? err.message : String(err))
            );
        }
    };

    return {
        agreed,
        setAgreed,
        loading,
        error,
        showPreview,
        setShowPreview,
        pdfUrl,
        handleAccept,
        handlePreview,
        handleDownload,
    };
}

export default function ContractStep() {
    const {
        agreed,
        setAgreed,
        loading,
        error,
        showPreview,
        setShowPreview,
        pdfUrl,
        handleAccept,
        handlePreview,
        handleDownload,
    } = useContractStep();

    return (
        <Box className="h-full space-y-6 py-4">
            <Box className="space-y-6 bg-gray-50 py-3 text-center">
                <Box>
                    <DocumentTextIcon className="text-primary-600 mx-auto mb-4 h-16 w-16" />
                    <Typography variant="h5" className="mb-2">
                        قرارداد فی‌مابین مشتری و بانک اقتصاد نوین
                    </Typography>
                    <Typography
                        variant="h6"
                        className="text-muted-foreground text-error-600 font-bold"
                    >
                        لطفا شرایط قرارداد را دانلود و سپس به دقت مطالعه فرمایید
                    </Typography>
                </Box>

                <Box className="flex w-full items-center gap-4">
                    <Box className="flex w-full gap-3 px-5">
                        <Button
                            variant="outline"
                            onClick={handlePreview}
                            leftIcon={<EyeIcon className="ml-1 h-4 w-4" />}
                            className="w-full text-gray-900 transition-all duration-200 hover:scale-105"
                        >
                            پیش‌نمایش
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleDownload}
                            leftIcon={<ArrowDownTrayIcon className="ml-1 h-4 w-4" />}
                            className="w-full text-white transition-all duration-200 hover:scale-105"
                        >
                            دانلود
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Card className="bg-gray-100">
                <CardContent>
                    <Box className="space-y-4">
                        <Box className="flex gap-4">
                            <Input
                                type="checkbox"
                                id="agreement"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="border-primary text-primary dark:text-primary mt-1 h-5 w-5 cursor-pointer rounded"
                                aria-describedby="agreement-error"
                            />
                            <Box className="flex-1">
                                <label
                                    htmlFor="agreement"
                                    className="text-foreground dark:text-foreground cursor-pointer text-sm leading-relaxed font-medium"
                                >
                                    با مطالعه کامل متن قرارداد، تمامی شرایط و ضوابط آن را پذیرفته و
                                    متعهد به رعایت آن می‌باشم. اطلاعات ارائه شده صحیح بوده و در صورت
                                    عدم صحت، مسئولیت کامل بر عهده من خواهد بود.
                                </label>
                                {error && (
                                    <p
                                        id="agreement-error"
                                        className="text-destructive dark:text-destructive mt-2 text-sm"
                                        role="alert"
                                    >
                                        {error}
                                    </p>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box className="mx-auto flex w-full flex-col justify-center gap-4 sm:flex-row md:w-1/2">
                <Button
                    size="md"
                    onClick={handleAccept}
                    disabled={!agreed || loading}
                    loading={loading}
                    fullWidth
                    leftIcon={!loading ? <CheckCircleIcon className="h-5 w-5" /> : undefined}
                    className="bg-primary text-dark-800 transition-all duration-200 hover:scale-105"
                >
                    {loading ? 'در حال پردازش...' : 'ثبت نهایی و ادامه'}
                </Button>
            </Box>
            <PdfPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                pdfUrl={pdfUrl}
                title="پیش‌نمایش قرارداد"
            />
        </Box>
    );
}
