'use client';

import { Box, Typography } from '@/components/ui';
import Image from 'next/image';
import { memo } from 'react';

const HomeLoader = memo(() => {
    return (
        <Box className="flex w-full max-w-lg flex-col items-center justify-center gap-6 rounded-2xl bg-gradient-to-tr from-gray-200 to-gray-300 p-8 shadow-lg">
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
