"use client";
import React from 'react';
import {
    UserIcon,
    IdentificationIcon,
    CameraIcon,
    VideoCameraIcon,
    PencilIcon,
    CheckCircleIcon,
    DocumentMagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Typography } from '../ui';

const STEP_META = [
    { title: "اطلاعات شخصی", icon: UserIcon },
    { title: "بررسی کارت ملی", icon: IdentificationIcon },
    { title: "عکس سلفی", icon: CameraIcon },
    { title: "فیلم احراز هویت", icon: VideoCameraIcon },
    { title: "ثبت امضا", icon: PencilIcon },
    { title: "اسکن کارت ملی", icon: PencilIcon },
    { title: "ارسال کد تایید", icon: DocumentMagnifyingGlassIcon },
    { title: "تأیید نهایی", icon: CheckCircleIcon }
];

type SidebarProps = {
    step?: number;
    onSelect?: (s: number) => void;
};

export default function Sidebar({ step = 1, onSelect }: SidebarProps) {
    return (
        <nav className="bg-white rounded-lg shadow-lg   p-4 w-full max-w-xs mx-auto h-full" aria-label="مراحل ثبت‌نام">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">مراحل ثبت‌ نام</h3>
            <ul className="flex flex-row md:flex-col gap-0.5 overflow-auto">
                {STEP_META.map((item, index) => {
                    const Icon = item.icon;
                    const current = step === index + 1;
                    const completed = step > index + 1;
                    return (
                        <li key={item.title} className="flex items-center justify-center gap-3 py-2 group">
                            <div className={`flex flex-col items-center`}>
                                <span className={`
                                 w-8 h-8 flex items-center justify-center rounded-full border-2 transition-colors duration-200
                                ${index < STEP_META.length - 1 ? (step > index + 1 ? 'connector connector-primary' : 'connector connector-gray') : ''}
                                ${completed && 'bg-primary border-primary text-white'}
                                        ${current ? 'bg-white border-primary text-primary' :
                                        'bg-white border-gray-300 text-gray-400'}`
                                }
                                >
                                    {completed ? <CheckCircleIcon className="w-6 h-6 mx-auto mt-0.5" /> : <Icon className={`w-5 h-5 mx-auto mt-1 `} />}
                                </span>
                            </div>
                            <Typography
                                className={`text-right flex-1 text-sm font-medium transition-colors duration-150 ${current ? 'text-primary' : 'text-gray-400'} 
                                ${completed && 'text-primary-500'} group-hover:text-primary`}
                                onClick={() => onSelect?.(index + 1)}
                                tabIndex={0}
                                aria-current={current ? 'step' : undefined}
                                variant='body2'
                            >
                                {item.title}
                            </Typography>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
