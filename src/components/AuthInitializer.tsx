'use client';

import { getAccessToken, getNationalId, initializeAuth } from '@/lib/auth';
import { setupAxiosInterceptors } from '@/lib/httpClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AuthInitializerProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

export default function AuthInitializer({ children, requireAuth = true }: AuthInitializerProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                setupAxiosInterceptors();

                const existingToken = getAccessToken();
                const existingNationalId = getNationalId();

                if (existingToken && existingNationalId) {
                    setIsInitialized(true);
                    setIsLoading(false);
                    return;
                }

                const token = searchParams.get('token');
                const code = searchParams.get('code');

                if (!token || !code) {
                    if (requireAuth) {
                        router.push('/not-eligible?error=missing_params');
                        return;
                    } else {
                        setIsInitialized(true);
                        setIsLoading(false);
                        return;
                    }
                }

                const { isValidNationalId, cleanNationalId } = await import(
                    '@/components/NationalIdValidator'
                );
                const cleanedNationalId = cleanNationalId(code);

                if (!isValidNationalId(cleanedNationalId)) {
                    if (requireAuth) {
                        router.push('/not-eligible?error=invalid_national_id');
                        return;
                    } else {
                        setIsInitialized(true);
                        setIsLoading(false);
                        return;
                    }
                }

                initializeAuth({ token, nationalId: cleanedNationalId });
                setIsInitialized(true);

                const url = new URL(window.location.href);
                url.searchParams.delete('token');

                window.history.replaceState({}, '', url.toString());
            } catch (error) {
                console.error('Auth initialization error:', error);
                if (requireAuth) {
                    router.push('/not-eligible?error=initialization_failed');
                } else {
                    setIsInitialized(true);
                }
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, [searchParams, router, requireAuth]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                    <p className="text-gray-600">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    if (requireAuth && !isInitialized) {
        return null;
    }

    return <>{children}</>;
}
