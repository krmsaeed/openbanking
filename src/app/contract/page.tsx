'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
    ArrowDownTrayIcon,
    CheckCircleIcon,
    DocumentTextIcon,
    PrinterIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ContractPage() {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const contractDetails = {
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
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            router.push('/payment/gateway');
        }, 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const element = document.createElement('a');
        const file = new Blob(['قرارداد تسهیلات بانکی...'], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `contract-${contractDetails.contractNumber}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    return (
        <div className="bg-dark-50 min-h-screen py-8">
            <div className="">
                <div className="mb-2 text-center">
                    <DocumentTextIcon className="text-primary-600 mx-auto mb-2 h-16 w-16" />
                    <p className="text-dark">قرارداد فی‌مابین مشتری و بانک اقتصاد نوین</p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>مشخصات قرارداد</span>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={handlePrint}>
                                    <PrinterIcon className="ml-2 h-4 w-4" />
                                    چاپ
                                </Button>
                                <Button variant="secondary" size="sm" onClick={handleDownload}>
                                    <ArrowDownTrayIcon className="ml-2 h-4 w-4" />
                                    دانلود
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-dark text-sm font-medium">
                                        شماره قرارداد
                                    </label>
                                    <p className="text-primary-600 text-lg font-bold">
                                        {contractDetails.contractNumber}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-dark text-sm font-medium">
                                        تاریخ قرارداد
                                    </label>
                                    <p className="text-dark-800">{contractDetails.date}</p>
                                </div>
                                <div>
                                    <label className="text-dark text-sm font-medium">
                                        نام مشتری
                                    </label>
                                    <p className="text-dark-800">{contractDetails.customerName}</p>
                                </div>
                                <div>
                                    <label className="text-dark text-sm font-medium">کد ملی</label>
                                    <p className="text-dark-800">{contractDetails.nationalId}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-dark text-sm font-medium">
                                        مبلغ تسهیلات
                                    </label>
                                    <p className="text-success text-lg font-bold">
                                        {contractDetails.facilityAmount} ریال
                                    </p>
                                </div>
                                <div>
                                    <label className="text-dark text-sm font-medium">نرخ سود</label>
                                    <p className="text-dark-800">
                                        {contractDetails.interestRate}% سالانه
                                    </p>
                                </div>
                                <div>
                                    <label className="text-dark text-sm font-medium">
                                        مدت بازپرداخت
                                    </label>
                                    <p className="text-dark-800">{contractDetails.duration} ماه</p>
                                </div>
                                <div>
                                    <label className="text-dark text-sm font-medium">
                                        قسط ماهانه
                                    </label>
                                    <p className="text-lg font-bold text-orange-600">
                                        {contractDetails.monthlyPayment} ریال
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>شرایط و ضوابط قرارداد</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 text-justify leading-relaxed">
                            <div>
                                <h3 className="text-dark-800 mb-2 font-bold">
                                    ماده ۱ - موضوع قرارداد
                                </h3>
                                <p className="text-dark">
                                    بانک اقتصاد نوین متعهد می‌شود مبلغ{' '}
                                    {contractDetails.facilityAmount} ریال را به عنوان تسهیلات بانکی
                                    در اختیار مشتری قرار دهد. این مبلغ باید طی مدت{' '}
                                    {contractDetails.duration} ماه به صورت اقساط ماهانه بازپرداخت
                                    شود.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-dark-800 mb-2 font-bold">
                                    ماده ۲ - نحوه بازپرداخت
                                </h3>
                                <p className="text-dark">
                                    مشتری متعهد است مبلغ {contractDetails.monthlyPayment} ریال را در
                                    هر ماه تا تاریخ ۵ هر ماه به حساب بانک واریز نماید. در صورت تأخیر
                                    در پرداخت، جریمه تأخیر طبق نرخ‌های مصوب بانک مرکزی محاسبه خواهد
                                    شد.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-dark-800 mb-2 font-bold">ماده ۳ - نرخ سود</h3>
                                <p className="text-dark">
                                    نرخ سود این تسهیلات {contractDetails.interestRate}% در سال بوده
                                    که طبق مقررات بانک مرکزی جمهوری اسلامی ایران تعیین شده است. این
                                    نرخ ممکن است طبق تصمیمات بانک مرکزی تغییر یابد.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-dark-800 mb-2 font-bold">ماده ۴ - تضامین</h3>
                                <p className="text-dark">
                                    مشتری متعهد است تضامین لازم شامل اسناد و مدارک مورد نیاز بانک را
                                    ارائه داده و در طول مدت قرارداد حفظ نماید. در صورت کاهش ارزش
                                    تضامین، بانک حق درخواست تضامین اضافی را دارد.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-dark-800 mb-2 font-bold">
                                    ماده ۵ - فسخ قرارداد
                                </h3>
                                <p className="text-dark">
                                    در صورت عدم رعایت شرایط قرارداد از سوی مشتری، بانک حق فسخ
                                    قرارداد و مطالبه کل مبلغ باقیمانده را دارد. همچنین مشتری
                                    می‌تواند در هر زمان نسبت به تسویه زودهنگام اقدام نماید.
                                </p>
                            </div>

                            <div>
                                <h3 className="text-dark-800 mb-2 font-bold">ماده ۶ - حل اختلاف</h3>
                                <p className="text-dark">
                                    کلیه اختلافات ناشی از این قرارداد در مراجع ذی‌صلاح قضایی تهران
                                    قابل رسیدگی است. قوانین جمهوری اسلامی ایران بر این قرارداد حاکم
                                    خواهد بود.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-2 space-x-3 space-x-reverse">
                            <input
                                type="checkbox"
                                id="agreement"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="text-primary-500 h-7 w-7 rounded-lg bg-white"
                            />
                            <label htmlFor="agreement" className="text-dark leading-relaxed">
                                با مطالعه کامل متن قرارداد، تمامی شرایط و ضوابط آن را پذیرفته و
                                متعهد به رعایت آن می‌باشم. اطلاعات ارائه شده صحیح بوده و در صورت عدم
                                صحت، مسئولیت کامل بر عهده من خواهد بود.
                            </label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    {/* <Button
                        variant="outline"
                        size="lg"
                        onClick={handleReject}
                        className="flex items-center bg-red-600 text-white"
                    >
                        <XCircleIcon className="ml-2 h-5 w-5" />
                        عدم تأیید قرارداد
                    </Button> */}

                    <Button
                        size="lg"
                        onClick={handleAccept}
                        disabled={!agreed || loading}
                        className="bg-secondary flex items-center"
                    >
                        {loading ? (
                            <div className="ml-2 h-4 w-10 animate-spin rounded-full"></div>
                        ) : (
                            <CheckCircleIcon className="ml-2 h-5 w-5" />
                        )}
                        {loading ? 'در حال پردازش...' : 'ثبت نهایی'}
                    </Button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        با تأیید این قرارداد، به مرحله پرداخت هدایت خواهید شد
                    </p>
                </div>
            </div>
        </div>
    );
}
