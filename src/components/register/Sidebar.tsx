"use client";
import React from 'react';
import {
    UserIcon,
    CameraIcon,
    VideoCameraIcon,
    PencilIcon,
    CheckCircleIcon,
    DocumentMagnifyingGlassIcon,
    EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Typography, Box } from '../ui';

const STEP_META = [
    { title: "اطلاعات شخصی", icon: UserIcon },
    { title: "عکس سلفی", icon: CameraIcon },
    { title: "فیلم احراز هویت", icon: VideoCameraIcon },
    { title: "ثبت امضا", icon: PencilIcon },
    { title: "ارسال کد تایید", icon: EnvelopeIcon },
    { title: "اسکن کارت ملی", icon: DocumentMagnifyingGlassIcon },
    { title: "تأیید نهایی", icon: CheckCircleIcon }
];

type SidebarProps = {
    step?: number;
    onSelect?: (s: number) => void;
};

export default function Sidebar({ step = 1, onSelect }: SidebarProps) {
    return (
        <nav className="bg-white dark:bg-dark-900 rounded-lg shadow-lg p-4 w-full max-w-md mx-auto h-full" aria-label="مراحل ثبت‌نام">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 text-center">مراحل ثبت‌ نام</h3>
            <ul className="flex flex-row md:flex-col px-1 gap-2 md:gap-3 overflow-auto items-center justify-start md:justify-start md:pl-0 py-2 md:py-0">
                {STEP_META.map((item, index) => {
                    const Icon = item.icon;
                    const current = step === index + 1;
                    const completed = step > index + 1;
                    return (
                        <li key={item.title} className="relative min-w-[96px] md:min-w-full flex-shrink-0 md:flex-shrink md:flex md:flex-row items-center md:gap-3 py-2 group md:w-auto">
                            {/* Mobile fancy card: icon above label, scrollable */}
                            <Box className="flex flex-col items-center md:flex-row md:items-center w-full">
                                <Box className="relative flex items-center justify-center">
                                    <Typography variant='span' className={`
                                        w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-full border-2 transition-all duration-200 shadow-sm relative z-10
                                        ${index < STEP_META.length - 1 && (step > index + 1 ? 'md:connector md:connector-primary' : 'md:connector md:connector-gray')}
                                        ${completed && 'bg-primary-100  text-white scale-100'}
                                        ${current ? 'bg-gray-50  border-primary text-primary scale-105' : 'bg-gray-50 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'}`
                                    }>
                                        {completed ? <CheckCircleIcon className="w-6 h-6 mx-auto text-primary" /> : <Icon className="w-6 h-6 mx-auto" />}
                                    </Typography>
                                    {/* connector on mobile between items: render to the left of current item (so first item has none) */}
                                    {index > 0 && (
                                        <span className={`absolute left-[55px] md:left-0 md:rotate-90 md:-top-[10px] top-1/2 transform -translate-y-1/2  w-10 h-0.5 z-0 ${step > index ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}`} />
                                    )}
                                </Box>

                                <Typography
                                    className={`mt-2 md:mt-0 text-xs md:text-sm font-medium transition-colors duration-150 ${current ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} ${completed ? 'text-primary-500' : ''} group-hover:text-primary text-center md:text-right px-2`}
                                    onClick={() => onSelect?.(index + 1)}
                                    tabIndex={0}
                                    aria-current={current ? 'step' : undefined}
                                    variant='body2'
                                >
                                    {item.title}
                                </Typography>
                            </Box>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
