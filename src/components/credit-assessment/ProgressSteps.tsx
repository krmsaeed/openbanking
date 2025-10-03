'use client';

import {
    UserIcon,
    PhoneIcon,
    BanknotesIcon,
    CreditCardIcon,
    IdentificationIcon,
    BriefcaseIcon,
    DocumentTextIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface ProgressStepsProps {
    currentStep: number;
}

const steps = [
    { number: 1, title: 'اطلاعات شخصی', icon: UserIcon },
    { number: 2, title: 'اطلاعات تماس', icon: PhoneIcon },
    { number: 3, title: 'اطلاعات مالی', icon: BanknotesIcon },
    { number: 4, title: 'اطلاعات بانکی', icon: CreditCardIcon },
    { number: 5, title: 'مدارک شناسایی', icon: IdentificationIcon },
    { number: 6, title: 'مدارک شغلی', icon: BriefcaseIcon },
    { number: 7, title: 'مدارک بانکی', icon: DocumentTextIcon },
    { number: 8, title: 'تأیید', icon: CheckCircleIcon },
    { number: 9, title: 'نتیجه', icon: CheckCircleIcon },
];

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
    return (
        <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-4 space-x-reverse overflow-x-auto pb-2">
                {steps.map((item, index) => (
                    <div key={item.number} className="flex flex-shrink-0 items-center">
                        <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                currentStep >= item.number
                                    ? 'bg-primary text-white'
                                    : 'bg-dark-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            <item.icon className="h-5 w-5" />
                        </div>
                        <span
                            className={`mr-2 text-xs font-medium whitespace-nowrap ${
                                currentStep >= item.number
                                    ? 'text-primary'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            {item.title}
                        </span>
                        {index < steps.length - 1 && (
                            <div
                                className={`mx-3 h-0.5 w-6 ${
                                    currentStep > item.number
                                        ? 'bg-primary'
                                        : 'bg-dark-200 dark:bg-gray-400'
                                }`}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
