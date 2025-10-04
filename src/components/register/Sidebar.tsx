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
    { title: 'ارسال کد تایید', icon: EnvelopeIcon },
    { title: 'اسکن کارت ملی', icon: DocumentMagnifyingGlassIcon },
    { title: 'تأیید نهایی', icon: CheckCircleIcon },
];

export default function Sidebar() {
    const { userData, setUserData } = useUser();
    return (
        <nav
            className="mx-auto h-full w-[90%] rounded-lg bg-gray-50 p-4 shadow-lg md:w-[13rem] dark:bg-gray-600"
            aria-label="مراحل ثبت‌نام"
        >
            <h3 className="mb-2 text-center text-lg font-semibold text-gray-800 dark:text-white">
                مراحل ثبت‌ نام
            </h3>
            <ul className="flex flex-row items-center justify-start gap-2 overflow-auto px-1 py-2 md:flex-col md:justify-start md:gap-3 md:py-0 md:pl-0">
                {STEP_META.map((item, index) => {
                    const Icon = item.icon;
                    const step = userData?.step ?? 0;
                    const current = step === index + 1;
                    const completed = step > index + 1;
                    return (
                        <li
                            key={item.title}
                            className="group relative min-w-[96px] flex-shrink-0 items-center py-2 md:flex md:w-auto md:min-w-full md:flex-shrink md:flex-row md:gap-3"
                        >
                            <Box className="flex w-full flex-col items-center md:flex-row md:items-center">
                                <Box className="relative flex items-center justify-center">
                                    <Typography
                                        variant="span"
                                        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 shadow-sm md:h-10 md:w-10 ${index < STEP_META.length - 1 && ((userData?.step ?? 0) > index + 1 ? 'md:connector md:connector-primary' : 'md:connector md:connector-gray')} ${completed && 'bg-primary scale-100 text-white'} ${current ? 'bg-primary-300 scale-105 text-gray-50' : 'border-primary-200 bg-gray text-gray-400 dark:text-gray-200'}`}
                                    >
                                        {completed ? (
                                            <CheckCircleIcon className="text-dark-100 mx-auto h-6 w-6" />
                                        ) : (
                                            <Icon className="mx-auto h-6 w-6" />
                                        )}
                                    </Typography>
                                    {index > 0 && (
                                        <span
                                            className={`S relative ${step > index ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'}`}
                                        />
                                    )}
                                </Box>

                                <Typography
                                    className={`mt-2 text-xs font-medium transition-colors duration-150 md:mt-0 md:text-sm ${current ? 'text-primary' : 'text-gray-500 dark:text-gray-300'} ${completed ? 'text-primary-500' : ''} group-hover:text-primary px-2 text-center md:text-right`}
                                    onClick={() => setUserData({ step: index + 1 })}
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
