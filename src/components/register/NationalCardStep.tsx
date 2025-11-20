'use client';

import { Box, Label } from '@/components/ui';
import { useUser } from '@/contexts/UserContext';
import { useNationalCardForm } from '@/hooks/useNationalCardForm';
import dynamic from 'next/dynamic';
import LoadingButton from '../ui/core/LoadingButton';
import { PersonalInfoForm } from './PersonalInfoForm';
import { WelcomeModal } from './WelcomeModal';

// Dynamic import برای OCR Scanner (6MB+)
const NationalCardOcrScanner = dynamic(() => import('../specialized/NationalCardOcrScanner'), {
    loading: () => <div className="py-8 text-center">در حال بارگذاری دوربین...</div>,
    ssr: false,
});

export default function NationalCardStep() {
    const { userData } = useUser();
    const {
        form,
        isLoading,
        showWelcomeModal,
        handleConfirm,
        submit,
        setShowWelcomeModal,
        errors,
        fileError,
    } = useNationalCardForm();

    return (
        <Box className="mx-auto max-w-2xl space-y-6">
            <Label required className="mr-1 mb-2">
                اسکن کارت ملی
            </Label>
            <NationalCardOcrScanner
                onConfirm={handleConfirm}
                autoOpen={true}
                showConfirmButton={true}
                fileError={fileError}
            />

            <PersonalInfoForm control={form.control} errors={errors} />
            <Box className="flex w-full justify-center">
                <LoadingButton loading={isLoading} onClick={submit} disabled={isLoading} />
            </Box>

            <WelcomeModal
                isOpen={showWelcomeModal}
                onClose={() => setShowWelcomeModal(false)}
                customerNumber={userData.customerNumber}
                accountNumber={userData.accountNumber}
            />
        </Box>
    );
}
