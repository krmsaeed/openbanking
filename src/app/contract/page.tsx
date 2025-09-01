"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    DocumentTextIcon,
    PrinterIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    XCircleIcon
} from "@heroicons/react/24/outline";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function ContractPage() {
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const contractDetails = {
        contractNumber: "TC-2025-001234",
        date: "۱۴۰۴/۰۶/۰۹",
        customerName: "محمد احمدی",
        nationalId: "1234567890",
        phoneNumber: "09123456789",
        facilityAmount: "50,000,000",
        interestRate: "18",
        duration: "12",
        monthlyPayment: "4,583,333"
    };

    const handleAccept = async () => {
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            router.push('/payment/gateway');
        }, 2000);
    };

    const handleReject = () => {
        router.push('/dashboard');
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8">
                    <DocumentTextIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        قرارداد تسهیلات بانکی
                    </h1>
                    <p className="text-gray-600">
                        قرارداد فی‌مابین مشتری و بانک پرداخت نوین
                    </p>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>مشخصات قرارداد</span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrint}>
                                    <PrinterIcon className="h-4 w-4 ml-2" />
                                    چاپ
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownload}>
                                    <ArrowDownTrayIcon className="h-4 w-4 ml-2" />
                                    دانلود
                                </Button>
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">شماره قرارداد</label>
                                    <p className="text-lg font-bold text-blue-600">{contractDetails.contractNumber}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">تاریخ قرارداد</label>
                                    <p className="text-gray-900">{contractDetails.date}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">نام مشتری</label>
                                    <p className="text-gray-900">{contractDetails.customerName}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">کد ملی</label>
                                    <p className="text-gray-900">{contractDetails.nationalId}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">مبلغ تسهیلات</label>
                                    <p className="text-lg font-bold text-green-600">{contractDetails.facilityAmount} ریال</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">نرخ سود</label>
                                    <p className="text-gray-900">{contractDetails.interestRate}% سالانه</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">مدت بازپرداخت</label>
                                    <p className="text-gray-900">{contractDetails.duration} ماه</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">قسط ماهانه</label>
                                    <p className="text-lg font-bold text-orange-600">{contractDetails.monthlyPayment} ریال</p>
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
                                <h3 className="font-bold text-gray-900 mb-2">ماده ۱ - موضوع قرارداد</h3>
                                <p className="text-gray-700">
                                    بانک پرداخت نوین متعهد می‌شود مبلغ {contractDetails.facilityAmount} ریال را به عنوان تسهیلات
                                    بانکی در اختیار مشتری قرار دهد. این مبلغ باید طی مدت {contractDetails.duration} ماه
                                    به صورت اقساط ماهانه بازپرداخت شود.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">ماده ۲ - نحوه بازپرداخت</h3>
                                <p className="text-gray-700">
                                    مشتری متعهد است مبلغ {contractDetails.monthlyPayment} ریال را در هر ماه
                                    تا تاریخ ۵ هر ماه به حساب بانک واریز نماید. در صورت تأخیر در پرداخت،
                                    جریمه تأخیر طبق نرخ‌های مصوب بانک مرکزی محاسبه خواهد شد.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">ماده ۳ - نرخ سود</h3>
                                <p className="text-gray-700">
                                    نرخ سود این تسهیلات {contractDetails.interestRate}% در سال بوده که
                                    طبق مقررات بانک مرکزی جمهوری اسلامی ایران تعیین شده است.
                                    این نرخ ممکن است طبق تصمیمات بانک مرکزی تغییر یابد.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">ماده ۴ - تضامین</h3>
                                <p className="text-gray-700">
                                    مشتری متعهد است تضامین لازم شامل اسناد و مدارک مورد نیاز بانک را
                                    ارائه داده و در طول مدت قرارداد حفظ نماید. در صورت کاهش ارزش تضامین،
                                    بانک حق درخواست تضامین اضافی را دارد.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">ماده ۵ - فسخ قرارداد</h3>
                                <p className="text-gray-700">
                                    در صورت عدم رعایت شرایط قرارداد از سوی مشتری، بانک حق فسخ قرارداد
                                    و مطالبه کل مبلغ باقیمانده را دارد. همچنین مشتری می‌تواند در هر زمان
                                    نسبت به تسویه زودهنگام اقدام نماید.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">ماده ۶ - حل اختلاف</h3>
                                <p className="text-gray-700">
                                    کلیه اختلافات ناشی از این قرارداد در مراجع ذی‌صلاح قضایی تهران
                                    قابل رسیدگی است. قوانین جمهوری اسلامی ایران بر این قرارداد حاکم خواهد بود.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-start space-x-3 space-x-reverse">
                            <input
                                type="checkbox"
                                id="agreement"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="agreement" className="text-gray-700 leading-relaxed">
                                با مطالعه کامل متن قرارداد، تمامی شرایط و ضوابط آن را پذیرفته و متعهد به رعایت
                                آن می‌باشم. اطلاعات ارائه شده صحیح بوده و در صورت عدم صحت،
                                مسئولیت کامل بر عهده من خواهد بود.
                            </label>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handleReject}
                        className="flex items-center"
                    >
                        <XCircleIcon className="h-5 w-5 ml-2" />
                        عدم تأیید قرارداد
                    </Button>

                    <Button
                        size="lg"
                        onClick={handleAccept}
                        disabled={!agreed || loading}
                        className="flex items-center"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        ) : (
                            <CheckCircleIcon className="h-5 w-5 ml-2" />
                        )}
                        {loading ? 'در حال پردازش...' : 'تأیید و ادامه'}
                    </Button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        با تأیید این قرارداد، به مرحله پرداخت هدایت خواهید شد
                    </p>
                </div>
            </div>
        </div>
    );
}
