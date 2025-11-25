'use client';

import { useUser } from '@/contexts/UserContext';
import { nationalCardInfoSchema, type NationalCardInfoForm } from '@/lib/schemas/identity';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export interface Branch {
    value: number;
    label: string;
}
export interface DigitalMessageException {
    code: number;
    message: string;
    errorCode?: number;
}

interface ApiResponseData {
    body?: {
        CustomerNumber?: string;
        depositNum?: string;
    };
    data?: {
        body?: {
            CustomerNumber?: string;
            depositNum?: string;
        };
    };
    response?: {
        body?: {
            CustomerNumber?: string;
            depositNum?: string;
        };
        CustomerNumber?: string;
        depositNum?: string;
    };
    digitalMessageException?: DigitalMessageException;
    CustomerNumber?: string;
    depositNum?: string;
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

    const handleCapture = useCallback(
        (file: File, isValid: boolean = true) => {
            setCapturedFile(file);
            setOcrValid(isValid);
            if (isValid) {
                setFileError(null);
                setUserData({ ...userData, hasScannedNationalCard: true });
            }
        },
        [setUserData, userData]
    );

    const handleConfirm = useCallback(
        (file: File, isValid: boolean = true) => {
            handleCapture(file, isValid);
            if (isValid) toast.success('تصویر کارت ملی با موفقیت دریافت شد');
        },
        [handleCapture]
    );

    const handleSubmit = useCallback(async () => {
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
                const data = response.data as ApiResponseData;

                const customerNumber =
                    data?.body?.CustomerNumber ||
                    data?.CustomerNumber ||
                    data?.data?.body?.CustomerNumber ||
                    data?.response?.body?.CustomerNumber ||
                    data?.response?.CustomerNumber;

                const accountNumber =
                    data?.body?.depositNum ||
                    data?.depositNum ||
                    data?.data?.body?.depositNum ||
                    data?.response?.body?.depositNum ||
                    data?.response?.depositNum;

                setUserData({
                    ...userData,
                    customerNumber: customerNumber || '',
                    accountNumber: accountNumber || '',
                });
                setShowWelcomeModal(true);
            })
            .catch((error) => {
                const { data } = error.response;
                toast.error(data?.digitalMessageException?.message, {
                    duration: 5000,
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [capturedFile, userData, setUserData, form, fileError, ocrValid]);

    const handleWelcomeModalClose = useCallback(() => {
        setShowWelcomeModal(false);
        setUserData({ ...userData, step: 7 });
    }, [userData, setUserData]);

    return {
        form,
        isLoading,
        capturedFile,
        ocrValid,
        showWelcomeModal,
        setShowWelcomeModal,
        handleConfirm,
        handleSubmit,
        submit: useCallback(async () => {
            setFileError(null);

            if (!capturedFile) {
                setFileError('عکس کارت ملی الزامی است');
            }

            const valid = await form.trigger();
            if (!valid) return;

            if (!capturedFile) return;

            await handleSubmit();
        }, [capturedFile, form, handleSubmit, setFileError]),
        handleWelcomeModalClose,
        isFormValid: form.formState.isValid,
        errors: form.formState.errors,
        fileError,
    };
}
