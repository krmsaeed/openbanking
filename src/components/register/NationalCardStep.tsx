'use client';

import { Box } from '@/components/ui';
import { useNationalCardForm } from '@/hooks/useNationalCardForm';
import { CheckIcon } from '@heroicons/react/24/outline';
import NationalCardOcrScanner from '../specialized/NationalCardOcrScanner';
import LoadingButton from '../ui/core/LoadingButton';
import { PersonalInfoForm } from './PersonalInfoForm';
import { WelcomeModal } from './WelcomeModal';

export default function NationalCardStep() {
    const {
        form,
        isLoading,
        provinces,
        cities,
        showWelcomeModal,
        handleProvinceChange,
        handleConfirm,
        submit,
        handleWelcomeModalClose,
        errors,
        fileError,
    } = useNationalCardForm();

    return (
        <Box className="mx-auto max-w-2xl space-y-6">
            <NationalCardOcrScanner
                onConfirm={handleConfirm}
                autoOpen={true}
                showConfirmButton={true}
                fileError={fileError}
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
                    onClick={submit}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 text-white"
                >
                    {!isLoading && <CheckIcon className="h-5 w-5" />}
                    <span className="text-sm font-medium">
                        {isLoading ? 'در حال ارسال...' : 'مرحله بعد'}
                    </span>
                </LoadingButton>
            </Box>

            <WelcomeModal isOpen={showWelcomeModal} onClose={handleWelcomeModalClose} />
        </Box>
    );
}
