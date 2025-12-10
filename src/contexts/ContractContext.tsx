'use client';
import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import httpClient from '@/lib/httpClient';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import axios from 'axios';

interface ContractContextType {
    // Agreement state
    agreed: boolean;
    setAgreed: (value: boolean) => void;

    // PDF states
    pdfUrl: string;
    setPdfUrl: (value: string) => void;
    showPreview: boolean;
    setShowPreview: (value: boolean) => void;
    signedPdfUrl: string;
    setSignedPdfUrl: (value: string) => void;
    showSignedPreview: boolean;
    setShowSignedPreview: (value: boolean) => void;
    signedPdfUrlByBank: string;
    setSignedPdfUrlByBank: (value: string) => void;
    showSignedPreviewByBank: boolean;
    setShowSignedPreviewByBank: (value: boolean) => void;

    // Loading states
    loading: boolean;
    bankSignLoading: boolean;
    setBankSignLoading: (value: boolean) => void;
    error: string | null;
    setError: (value: string | null) => void;
    isResending: boolean;
    setIsResending: (value: boolean) => void;
    // OTP & Modal states
    showModal: boolean;
    setShowModal: (value: boolean) => void;
    // otp: string;
    // setOtp: (value: string) => void;
    // otpLoading: boolean;
    // setOtpLoading: (value: boolean) => void;
    showPassword: boolean;
    setShowPassword: (value: boolean) => void;
    canResend: boolean;
    setCanResend: (value: boolean) => void;
    timeLeft: number;
    setTimeLeft: (value: number) => void;

    // Handlers
    handleAccept: () => Promise<void>;
    handleCancelConfirm: () => void;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

export function useContractStep() {
    const context = useContext(ContractContext);
    if (!context) {
        throw new Error('useContractStep must be used within ContractProvider');
    }
    return context;
}

export function ContractProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { userData, clearUserData } = useUser();

    // Agreement state
    const [agreed, setAgreed] = useState(false);

    // PDF states
    const [pdfUrl, setPdfUrl] = useState<string>('');
    const [showPreview, setShowPreview] = useState(false);
    const [signedPdfUrl, setSignedPdfUrl] = useState<string>('');
    const [showSignedPreview, setShowSignedPreview] = useState(false);
    const [signedPdfUrlByBank, setSignedPdfUrlByBank] = useState<string>('');
    const [showSignedPreviewByBank, setShowSignedPreviewByBank] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [bankSignLoading, setBankSignLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [canResend, setCanResend] = useState(false);

    // OTP & Modal states
    const [showModal, setShowModal] = useState(false);

    // const [otp, setOtp] = useState('');
    // const [otpLoading, setOtpLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [timeLeft, setTimeLeft] = useState(2);



    const handleAccept = async () => {
        setLoading(true);
        setError(null);

        try {
            await httpClient.post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'SignCustomerLoanContract',
                body: { accept: true },
            });
            setShowModal(true);
        } catch (err) {
            const errorData = axios.isAxiosError(err) ? err.response?.data : undefined;
            const message = await resolveCatalogMessage(
                errorData,
                'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
            );
            setTimeLeft(0);
            showDismissibleToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelConfirm = () => {
        clearUserData();
        router.push('/');
    };

    const value: ContractContextType = {
        // Agreement
        agreed,
        setAgreed,

        // PDFs
        pdfUrl,
        setPdfUrl,
        showPreview,
        setShowPreview,
        signedPdfUrl,
        setSignedPdfUrl,
        showSignedPreview,
        setShowSignedPreview,
        signedPdfUrlByBank,
        setSignedPdfUrlByBank,
        showSignedPreviewByBank,
        setShowSignedPreviewByBank,

        // Loading
        loading,
        bankSignLoading,
        setBankSignLoading,
        error,
        setError,
        isResending,
        setIsResending,

        // Modal & OTP
        showModal,
        setShowModal,
        // otp,
        // setOtp,
        // otpLoading,
        // setOtpLoading,
        showPassword,
        setShowPassword,
        canResend,
        setCanResend,
        timeLeft,
        setTimeLeft,

        // Handlers
        handleAccept,
        handleCancelConfirm,
    };

    return (
        <ContractContext.Provider value={value}>
            {children}
        </ContractContext.Provider>
    );
}
