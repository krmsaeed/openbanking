'use client';

import { useUser } from '@/contexts/UserContext';
import { nationalCardInfoSchema, type NationalCardInfoForm } from '@/lib/schemas/identity';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export interface Province {
    id: number;
    name: string;
    cities?: City[];
}
export interface City {
    id: number;
    name: string;
}
export interface Branch {
    value: number;
    label: string;
}
export const gradeOptions = [
    { value: 'diploma', label: 'دیپلم' },
    { value: 'associate', label: 'کاردانی' },
    { value: 'BA', label: 'کارشناسی' },
    { value: 'MA', label: 'کارشناسی ارشد' },
    { value: 'PHD', label: 'دکترا' },
];

export const maritalStatusOptions = [
    { label: 'متاهل', value: true },
    { label: 'مجرد', value: false },
];

export const defaultBranches: Branch[] = [{ value: 102, label: 'تهران' }];

export function useNationalCardForm() {
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const [capturedFile, setCapturedFile] = useState<File | null>(null);
    const [ocrValid, setOcrValid] = useState<boolean>(false);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [trigger] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const lastTrigger = useRef<boolean | null>(null);

    const form = useForm<NationalCardInfoForm>({
        resolver: zodResolver(nationalCardInfoSchema),
        defaultValues: {
            isMarried: false,
            grade: '',
            provinceId: null,
            cityId: null,
            address: '',
            branch: null,
        },
    });

    const fetchProvinces = useCallback(async () => {
        try {
            const response = await axios.post('/api/bpms/send-message', {
                serviceName: 'province-cities',
            });
            const provincesData =
                response?.data?.body?.provinces || response?.data?.data?.body?.provinces;
            setProvinces(provincesData || []);
        } catch (error) {
            console.warn('Failed to fetch provinces', error);
            toast.error('خطا در دریافت لیست استان‌ها');
        }
    }, []);

    const handleProvinceChange = useCallback(
        (provinceId: number | null) => {
            const selectedProvince = provinces.find((p) => p.id === provinceId);
            setCities(selectedProvince?.cities || []);
            form.setValue('cityId', null);
        },
        [provinces, form]
    );

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

        try {
            const formData = new FormData();
            const body = {
                serviceName: 'virtual-open-deposit',
                processId: userData.processId,
                formName: 'GovahResult',
                body: {
                    isMarried: form.getValues('isMarried'),
                    grade: form.getValues('grade'),
                    provinceId: form.getValues('provinceId') || 1,
                    cityId: form.getValues('cityId') || 1,
                    branchId: form.getValues('branch') || 0,
                    address: form.getValues('address') || '',
                },
            };

            formData.append('messageDTO', JSON.stringify(body));
            formData.append('files', capturedFile);

            const response = await axios.post('/api/bpms/deposit-files', formData);
            const { data } = response;

            setUserData({
                ...userData,
                customerNumber: data.body.CustomerNumber,
                accountNumber: data.body.depositNum,
            });

            setShowWelcomeModal(true);
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error('خطا در ارسال اطلاعات');
        } finally {
            setIsLoading(false);
        }
    }, [capturedFile, userData, setUserData, form, fileError, ocrValid]);

    const handleWelcomeModalClose = useCallback(() => {
        setShowWelcomeModal(false);
        setUserData({ ...userData, step: 7 });
    }, [userData, setUserData]);

    useEffect(() => {
        if (lastTrigger.current === trigger) return;
        lastTrigger.current = trigger;
        fetchProvinces();
    }, [trigger, fetchProvinces]);

    return {
        form,
        isLoading,
        capturedFile,
        ocrValid,
        provinces,
        cities,
        showWelcomeModal,
        handleProvinceChange,
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
