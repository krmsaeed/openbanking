'use client';

import { Box, Button, Typography } from '@/components/ui';
import { useHomeLoader } from '@/hooks/useHomeLoader';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

const HomeLoader = memo(() => {
    const router = useRouter();
    const { error, retry } = useHomeLoader();

    if (error) {
        return (
            <Box className="flex w-full max-w-lg flex-col items-center justify-center gap-6 rounded-2xl bg-red-50 p-8 shadow-lg dark:bg-red-900/20">
                <Box className="rounded-2xl bg-white p-6 shadow-md dark:bg-gray-800">
                    <Typography variant="h3" color="error">
                        خطا در اطلاعات
                    </Typography>
                    <Typography variant="body2" color="error" className="mt-2">
                        {error}
                    </Typography>
                </Box>
                <Box className="flex gap-2">
                    <Button variant="outline" onClick={() => router.push('/')} size="sm">
                        برگشت
                    </Button>
                    <Button onClick={retry} size="sm">
                        تلاش مجدد
                    </Button>
                    <Button onClick={() => router.push('/register')} size="sm">
                        رفتن به ثبت‌نام
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box className="from-primary-50 dark:from-primary-900/20 flex w-full max-w-lg flex-col items-center justify-center gap-6 rounded-2xl bg-gradient-to-br to-gray-600 p-8 shadow-lg dark:to-gray-800">
            <Box className="flex h-32 w-32 items-center justify-center">
                <Box className="animate-spin-slow">
                    <Image
                        src="/icons/EnBankNewVerticalLogo_100x100 (1).png"
                        alt="Logo"
                        width={100}
                        height={100}
                        className="w-32 p-2"
                    />
                </Box>
            </Box>

            <Box className="text-center">
                <Typography variant="h3" weight="semibold">
                    در حال بررسی اطلاعات شما...
                </Typography>
                <Typography variant="body2" color="secondary" className="mt-1">
                    لطفا چند لحظه صبر کنید
                </Typography>
            </Box>

            <Box className="flex items-center gap-2">
                <Box className="bg-primary h-3 w-3 animate-pulse rounded-full delay-75" />
                <Box className="h-3 w-3 animate-pulse rounded-full bg-indigo-500 delay-100" />
                <Box className="h-3 w-3 animate-pulse rounded-full bg-purple-500 delay-150" />
            </Box>
        </Box>
    );
});

HomeLoader.displayName = 'HomeLoader';

export default HomeLoader;
