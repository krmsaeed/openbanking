"use client";

import {
    UserIcon,
    PhoneIcon,
    BanknotesIcon,
    CreditCardIcon,
    IdentificationIcon,
    BriefcaseIcon,
    DocumentTextIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";

interface ProgressStepsProps {
    currentStep: number;
}

const steps = [
    { number: 1, title: "اطلاعات شخصی", icon: UserIcon },
    { number: 2, title: "اطلاعات تماس", icon: PhoneIcon },
    { number: 3, title: "اطلاعات مالی", icon: BanknotesIcon },
    { number: 4, title: "اطلاعات بانکی", icon: CreditCardIcon },
    { number: 5, title: "مدارک شناسایی", icon: IdentificationIcon },
    { number: 6, title: "مدارک شغلی", icon: BriefcaseIcon },
    { number: 7, title: "مدارک بانکی", icon: DocumentTextIcon },
    { number: 8, title: "تأیید", icon: CheckCircleIcon },
    { number: 9, title: "نتیجه", icon: CheckCircleIcon }
];

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
    return (
        <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-4 space-x-reverse overflow-x-auto pb-2">
                {steps.map((item, index) => (
                    <div key={item.number} className="flex items-center flex-shrink-0">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= item.number
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}>
                            <item.icon className="w-5 h-5" />
                        </div>
                        <span className={`mr-2 text-xs font-medium whitespace-nowrap ${currentStep >= item.number ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            {item.title}
                        </span>
                        {index < steps.length - 1 && (
                            <div className={`w-6 h-0.5 mx-3 ${currentStep > item.number ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
