'use client';

import { useAuthInitialization } from '@/hooks/useAuthInitialization';
import { memo } from 'react';
import { Box, Typography } from './ui/core';

interface AuthInitializerProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

const AuthInitializer = memo<AuthInitializerProps>(({ children, requireAuth = true }) => {
    const { isInitialized, isLoading } = useAuthInitialization({ requireAuth });

    if (isLoading) {
        return (
            <Box className="flex min-h-screen items-center justify-center">
                <Box className="flex flex-col items-center gap-4">
                    <Box className="border-t-primary-600 h-8 w-8 animate-spin rounded-full border-2 border-gray-300"></Box>
                    <Typography variant="body2" color="secondary">
                        در حال بارگذاری...
                    </Typography>
                </Box>
            </Box>
        );
    }

    if (requireAuth && !isInitialized) {
        return null;
    }

    return <>{children}</>;
});

AuthInitializer.displayName = 'AuthInitializer';

export default AuthInitializer;
