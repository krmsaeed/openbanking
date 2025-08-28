"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    ArrowRightIcon,
    ArrowLeftIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    IdentificationIcon,
    BriefcaseIcon,
    UserIcon,
    CreditCardIcon,
    DocumentTextIcon,
    PhoneIcon
} from "@heroicons/react/24/outline";
import {
    Button,
    Input,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Loading,
    FormField
} from "@/components/ui";
import { SimpleFileUpload } from "@/components/ui/media/SimpleFileUpload";

export default function CreditAssessment() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [assessmentResult, setAssessmentResult] = useState<'approved' | 'rejected' | 'pending' | null>(null);
    const [creditLimit, setCreditLimit] = useState(0);

    // مرحله 1: اطلاعات مالی
    const [financialInfo, setFinancialInfo] = useState({
        monthlyIncome: "",
        otherIncome: "",
        monthlyExpenses: "",
        workExperience: "",
        jobTitle: "",
        companyName: "",
        workAddress: "",
        requestedAmount: "",
        loanPurpose: ""
    });

    const [bankingInfo] = useState({
        bankName: "",
        accountNumber: "",
        cardNumber: "",
        hasOtherLoans: "",
        otherLoansAmount: "",
        creditScore: ""
    });

    const [identityFiles, setIdentityFiles] = useState<{
        nationalCardFront: File[];
        nationalCardBack: File[];
        birthCertificate: File[];
        personalPhoto: File[];
    }>({
        nationalCardFront: [],
        nationalCardBack: [],
        birthCertificate: [],
        personalPhoto: []
    });

    const [jobFiles, setJobFiles] = useState<{
        salarySlips: File[];
        workContract: File[];
        workCertificate: File[];
        companyLicense: File[];
    }>({
        salarySlips: [],
        workContract: [],
        workCertificate: [],
        companyLicense: []
    });

    const [bankFiles, setBankFiles] = useState<{
        bankStatements: File[];
        accountStatement: File[];
        creditReport: File[];
    }>({
        bankStatements: [],
        accountStatement: [],
        creditReport: []
    });

    const handleStep1Submit = (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields = ['monthlyIncome', 'workExperience', 'requestedAmount'];
        const missingFields = requiredFields.filter(field => {
            const value = financialInfo[field as keyof typeof financialInfo];
            return !value || value.trim() === '';
        });

        if (missingFields.length > 0) {
            toast.error("لطفاً تمام فیلدهای ضروری را پر کنید");
            return;
        }

        setStep(2);
    };

    const handleStep2Submit = () => {
        const hasNationalCardFront = identityFiles.nationalCardFront.length > 0;
        const hasNationalCardBack = identityFiles.nationalCardBack.length > 0;
        const hasBirthCertificate = identityFiles.birthCertificate.length > 0;

        if (!hasNationalCardFront || !hasNationalCardBack || !hasBirthCertificate) {
            toast.error("لطفاً تمام مدارک شناسایی ضروری را بارگذاری کنید");
            return;
        }

        setStep(3);
    };

    const handleFinalSubmit = () => {
        setLoading(true);

        setTimeout(() => {
            const income = parseInt(financialInfo.monthlyIncome);
            const expenses = parseInt(financialInfo.monthlyExpenses || "0");
            const requested = parseInt(financialInfo.requestedAmount);
            const experience = parseInt(financialInfo.workExperience);
            const otherLoans = parseInt(bankingInfo.otherLoansAmount || "0");

            const netIncome = income - expenses - otherLoans;
            const incomeToLoanRatio = netIncome > 0 ? requested / netIncome : 999;

            if (netIncome >= 5000000 &&
                experience >= 2 &&
                incomeToLoanRatio <= 48 &&
                requested <= 500000000) {

                setAssessmentResult('approved');
                setCreditLimit(Math.min(requested, netIncome * 48));

            } else if (netIncome >= 3000000 &&
                experience >= 1 &&
                incomeToLoanRatio <= 36) {

                setAssessmentResult('approved');
                setCreditLimit(Math.min(requested * 0.8, netIncome * 36));

            } else {
                setAssessmentResult('rejected');
            }

            setLoading(false);
            setStep(9);
        }, 4000);
    }; const formatCurrency = (amount: number) => {
        return amount.toLocaleString('fa-IR') + ' ریال';
    };

    const handleFileSelect = (field: string, files: FileList | null, step: number) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);

        if (step === 2) {
            setIdentityFiles(prev => ({
                ...prev,
                [field]: fileArray
            }));
        } else if (step === 3) {
            setJobFiles(prev => ({
                ...prev,
                [field]: fileArray
            }));
        } else if (step === 4) {
            setBankFiles(prev => ({
                ...prev,
                [field]: fileArray
            }));
        }
    };

    const handleRemoveFile = (field: string, index: number, step: number) => {
        if (step === 2) {
            setIdentityFiles(prev => ({
                ...prev,
                [field]: prev[field as keyof typeof prev]?.filter((_, i) => i !== index) || []
            }));
        } else if (step === 3) {
            setJobFiles(prev => ({
                ...prev,
                [field]: prev[field as keyof typeof prev]?.filter((_, i) => i !== index) || []
            }));
        } else if (step === 4) {
            setBankFiles(prev => ({
                ...prev,
                [field]: prev[field as keyof typeof prev]?.filter((_, i) => i !== index) || []
            }));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card padding="lg" className="max-w-md w-full">
                    <CardContent className="text-center">
                        <Loading className="mx-auto mb-6" />
                        <CardTitle className="mb-4">
                            در حال بررسی اطلاعات اعتباری
                        </CardTitle>
                        <CardDescription>
                            لطفاً صبر کنید، این فرآیند چند دقیقه زمان می‌برد...
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* عنوان صفحه */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">اعتبارسنجی وام</h1>
                    <p className="text-gray-600">برای دریافت وام، لطفاً مراحل زیر را تکمیل کنید</p>

                    {/* Progress Steps */}
                    <div className="flex justify-center mt-6">
                        <div className="flex items-center space-x-4 space-x-reverse overflow-x-auto pb-2">
                            {[
                                { number: 1, title: "اطلاعات شخصی", icon: UserIcon },
                                { number: 2, title: "اطلاعات تماس", icon: PhoneIcon },
                                { number: 3, title: "اطلاعات مالی", icon: BanknotesIcon },
                                { number: 4, title: "اطلاعات بانکی", icon: CreditCardIcon },
                                { number: 5, title: "مدارک شناسایی", icon: IdentificationIcon },
                                { number: 6, title: "مدارک شغلی", icon: BriefcaseIcon },
                                { number: 7, title: "مدارک بانکی", icon: DocumentTextIcon },
                                { number: 8, title: "تأیید", icon: CheckCircleIcon },
                                { number: 9, title: "نتیجه", icon: CheckCircleIcon }
                            ].map((item, index) => (
                                <div key={item.number} className="flex items-center flex-shrink-0">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= item.number
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`mr-2 text-xs font-medium whitespace-nowrap ${step >= item.number ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                        {item.title}
                                    </span>
                                    {index < 8 && (
                                        <div className={`w-6 h-0.5 mx-3 ${step > item.number ? 'bg-blue-600' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {step === 1 && (
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <BanknotesIcon className="w-6 h-6 text-blue-600" />
                                اطلاعات مالی
                            </CardTitle>
                            <CardDescription>
                                لطفاً اطلاعات درآمد و اشتغال خود را وارد کنید
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleStep1Submit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField label="درآمد ماهانه (ریال)" required>
                                        <Input
                                            type="text"
                                            placeholder="مثال: 15000000"
                                            value={financialInfo.monthlyIncome}
                                            onChange={(e) => setFinancialInfo(prev => ({
                                                ...prev,
                                                monthlyIncome: e.target.value
                                            }))}
                                        />
                                    </FormField>

                                    <FormField label="سابقه کاری (سال)" required>
                                        <Input
                                            type="text"
                                            placeholder="مثال: 3"
                                            value={financialInfo.workExperience}
                                            onChange={(e) => setFinancialInfo(prev => ({
                                                ...prev,
                                                workExperience: e.target.value
                                            }))}
                                        />
                                    </FormField>

                                    <FormField label="مبلغ درخواستی (ریال)" required>
                                        <Input
                                            type="text"
                                            placeholder="مثال: 100000000"
                                            value={financialInfo.requestedAmount}
                                            onChange={(e) => setFinancialInfo(prev => ({
                                                ...prev,
                                                requestedAmount: e.target.value
                                            }))}
                                        />
                                    </FormField>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" className="flex items-center gap-2">
                                        مرحله بعد
                                        <ArrowLeftIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* مرحله 2: مدارک شناسایی */}
                {step === 2 && (
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <IdentificationIcon className="w-6 h-6 text-blue-600" />
                                مدارک شناسایی
                            </CardTitle>
                            <CardDescription>
                                لطفاً مدارک شناسایی خود را بارگذاری کنید
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <FormField
                                    label="تصویر جلوی کارت ملی"
                                    required
                                    description="فرمت‌های مجاز: JPG, PNG, PDF"
                                >
                                    <SimpleFileUpload
                                        files={identityFiles.nationalCardFront}
                                        onFileSelect={(files) => handleFileSelect('nationalCardFront', files, 2)}
                                        onRemoveFile={(index) => handleRemoveFile('nationalCardFront', index, 2)}
                                        label="کارت ملی (جلو) را اینجا بکشید"
                                    />
                                </FormField>

                                <FormField
                                    label="تصویر پشت کارت ملی"
                                    required
                                    description="فرمت‌های مجاز: JPG, PNG, PDF"
                                >
                                    <SimpleFileUpload
                                        files={identityFiles.nationalCardBack}
                                        onFileSelect={(files) => handleFileSelect('nationalCardBack', files, 2)}
                                        onRemoveFile={(index) => handleRemoveFile('nationalCardBack', index, 2)}
                                        label="کارت ملی (پشت) را اینجا بکشید"
                                    />
                                </FormField>

                                <FormField
                                    label="تصویر شناسنامه"
                                    required
                                    description="فرمت‌های مجاز: JPG, PNG, PDF"
                                >
                                    <SimpleFileUpload
                                        files={identityFiles.birthCertificate}
                                        onFileSelect={(files) => handleFileSelect('birthCertificate', files, 2)}
                                        onRemoveFile={(index) => handleRemoveFile('birthCertificate', index, 2)}
                                        label="شناسنامه را اینجا بکشید"
                                    />
                                </FormField>

                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowRightIcon className="w-4 h-4" />
                                        مرحله قبل
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setStep(3)}
                                            className="text-xs"
                                        >
                                            رد کردن (تست)
                                        </Button>
                                        <Button
                                            onClick={handleStep2Submit}
                                            className="flex items-center gap-2"
                                        >
                                            مرحله بعد
                                            <ArrowLeftIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* مرحله 3: مدارک شغلی */}
                {step === 3 && (
                    <Card padding="lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                                مدارک شغلی
                            </CardTitle>
                            <CardDescription>
                                لطفاً مدارک مربوط به شغل خود را بارگذاری کنید
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                <FormField
                                    label="فیش‌های حقوقی"
                                    required
                                    description="حداقل یک فیش حقوقی"
                                >
                                    <SimpleFileUpload
                                        files={jobFiles.salarySlips}
                                        onFileSelect={(files) => handleFileSelect('salarySlips', files, 3)}
                                        onRemoveFile={(index) => handleRemoveFile('salarySlips', index, 3)}
                                        label="فیش‌های حقوقی را اینجا بکشید"
                                        multiple
                                    />
                                </FormField>

                                <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep(2)}
                                        className="flex items-center gap-2"
                                    >
                                        <ArrowRightIcon className="w-4 h-4" />
                                        مرحله قبل
                                    </Button>
                                    <Button
                                        onClick={handleFinalSubmit}
                                        className="flex items-center gap-2"
                                        disabled={loading}
                                    >
                                        {loading ? 'در حال پردازش...' : 'تأیید نهایی'}
                                        <CheckCircleIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* مرحله 4: نتیجه */}
                {step === 4 && (
                    <Card padding="lg">
                        <CardContent className="text-center">
                            {assessmentResult === 'approved' ? (
                                <div className="space-y-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                        <CheckCircleIcon className="w-8 h-8 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-green-600 text-2xl mb-2">
                                            درخواست شما تأیید شد!
                                        </CardTitle>
                                        <CardDescription className="text-lg">
                                            مبلغ تأیید شده: <span className="font-bold text-green-600">
                                                {formatCurrency(creditLimit)}
                                            </span>
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => router.push('/dashboard')}
                                        className="mx-auto"
                                    >
                                        بازگشت به داشبورد
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                        <ExclamationTriangleIcon className="w-8 h-8 text-red-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-red-600 text-2xl mb-2">
                                            درخواست شما رد شد
                                        </CardTitle>
                                        <CardDescription>
                                            متأسفانه شرایط لازم برای تأیید وام فراهم نیست
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push('/dashboard')}
                                        className="mx-auto"
                                    >
                                        بازگشت به داشبورد
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
