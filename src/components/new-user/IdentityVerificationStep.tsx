"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardContent, Box, Typography } from "@/components/ui";
import { IdentityVerification } from "@/components/ui/specialized/IdentityVerification";
import { type NewUserFormData } from "@/lib/schemas/newUser";

interface IdentityVerificationStepProps {
    userInfo: NewUserFormData;
    onBack: () => void;
    onComplete: (selfie: File | null, video: File | null) => void;
}

export function IdentityVerificationStep({ userInfo, onBack, onComplete }: IdentityVerificationStepProps) {
    return (
        <Box className="max-w-2xl mx-auto">
            <Box className="mb-8">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="mb-4"
                >
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                    بازگشت به اطلاعات پایه
                </Button>

                <Box className="text-center mb-6">
                    <Typography variant="h1" className="mb-2 text-center">احراز هویت</Typography>
                    <Typography variant="p" className="text-center text-secondary">
                        برای تأیید هویت خود، لطفاً مراحل زیر را تکمیل کنید
                    </Typography>
                </Box>

                <Card padding="sm" className="mb-6">
                    <CardContent>
                        <Box>
                            <Typography variant="p" className="text-secondary">
                                <Typography variant="span" className="font-medium">نام:</Typography> {userInfo.firstName} {userInfo.lastName}
                            </Typography>
                            <Typography variant="p" className="text-secondary">
                                <Typography variant="span" className="font-medium">کد ملی:</Typography> {userInfo.nationalCode}
                            </Typography>
                            <Typography variant="p" className="text-secondary">
                                <Typography variant="span" className="font-medium">موبایل:</Typography> {userInfo.mobile}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            <IdentityVerification
                onComplete={onComplete}
                onCancel={onBack}
            />
        </Box>
    );
}
