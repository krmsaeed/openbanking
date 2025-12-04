'use client';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    List,
    ListItem,
    Typography,
} from '@/components/ui';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { PdfPreviewModal } from '@/components/ui/overlay/PdfPreviewModal';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import { ArrowDownTrayIcon, DocumentTextIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Modal from '../ui/overlay/Modal';
import { useUser } from '@/contexts/UserContext';
import CertificateStep from './CertificateStep';
import httpClient from '@/lib/httpClient';
import { Controller, useForm } from 'react-hook-form';
import { toPersianDate } from '@/lib/utils';
const PDF_URL = '/test.pdf';


function useContractStep() {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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

            setShowModal(true);
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
        showModal,
        setShowModal,
        otp,
        setOtp,
        otpLoading,
        setOtpLoading,
        password,
        setPassword,
        showPassword,
        setShowPassword,
        handleAccept,
        handlePreview,
        handleDownload,
    };
}

export default function ContractStep() {
    const { userData, setUserData } = useUser();
    const userLoan = userData.userLoan;
    const {
        control,
        formState: { errors },
        setError,
    } = useForm({
        defaultValues: {
            password: '',
        },
    })
    const {
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
        password,
        setPassword,
        showPassword,
        setShowPassword,
        handleAccept,
        handlePreview,
        handleDownload,
    } = useContractStep();
    return (
        <Box className="h-full space-y-6 py-4">
            {/* Contract Header */}
            <Box className="space-y-6 bg-gray-100 py-3 text-center">
                <Box>
                    <DocumentTextIcon className="text-primary-700 mx-auto mb-4 h-16 w-16" />
                    <Typography variant="h4" className="mb-2">
                        قرارداد فی‌مابین مشتری و بانک اقتصاد نوین
                    </Typography>
                    <Typography variant="body2" className="text-muted-foreground">
                        لطفا شرایط قرارداد را به دقت مطالعه فرمایید
                    </Typography>
                </Box>

                <Box className="flex flex-col items-center gap-4">
                    <Box className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handlePreview}
                            leftIcon={<EyeIcon className="ml-1 h-4 w-4" />}
                            className="py-5 text-gray-900 transition-all duration-200 hover:scale-105"
                        >
                            پیش‌نمایش
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                            className="min-w-32 py-5 transition-all duration-200 hover:scale-105"
                        >
                            دانلود
                        </Button>
                    </Box>

                </Box>
            </Box>

            <Card className="bg-gray-200">
                <CardHeader>
                    <CardTitle>جزئیات قرارداد</CardTitle>
                </CardHeader>
                <CardContent>
                    <Box className="grid gap-6 md:grid-cols-2">

                        <Box className="space-y-4 ">
                            <Typography variant="h4" className="text-sm leading-relaxed font-semibold text-right">
                                مشخصات وام شما به شرح زیر است:
                            </Typography>
                            <List className="list-disc list-inside space-y-1 text-right">
                                <ListItem className="text-gray-700 flex gap-2">
                                    نام و نام خانوادگی:
                                    <Typography variant="span" className="font-medium text-gray-900">
                                        {userLoan?.fullName || ''}
                                    </Typography>
                                </ListItem>
                                <ListItem className="text-gray-700 flex gap-2">
                                    شماره وام:
                                    <Typography variant="span" className="font-medium text-gray-900">
                                        {userLoan?.LoanNumber || '0'}
                                    </Typography>
                                </ListItem>
                                <ListItem className="text-gray-700 flex gap-2">
                                    مبلغ قابل پرداخت: <Typography variant="span" className="font-medium text-gray-900">{userLoan?.payableAmount?.toLocaleString() || '0'} ریال</Typography>
                                </ListItem>
                                <ListItem className="text-gray-700 flex gap-2">
                                    تعداد اقساط: <Typography variant="span" className="font-medium text-gray-900">{userLoan?.installmentCount || '0'}  قسط </Typography>
                                </ListItem>
                                <ListItem className="text-gray-700 flex gap-2">
                                    اولین قسط:
                                    <Typography variant="span" className="font-medium text-gray-900">{toPersianDate(userLoan?.firstPaymentDate) || ''}</Typography>
                                </ListItem>
                                <ListItem className="text-gray-700 flex gap-2">
                                    نرخ جریمه: <Typography variant="span" className="font-medium text-gray-900">{userLoan?.penaltyRate || ''} درصد </Typography>
                                </ListItem>
                                <ListItem className="text-gray-700 flex gap-2">
                                    مبلغ پیش پرداخت: <Typography variant="span" className="font-medium text-gray-900">{userLoan?.advancedAmount?.toLocaleString() || '0'} ریال</Typography>
                                </ListItem>

                                <ListItem className="text-gray-700 flex gap-2">
                                    توضیحات: <Typography variant="span" className="font-medium text-gray-900">{userLoan?.description || 'ندارد'}</Typography>
                                </ListItem>
                                <ListItem className="text-gray-700 flex gap-2">
                                    تاریخ شروع قرارداد: <Typography variant="span" className="font-medium text-gray-900">{toPersianDate(userLoan?.contractStartDate) || ''}</Typography>
                                </ListItem>
                                <ListItem className="text-gray-700 flex gap-2">
                                    فاصله زمانی بین اقساط: <Typography variant="span" className="font-medium text-gray-900">{userLoan?.installmentInterval || ''}  ماه </Typography>
                                </ListItem>
                                <ListItem className="text-gray-700 flex gap-2">
                                    درصد تخفیف: <Typography variant="span" className="font-medium text-gray-900">{userLoan?.discountRate || '0'} درصد </Typography>
                                </ListItem>

                            </List>


                        </Box>
                    </Box>
                </CardContent>
            </Card>

            <Card className="bg-gray-200">
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

            <Box>
                <Box className="mx-auto flex w-full flex-col justify-center gap-4 sm:flex-row md:w-1/2">
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
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="تایید نهایی"
                size="md"
            >
                <Box className="">
                    <Box className="rounded-lg bg-gray-100 p-4 space-y-4">
                        <Controller
                            name="password"
                            control={control}
                            render={({ field }) => (
                                <Box className="relative">
                                    <Input
                                        {...field}
                                        type={showPassword ? 'text' : 'password'}
                                        label="رمز عبور"
                                        placeholder="رمز عبور خود را وارد کنید"
                                        value={password}
                                        onChange={(e) => {
                                            const original = e.target.value;
                                            const filtered = original.replace(/\D/g, '');
                                            if (original !== filtered) {
                                                setError("password", { type: "manual", message: 'رمز عبور باید فقط شامل اعداد باشد' });
                                            } else {
                                                setError("password", { type: "manual", message: '' });
                                            }
                                            setPassword(e.target.value.replace(/\D/g, ''))
                                        }}
                                        required
                                        fullWidth
                                        maxLength={8}
                                        className="text-left"
                                        dir="ltr"
                                        error={errors.password?.message}
                                        startAdornment={
                                            <Box
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="cursor-pointer"
                                            >
                                                {showPassword ? (
                                                    <EyeSlashIcon className="h-5 w-5" />
                                                ) : (
                                                    <EyeIcon className="h-5 w-5" />
                                                )}
                                            </Box>
                                        }
                                    />

                                </Box>
                            )}
                        />
                        <CertificateStep
                            otp={otp}
                            setOtp={setOtp}
                            onResend={() => {
                                setOtpLoading(true);
                                httpClient
                                    .post('/api/bpms/send-message', {
                                        serviceName: 'virtual-open-deposit',
                                        processId: userData.processId,
                                        formName: 'CertificateRequest',
                                        body: {
                                            ENFirstName: userData.ENFirstName,
                                            ENLastName: userData.ENLastName,
                                            password: userData.password,
                                        },
                                    })
                                    .then(() => {
                                        showDismissibleToast('کد تایید مجدد ارسال شد', 'success');
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
                            }}
                            onIssue={() => {
                                if (password !== userData.password) {
                                    showDismissibleToast('رمز عبور اشتباه است', 'error');
                                    return;
                                }
                                if (otp.length === 4) {
                                    setOtpLoading(true);
                                    httpClient
                                        .post('/api/bpms/send-message', {
                                            serviceName: 'virtual-open-deposit',
                                            formName: 'CertificateOtpVerify',
                                            processId: userData.processId,
                                            body: {
                                                otpCode: otp.trim(),
                                                password: userData.password,
                                            },
                                        })
                                        .then(() => {
                                            setUserData({ step: 6 });
                                            setShowModal(false);
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
                                } else {
                                    showDismissibleToast('کد تایید را کامل وارد کنید', 'error');
                                }
                            }}
                            loading={otpLoading}
                        />
                    </Box>

                </Box>
            </Modal>
        </Box>
    );
}
