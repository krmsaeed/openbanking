'use client';
import { useUser } from '@/contexts/UserContext';
import {
    CameraIcon,
    CheckCircleIcon,
    DocumentMagnifyingGlassIcon,
    EnvelopeIcon,
    PencilIcon,
    UserIcon,
    VideoCameraIcon,
} from '@heroicons/react/24/outline';
import { Box, Typography } from '../ui';

const STEP_META = [
    { title: 'اطلاعات شخصی', icon: UserIcon },
    { title: 'عکس سلفی', icon: CameraIcon },
    { title: 'فیلم احراز هویت', icon: VideoCameraIcon },
    { title: 'ثبت امضا', icon: PencilIcon },
    { title: 'تعیین رمز', icon: EnvelopeIcon },
    { title: 'مدارک تکمیلی', icon: DocumentMagnifyingGlassIcon },
    { title: 'تأیید نهایی', icon: CheckCircleIcon },
];

export default function Sidebar() {
    const { userData, setUserData } = useUser();
    return (
        <nav
            className="mx-auto w-[98%] rounded-lg bg-gray-100 px-1 pt-2 shadow-lg md:w-[18rem] md:px-4"
            aria-label="مراحل ثبت‌نام"
        >
            <Typography
                variant="h3"
                className="mb-2 hidden text-center text-lg font-semibold text-gray-800 md:block"
            >
                مراحل ثبت‌ نام
            </Typography>
            <ul className="flex flex-row items-center justify-start gap-2 overflow-auto px-1 py-2 md:flex-col md:justify-start md:gap-3 md:py-0 md:pl-0">
                {STEP_META.map((item, index) => {
                    const Icon = item.icon;
                    const step = userData?.step ?? 0;
                    const current = step === index + 1;
                    const completed = step > index + 1;
                    return (
                        <li
                            key={item.title}
                            className="group relative min-w-[5.5rem] flex-shrink-0 items-center py-2 md:flex md:w-auto md:min-w-full md:flex-shrink md:flex-row md:gap-3"
                        >
                            <Box className="flex w-full flex-col items-center md:flex-row md:items-center">
                                <Box className="relative flex items-center justify-center text-gray-900">
                                    <span
                                        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-200 md:h-10 md:w-10 ${completed
                                            ? 'bg-primary-600 border-2 border-gray-100 text-gray-100'
                                            : current
                                                ? 'bg-primary-400 text-white'
                                                : 'bg-gray-300 text-gray-700'
                                            }`}
                                    >
                                        {completed ? (
                                            <CheckCircleIcon className="mx-auto h-6 w-6 border-gray-100 text-white" />
                                        ) : (
                                            <Icon className="mx-auto h-5 w-5" />
                                        )}
                                    </span>
                                    {index > 0 && (
                                        <span
                                            className={`absolute top-1/2 left-[55px] z-0 h-0.5 w-10 -translate-y-1/2 transform md:-top-[10px] md:left-0 md:rotate-90 ${step > index
                                                ? 'bg-primary-600'
                                                : 'bg-gray-400 dark:bg-gray-600'
                                                }`}
                                        />
                                    )}
                                </Box>
                                <Typography
                                    className={`group-hover:text-primary mt-2 px-2 text-center text-xs font-medium transition-colors duration-150 md:mt-0 md:text-right md:text-sm ${completed
                                        ? 'text-primary-700 dark:text-white'
                                        : current
                                            ? 'text-secondary-600 dark:text-secondary-400'
                                            : 'text-gray-600 dark:text-gray-400'
                                        }`}
                                    // onClick={() => setUserData({ step: index + 1 })}
                                    tabIndex={0}
                                    aria-current={current ? 'step' : undefined}
                                    variant="body2"
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
