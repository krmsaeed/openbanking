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
    Label,
    Typography,
} from '@/components/ui';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { PdfPreviewModal } from '@/components/ui/overlay/PdfPreviewModal';
import { ArrowDownTrayIcon, DocumentTextIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import Modal from '../ui/overlay/Modal';
import { useUser } from '@/contexts/UserContext';
import CertificateStep from './CertificateStep';
import axios from 'axios';
import { Controller, useForm } from 'react-hook-form';
const PDF_URL = '/test.pdf';

interface ContractDetails {
    contractNumber: string;
    date: string;
    customerName: string;
    nationalId: string;
    phoneNumber: string;
    facilityAmount: string;
    interestRate: string;
    duration: string;
    monthlyPayment: string;
}

interface ContractClause {
    id: string;
    title: string;
    content: string;
}

const CONTRACT_CLAUSES: ContractClause[] = [
    {
        id: 'subject',
        title: 'ماده ۱ - موضوع قرارداد',
        content:
            'بانک اقتصاد نوین متعهد می‌شود مبلغ {facilityAmount} ریال را به عنوان تسهیلات بانکی در اختیار مشتری قرار دهد. این مبلغ باید طی مدت {duration} ماه به صورت اقساط ماهانه بازپرداخت شود.',
    },
    {
        id: 'repayment',
        title: 'ماده ۲ - نحوه بازپرداخت',
        content:
            'مشتری متعهد است مبلغ {monthlyPayment} ریال را در هر ماه تا تاریخ ۵ هر ماه به حساب بانک واریز نماید. در صورت تأخیر در پرداخت، جریمه تأخیر طبق نرخ‌های مصوب بانک مرکزی محاسبه خواهد شد.',
    },
    {
        id: 'interest',
        title: 'ماده ۳ - نرخ سود',
        content:
            'نرخ سود این تسهیلات {interestRate}% در سال بوده که طبق مقررات بانک مرکزی جمهوری اسلامی ایران تعیین شده است. این نرخ ممکن است طبق تصمیمات بانک مرکزی تغییر یابد.',
    },
    {
        id: 'guarantees',
        title: 'ماده ۴ - تضامین',
        content:
            'مشتری متعهد است تضامین لازم شامل اسناد و مدارک مورد نیاز بانک را ارائه داده و در طول مدت قرارداد حفظ نماید. در صورت کاهش ارزش تضامین، بانک حق درخواست تضامین اضافی را دارد.',
    },
    {
        id: 'termination',
        title: 'ماده ۵ - فسخ قرارداد',
        content:
            'در صورت عدم رعایت شرایط قرارداد از سوی مشتری، بانک حق فسخ قرارداد و مطالبه کل مبلغ باقیمانده را دارد. همچنین مشتری می‌تواند در هر زمان نسبت به تسویه زودهنگام اقدام نماید.',
    },
    {
        id: 'dispute',
        title: 'ماده ۶ - حل اختلاف',
        content:
            'کلیه اختلافات ناشی از این قرارداد در مراجع ذی‌صلاح قضایی تهران قابل رسیدگی است. قوانین جمهوری اسلامی ایران بر این قرارداد حاکم خواهد بود.',
    },
];

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

    const contractDetails: ContractDetails = {
        contractNumber: 'TC-2025-001234',
        date: '۱۴۰۴/۰۶/۰۹',
        customerName: 'محمد احمدی',
        nationalId: '1234567890',
        phoneNumber: '09123456789',
        facilityAmount: '50,000,000',
        interestRate: '18',
        duration: '12',
        monthlyPayment: '4,583,333',
    };

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
        contractDetails,
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
        contractClauses: CONTRACT_CLAUSES,
    };
}

export default function ContractStep() {
    const { userData, setUserData } = useUser();
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
        contractDetails,
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
        contractClauses,
    } = useContractStep();

    const renderContractDetail = (label: string, value: string, highlight = false) => (
        <Box className="space-y-1">
            <Label className="text-muted-foreground text-sm font-medium">{label}</Label>
            <Typography
                variant="p"
                className={`text-sm ${highlight ? 'text-primary-700 font-bold' : 'text-foreground'}`}
            >
                {value}
            </Typography>
        </Box>
    );

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
                    <Typography variant="h5" className="text-center">
                        مشخصات قرارداد
                    </Typography>
                </Box>
            </Box>

            <Card className="bg-gray-200">
                <CardHeader>
                    <CardTitle>جزئیات قرارداد</CardTitle>
                    <CardDescription>اطلاعات کامل قرارداد تسهیلاتی شما</CardDescription>
                </CardHeader>
                <CardContent>
                    <Box className="grid gap-6 md:grid-cols-2">
                        <Box className="space-y-4">
                            {renderContractDetail(
                                'شماره قرارداد',
                                contractDetails.contractNumber,
                                true
                            )}
                            {renderContractDetail('تاریخ قرارداد', contractDetails.date)}
                            {renderContractDetail('نام مشتری', contractDetails.customerName)}
                            {renderContractDetail('کد ملی', contractDetails.nationalId)}
                        </Box>
                        <Box className="space-y-4">
                            {renderContractDetail(
                                'مبلغ تسهیلات',
                                `${contractDetails.facilityAmount} ریال`,
                                true
                            )}
                            {renderContractDetail(
                                'نرخ سود',
                                `${contractDetails.interestRate}% سالانه`
                            )}
                            {renderContractDetail(
                                'مدت بازپرداخت',
                                `${contractDetails.duration} ماه`
                            )}
                            {renderContractDetail(
                                'قسط ماهانه',
                                `${contractDetails.monthlyPayment} ریال`,
                                true
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Contract Clauses */}
            <Card className="bg-gray-200">
                <CardHeader>
                    <CardTitle>شرایط و ضوابط قرارداد</CardTitle>
                    <CardDescription>مواد قرارداد که لازم است مطالعه فرمایید</CardDescription>
                </CardHeader>
                <CardContent>
                    <Box className="space-y-6">
                        {contractClauses.map((clause) => (
                            <Box key={clause.id} className="space-y-2">
                                <Typography
                                    variant="h6"
                                    className="text-foreground dark:text-foreground font-bold"
                                >
                                    {clause.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    className="text-muted-foreground dark:text-muted-foreground text-justify leading-relaxed"
                                >
                                    {clause.content
                                        .replace('{facilityAmount}', contractDetails.facilityAmount)
                                        .replace('{duration}', contractDetails.duration)
                                        .replace('{monthlyPayment}', contractDetails.monthlyPayment)
                                        .replace('{interestRate}', contractDetails.interestRate)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* Agreement Section */}
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
                                axios
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
                                    .catch((error) => {
                                        const data = (error as { response?: { data?: { digitalMessageException?: { message?: string } } } })?.response?.data;
                                        showDismissibleToast(
                                            data?.digitalMessageException?.message || 'خطایی رخ داد',
                                            'error'
                                        );

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
                                    axios
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
                                        .catch((error) => {
                                            const data = (error as { response?: { data?: { digitalMessageException?: { message?: string } } } })?.response?.data;
                                            showDismissibleToast(
                                                data?.digitalMessageException?.message || 'خطایی رخ داد',
                                                'error'
                                            );
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
