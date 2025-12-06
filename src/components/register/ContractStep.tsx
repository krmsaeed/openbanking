'use client';
import { Box, Button, Card, CardContent, Input, List, ListItem, Typography } from '@/components/ui';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { PdfPreviewModal } from '@/components/ui/overlay/PdfPreviewModal';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import { useState } from 'react';
import Modal from '../ui/overlay/Modal';
import { useUser } from '@/contexts/UserContext';
import ContractOtpStep from './ContractOtpStep';
import httpClient from '@/lib/httpClient';

import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { toPersianDate } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { simplePasswordSchema } from '@/lib/schemas/personal';
import axios from 'axios';

type PasswordFormData = {
    password: string;
};

const PDF_URL = '/test.pdf';

function useContractStep() {
    const router = useRouter();
    const { userData, clearUserData } = useUser();
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [signedPdfUrl, setSignedPdfUrl] = useState<string>('');
    const [signedPdfUrlByBank, setSignedPdfUrlByBank] = useState<string>('');
    const [showSignedPreview, setShowSignedPreview] = useState(false);
    const [showSignedPreviewByBank, setShowSignedPreviewByBank] = useState(false);
    const [bankSignLoading, setBankSignLoading] = useState(false);
    const handleAccept = async () => {
        if (!agreed) {
            setError('لطفا ابتدا شرایط قرارداد را مطالعه و تأیید کنید.');
            return;
        }

        setLoading(true);
        setError(null);

        await httpClient
            .post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'SignCustomerLoanContract',
                body: {
                    accept: true,
                },
            })
            .then(() => {
                setShowModal(true);
            })
            .catch(async (err) => {
                const message = await resolveCatalogMessage(
                    err.response?.data,
                    'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
                );
                showDismissibleToast(message, 'error');
            })
            .finally(() => {
                setLoading(false);
            });
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

    const handleCancelConfirm = () => {
        clearUserData();
        router.push('/');
    };

    return {
        agreed,
        setAgreed,
        loading,
        error,
        showPreview,
        setShowPreview,
        pdfUrl,
        showModal,
        setShowModal,
        otp,
        setOtp,
        otpLoading,
        setOtpLoading,
        showPassword,
        setShowPassword,
        signedPdfUrl,
        setSignedPdfUrl,
        signedPdfUrlByBank,
        setSignedPdfUrlByBank,
        showSignedPreview,
        setShowSignedPreview,
        showSignedPreviewByBank,
        setShowSignedPreviewByBank,
        bankSignLoading,
        setBankSignLoading,
        handleAccept,
        handlePreview,
        handleDownload,
        handleCancelConfirm,
    };
}

