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
import {
    ArrowDownTrayIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    PrinterIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
    const router = useRouter();

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

            router.push('/payment/gateway');
        } catch (err) {
            console.error('Contract acceptance error:', err);
            setError(err instanceof Error ? err.message : 'خطای نامشخص رخ داده است');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        try {
            const content = generateContractText(contractDetails);
            const element = document.createElement('a');
            const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
            element.href = URL.createObjectURL(file);
            element.download = `contract-${contractDetails.contractNumber}.txt`;
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        } catch (err) {
            setError(
                'خطا در دانلود فایل قرارداد: ' + (err instanceof Error ? err.message : String(err))
            );
        }
    };

    const generateContractText = (details: ContractDetails): string => {
        return `
قرارداد تسهیلات بانکی
بانک اقتصاد نوین

شماره قرارداد: ${details.contractNumber}
تاریخ: ${details.date}

مشخصات مشتری:
نام: ${details.customerName}
کد ملی: ${details.nationalId}
شماره تماس: ${details.phoneNumber}

جزئیات تسهیلات:
مبلغ تسهیلات: ${details.facilityAmount} ریال
نرخ سود: ${details.interestRate}% سالانه
مدت بازپرداخت: ${details.duration} ماه
قسط ماهانه: ${details.monthlyPayment} ریال

${CONTRACT_CLAUSES.map(
    (clause) =>
        `${clause.title}\n${clause.content
            .replace('{facilityAmount}', details.facilityAmount)
            .replace('{duration}', details.duration)
            .replace('{monthlyPayment}', details.monthlyPayment)
            .replace('{interestRate}', details.interestRate)}\n`
).join('\n')}

تأیید مشتری: ____________________
تاریخ: ____________________
        `.trim();
    };

    return {
        agreed,
        setAgreed,
        loading,
        error,
        contractDetails,
        handleAccept,
        handlePrint,
        handleDownload,
        contractClauses: CONTRACT_CLAUSES,
    };
}

export default function ContractStep() {
    const {
        agreed,
        setAgreed,
        loading,
        error,
        contractDetails,
        handleAccept,
        handlePrint,
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
                            size="sm"
                            onClick={handlePrint}
                            leftIcon={<PrinterIcon className="h-4 w-4" />}
                            className="transition-all duration-200 hover:scale-105"
                        >
                            چاپ
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownload}
                            leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
                            className="transition-all duration-200 hover:scale-105"
                        >
                            دانلود
                        </Button>
                    </Box>
                    <Typography variant="h5" className="text-center">
                        مشخصات قرارداد
                    </Typography>
                </Box>
            </Box>

            <Card className="bg-gray-100">
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
            <Card className="bg-gray-100">
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
        </Box>
    );
}
