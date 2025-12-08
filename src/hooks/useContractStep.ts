'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import httpClient from '@/lib/httpClient';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import axios from 'axios';

export function useContractStep() {
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
    const [otp, setOtp] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [timeLeft, setTimeLeft] = useState(120);
    const onResend = async (e?: React.MouseEvent): Promise<boolean> => {
        e?.preventDefault();
        e?.stopPropagation();
        setIsResending(true);
        try {
            await httpClient.post('/api/bpms/send-message', {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'SignCustomerLoanContract',
                body: {
                    accept: true,
                    tryagain: true,
                },
            });
            setTimeLeft(120);
            showDismissibleToast('کد تایید مجدد ارسال شد', 'success');
            return true;
        } catch (error) {
            const message = await resolveCatalogMessage(
                axios.isAxiosError(error) ? error.response?.data : undefined,
                'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
            );
            showDismissibleToast(message, 'error');
            return false;
        } finally {
            setIsResending(false);
        }
    };
    const handleAccept = async () => {
        if (!agreed) {
            setError('لطفا ابتدا شرایط قرارداد را مطالعه و تأیید کنید.');
            return;
        }

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
            setTimeLeft(0)
            showDismissibleToast(message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelConfirm = () => {
        clearUserData();
        router.push('/');
    };

    return {
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
        otp,
        setOtp,
        otpLoading,
        setOtpLoading,
        showPassword,
        setShowPassword,
        canResend,
        setCanResend,

        // Handlers
        handleAccept,
        onResend,
        handleCancelConfirm,
        timeLeft,
        setTimeLeft,
    };
}