export default function ContractStep() {
    const { userData } = useUser();
    const router = useRouter();
    const userLoan = userData.userLoan;
    const passwordSchema = z.object({ password: simplePasswordSchema });
    const {
        control,
        formState: { errors, isValid },
        setError,
        getValues,
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: '',
        },
        mode: 'onChange',
    });
    const {
        agreed,
        setAgreed,
        loading,
        showPreview,
        setShowPreview,
        pdfUrl,
        showModal,
        setShowModal,
        otp,
        setOtp,
        otpLoading,
        setOtpLoading,
        showPassword,
        setShowPassword,
        signedPdfUrl,
        setSignedPdfUrl,
        signedPdfUrlByBank,
        setSignedPdfUrlByBank,
        showSignedPreview,
        setShowSignedPreview,
        showSignedPreviewByBank,
        setShowSignedPreviewByBank,
        bankSignLoading,
        setBankSignLoading,
        handleAccept,
        handleCancelConfirm,
    } = useContractStep();
    const onIssue = () => {
        setOtpLoading(true);
        httpClient
            .post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                formName: 'MtcRequestSignResult',
                processId: userData.processId,
                body: {
                    otpCode: otp,
                    password: getValues('password'),
                },
            })
            .then((response) => {
                if (response.status === 200 && response.data?.body?.responseBase64) {
                    try {
                        setSignedPdfUrl(
                            `data:application/pdf;base64,${response.data.body.responseBase64}`
                        );
                        setShowModal(false);
                        setShowSignedPreview(true);
                    } catch (error) {
                        console.error('Error setting PDF URL:', error);
                        showDismissibleToast('خطا در نمایش PDF', 'error');
                    }
                } else {
                    showDismissibleToast('پاسخ نامعتبر دریافت شد', 'error');
                }
            })
            .catch(async (error) => {
                const message = await resolveCatalogMessage(
                    error.response?.data,
                    'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
                );
                showDismissibleToast(message, 'error');
            })
            .finally(() => {
                setOtpLoading(false);
            });
    };
    return (
        <Box className="h-full space-y-6 py-4">
            <Card className="bg-gray-200">
                <CardContent>
                    <Box className="grid gap-6 md:grid-cols-2">
                        <Box className="space-y-4">
                            <Typography
                                variant="h4"
                                className="text-right text-sm leading-relaxed font-semibold"
                            >
                                مشخصات وام شما به شرح زیر است:
                            </Typography>
                            <List className="list-inside list-disc space-y-1 text-right">
                                <ListItem className="flex gap-2 text-gray-700">
                                    نام و نام خانوادگی:
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {userLoan?.fullName || ''}
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex gap-2 text-gray-700">
                                    شماره وام:
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {userLoan?.LoanNumber || '0'}
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex gap-2 text-gray-700">
                                    مبلغ قابل پرداخت:{' '}
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {userLoan?.payableAmount?.toLocaleString() || '0'} ریال
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex gap-2 text-gray-700">
                                    تعداد اقساط:{' '}
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {userLoan?.installmentCount || '0'} قسط{' '}
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex gap-2 text-gray-700">
                                    اولین قسط:
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {toPersianDate(userLoan?.firstPaymentDate) || ''}
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex gap-2 text-gray-700">
                                    نرخ جریمه:{' '}
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {userLoan?.penaltyRate || ''} درصد{' '}
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex gap-2 text-gray-700">
                                    مبلغ پیش پرداخت:{' '}
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {userLoan?.advancedAmount?.toLocaleString() || '0'} ریال
                                    </Typography>
                                </ListItem>

                                <ListItem className="flex gap-2 text-gray-700">
                                    توضیحات:{' '}
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {userLoan?.description || 'ندارد'}
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex gap-2 text-gray-700">
                                    تاریخ شروع قرارداد:{' '}
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {toPersianDate(userLoan?.contractStartDate) || ''}
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex gap-2 text-gray-700">
                                    فاصله زمانی بین اقساط:{' '}
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {userLoan?.installmentInterval || ''} ماه{' '}
                                    </Typography>
                                </ListItem>
                                <ListItem className="flex gap-2 text-gray-700">
                                    درصد تخفیف:{' '}
                                    <Typography
                                        variant="span"
                                        className="font-medium text-gray-900"
                                    >
                                        {userLoan?.discountRate || '0'} درصد{' '}
                                    </Typography>
                                </ListItem>
                            </List>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Box className="flex items-center gap-2">
                <Input
                    type="checkbox"
                    id="agreement"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="text-primary h-5 w-5 cursor-pointer rounded"
                    aria-describedby="agreement-error"
                />
                <Box className="flex-1">
                    <label htmlFor="agreement" className="cursor-pointer text-sm font-medium">
                        موارد فوق مورد تایید میباشد
                    </label>
                </Box>
            </Box>

            <Box>
                <Box className="mx-auto flex w-full flex-col justify-center gap-4 sm:flex-row md:w-1/2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            Swal.fire({
                                title: 'انصراف از ثبت‌نام',
                                text: 'آیا مطمئن هستید که می‌خواهید از فرآیند ثبت‌نام انصراف دهید؟',
                                icon: 'error',
                                showCancelButton: true,
                                confirmButtonText: 'بله، انصراف می‌دهم',
                                cancelButtonText: 'خیر، ادامه می‌دهم',
                                confirmButtonColor: 'var(--color-error-500)',
                                cancelButtonColor: 'var(--color-primary-500)',
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    handleCancelConfirm();
                                }
                            });
                        }}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                        title="انصراف"
                    >
                        انصراف
                    </Button>
                    <LoadingButton
                        loading={loading}
                        onClick={handleAccept}
                        disabled={!agreed || loading}
                        title="ثبت نهایی و ادامه"
                    />
                </Box>
            </Box>
            <PdfPreviewModal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                pdfUrl={pdfUrl}
                title="پیش‌نمایش قرارداد"
            />
            <PdfPreviewModal
                isOpen={showSignedPreview}
                onClose={() => setShowSignedPreview(false)}
                pdfUrl={signedPdfUrl}
                title="قرارداد امضا شده توسط مشتری"
                onConfirm={async () => {
                    setBankSignLoading(true);
                    await httpClient
                        .post('/api/bpms/send-message', {
                            serviceName: 'virtual-open-deposit',
                            processId: userData.processId,
                            formName: 'SignDocumentResult',
                            body: {},
                        })
                        .then((response) => {
                            console.log('🚀 ~ ContractStep ~ response:', response);
                            if (response.status === 200 && response.data?.body?.stampedData) {
                                try {
                                    setSignedPdfUrlByBank(
                                        `data:application/pdf;base64,${response.data.body.stampedData}`
                                    );
                                    setShowSignedPreview(false);
                                    setShowSignedPreviewByBank(true);
                                } catch (error) {
                                    console.error('Error setting PDF URL:', error);
                                    showDismissibleToast('خطا در نمایش PDF', 'error');
                                }
                            } else {
                                showDismissibleToast('پاسخ نامعتبر دریافت شد', 'error');
                            }
                        })
                        .catch(async (error) => {
                            await resolveCatalogMessage(
                                axios.isAxiosError(error) ? error.response?.data : undefined,
                                'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
                            );
                        })
                        .finally(() => {
                            setBankSignLoading(false);
                        });
                }}
                loading={bankSignLoading}
            />
            <PdfPreviewModal
                isOpen={showSignedPreviewByBank}
                onClose={() => setShowSignedPreviewByBank(false)}
                pdfUrl={signedPdfUrlByBank}
                title="قرارداد امضا شده توسط بانک"
                onConfirm={async () => {
                    if (!signedPdfUrlByBank) {
                        showDismissibleToast('PDF امضا شده در دسترس نیست', 'error');
                        return;
                    }

                    try {
                        const link = document.createElement('a');
                        link.href = signedPdfUrlByBank;
                        link.download = 'قرارداد-امضا-شده.pdf';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);

                        showDismissibleToast('تسهیلات با موفقیت ایجاد شد', 'success');
                        router.push('/');
                    } catch (error) {
                        console.error('Error downloading PDF:', error);
                        showDismissibleToast('خطا در دانلود فایل PDF', 'error');
                    }
                }}
            />
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="تایید نهایی"
                size="md"
                closeOnClickOutside={false}
            >
                <ContractOtpStep
                    control={control}
                    errors={errors}
                    setError={setError}
                    getValues={getValues}
                    otp={otp}
                    setOtp={setOtp}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    userData={userData}
                    setOtpLoading={setOtpLoading}
                    onIssue={onIssue}
                    loading={otpLoading}
                    isValid={isValid}
                />
            </Modal>
        </Box>
    );
}
