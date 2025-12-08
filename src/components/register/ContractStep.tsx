'use client';
import { Box, Button, Card, CardContent, Input, List, ListItem, Typography } from '@/components/ui';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { PdfPreviewModal } from '@/components/ui/overlay/PdfPreviewModal';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import Modal from '../ui/overlay/Modal';
import { useUser } from '@/contexts/UserContext';
import ContractOtpStep from './ContractOtpStep';
import httpClient from '@/lib/httpClient';
import Swal from 'sweetalert2';
import { toPersianDate } from '@/lib/utils';
import axios from 'axios';
import { useContractStep } from '@/hooks/useContractStep';

export default function ContractStep() {
    const { userData } = useUser();
    const userLoan = userData.userLoan;
    const {
        agreed,
        setAgreed,
        loading,
        showPreview,
        setShowPreview,
        pdfUrl,
        showModal,
        setShowModal,
        signedPdfUrl,
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
    const handleConfirmSignByCustomer = async () => {
        setBankSignLoading(true);
        try {
            const response = await httpClient.post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'SignDocumentResult',
                body: {},
            });

            if (response.status === 200 && response.data?.body?.stampedData) {
                setSignedPdfUrlByBank(
                    `data:application/pdf;base64,${response.data.body.stampedData}`
                );
                setShowSignedPreview(false);
                setShowSignedPreviewByBank(true);
            } else {
                showDismissibleToast('پاسخ نامعتبر دریافت شد', 'error');
            }
        } catch (error) {
            const message = await resolveCatalogMessage(
                axios.isAxiosError(error) ? error.response?.data : undefined,
                'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
            );
            showDismissibleToast(message, 'error');
        } finally {
            setBankSignLoading(false);
        }
    }
    const handleConfirmSignByBank = async () => {
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
            handleCancelConfirm();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            showDismissibleToast('خطا در دانلود فایل PDF', 'error');
        }
    }
    return (
        <Box className="h-full space-y-6 py-4 ">
            <Box className='bg-gray-200 p-4'>
                <Box>
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
                title='قرارداد امضا شده توسط بانک'
            />
            <PdfPreviewModal
                isOpen={showSignedPreview}
                onClose={() => setShowSignedPreview(false)}
                pdfUrl={signedPdfUrl}
                title="قرارداد امضا شده توسط مشتری"
                onConfirm={handleConfirmSignByCustomer}
                loading={bankSignLoading}
            />
            <PdfPreviewModal
                isOpen={showSignedPreviewByBank}
                onClose={() => setShowSignedPreviewByBank(false)}
                pdfUrl={signedPdfUrlByBank}
                title="قرارداد امضا شده توسط بانک"
                onConfirm={handleConfirmSignByBank}
            />
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="تایید نهایی"
                size="md"
                closeOnClickOutside={false}
                showCloseButton={false}
            >
                <ContractOtpStep />
            </Modal>
        </Box>
    );
}
