'use client';

import { Box } from '@/components/ui';
import { CheckIcon } from '@heroicons/react/24/outline';
import LoadingButton from '../ui/core/LoadingButton';
import NationalCardOcrScanner from '../specialized/NationalCardOcrScanner';
import { useNationalCardForm } from '@/hooks/useNationalCardForm';
import { PersonalInfoForm } from './PersonalInfoForm';
import { WelcomeModal } from './WelcomeModal';

export default function NationalCardStep() {
    const {
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
        handleWelcomeModalClose,
        isFormValid,
        errors,
    } = useNationalCardForm();

    const isSubmitDisabled = !capturedFile || !ocrValid || !isFormValid || isLoading;

    return (
        <Box className="mx-auto max-w-2xl space-y-6">
            <NationalCardOcrScanner
                onConfirm={handleConfirm}
                autoOpen={true}
                showConfirmButton={true}
            />

            <PersonalInfoForm
                control={form.control}
                errors={errors}
                provinces={provinces}
                cities={cities}
                onProvinceChange={handleProvinceChange}
            />

            <Box className="flex w-full justify-center">
                <LoadingButton
                    isLoading={isLoading}
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="bg-primary-600 hover:bg-primary-700 flex min-w-[200px] items-center justify-center gap-3 px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {!isLoading && <CheckIcon className="h-5 w-5" />}
                    <span className="text-sm font-medium">
                        {isLoading ? 'در حال ارسال...' : 'تایید'}
                    </span>
                </LoadingButton>
            </Box>

            <WelcomeModal isOpen={showWelcomeModal} onClose={handleWelcomeModalClose} />
        </Box>
    );
}
