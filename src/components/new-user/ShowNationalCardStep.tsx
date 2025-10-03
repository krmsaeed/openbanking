'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { NationalCardTemplate } from '@/components/forms/NationalCardTemplate';

interface ShowNationalCardStepProps {
    firstName: string;
    lastName: string;
    nationalCode: string;
    birthDate: string;
    onConfirm: () => void;
}

export function ShowNationalCardStep({
    firstName,
    lastName,
    nationalCode,
    birthDate,
    onConfirm,
}: ShowNationalCardStepProps) {
    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle>پیش‌نمایش کارت ملی</CardTitle>
            </CardHeader>
            <CardContent>
                <NationalCardTemplate
                    firstName={firstName}
                    lastName={lastName}
                    nationalCode={nationalCode}
                    birthDate={birthDate}
                    onConfirm={onConfirm}
                />
            </CardContent>
        </Card>
    );
}
