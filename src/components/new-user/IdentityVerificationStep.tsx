"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { Button, Card, CardContent } from "@/components/ui";
import { IdentityVerification } from "@/components/ui/specialized/IdentityVerification";
import { type NewUserFormData } from "@/lib/schemas/newUser";

interface IdentityVerificationStepProps {
    userInfo: NewUserFormData;
    onBack: () => void;
    onComplete: (selfie: File | null, video: File | null) => void;
}

export function IdentityVerificationStep({ userInfo, onBack, onComplete }: IdentityVerificationStepProps) {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={onBack}
                    className="mb-4"
                >
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                    بازگشت به اطلاعات پایه
                </Button>

                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">احراز هویت</h1>
                    <p className="text-gray-600">
                        برای تأیید هویت خود، لطفاً مراحل زیر را تکمیل کنید
                    </p>
                </div>

                <Card padding="sm" className="mb-6">
                    <CardContent>
                        <div className="text-sm text-gray-600">
                            <p><span className="font-medium">نام:</span> {userInfo.firstName} {userInfo.lastName}</p>
                            <p><span className="font-medium">کد ملی:</span> {userInfo.nationalCode}</p>
                            <p><span className="font-medium">موبایل:</span> {userInfo.mobile}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <IdentityVerification
                onComplete={onComplete}
                onCancel={onBack}
            />
        </div>
    );
}
