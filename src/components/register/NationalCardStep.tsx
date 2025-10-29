'use client';

import { Box } from '@/components/ui';
import { useNationalCardForm } from '@/hooks/useNationalCardForm';
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
        setShowWelcomeModal,
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
                <LoadingButton loading={isLoading} onClick={submit} disabled={isLoading} />
            </Box>

            <WelcomeModal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
        </Box>
    );
}
