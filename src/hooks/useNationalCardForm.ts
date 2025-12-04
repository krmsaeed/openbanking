'use client';

import { useUser } from '@/contexts/UserContext';
import { showDismissibleToast } from '@/components/ui/feedback/DismissibleToast';
import { nationalCardInfoSchema, type NationalCardInfoForm } from '@/lib/schemas/identity';
import { resolveCatalogMessage } from '@/services/errorCatalog';
import { OcrFields } from '@/lib/ocr';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

export interface Branch {
    value: number;
    label: string;
}
export interface DigitalMessageException {
    code: number;
    message: string;
    errorCode?: number;
}

export const defaultBranches: Branch[] = [{ value: 102, label: 'تهران' }];

export function useNationalCardForm() {
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [ocrValid, setOcrValid] = useState<boolean>(false);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const form = useForm<NationalCardInfoForm>({
        resolver: zodResolver(nationalCardInfoSchema),
        defaultValues: {
            grade: '',
            branch: null,
        },
    });

    const handleCapture = (file: File, isValid: boolean = true, fields?: OcrFields) => {
        setCapturedFile(file);
        setOcrValid(isValid);
        if (isValid) {
            setFileError(null);
            setUserData({ ...userData, hasScannedNationalCard: true });
        }
    };

    const handleConfirm = (file: File, isValid: boolean = true) => {
        handleCapture(file, isValid);
    };

    const handleSubmit = async () => {
        console.debug('handleSubmit called', {
            capturedFile,
            ocrValid,
            userData,
            fileError,
        });

        setFileError(null);

        if (!capturedFile) {
            return;
        }
        setIsLoading(true);

        const formData = new FormData();
        const body = {
            serviceName: 'virtual-open-deposit',
            processId: userData.processId,
            formName: 'GovahResult',
            body: {
                grade: form.getValues('grade'),
                branchId: form.getValues('branch') || 0,
            },
        };

        formData.append('messageDTO', JSON.stringify(body));
        formData.append('files', capturedFile);

        await axios
            .post('/api/bpms/deposit-files', formData)
            .then((response) => {
                const data = response.data;
                setUserData({ ...userData, userLoan: data.body });


                setShowWelcomeModal(true);
            })
            .catch(async (error) => {
                const message = await resolveCatalogMessage(
                    error.response?.data,
                    'عملیات با خطا مواجه شد، لطفاً دوباره تلاش کنید'
                );
                showDismissibleToast(message, 'error');
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleWelcomeModalClose = () => {
        setShowWelcomeModal(false);
        setUserData({ ...userData, step: 7 });
    };

    return {
        form,
        isLoading,
        capturedFile,
        ocrValid,
        showWelcomeModal,
        setShowWelcomeModal,
        handleConfirm,
        handleCapture,
        handleSubmit,
        submit: async () => {
            setFileError(null);

            if (!capturedFile) {
                setFileError('عکس کارت ملی الزامی است');
            }

            const valid = await form.trigger();
            if (!valid) return;

            if (!capturedFile) return;

            await handleSubmit();
        },
        handleWelcomeModalClose,
        isFormValid: form.formState.isValid,
        errors: form.formState.errors,
        fileError,
    };
}
