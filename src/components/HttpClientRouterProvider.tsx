'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setHttpClientRouter } from '@/lib/httpClient';

export function HttpClientRouterProvider() {
    const router = useRouter();

    useEffect(() => {
        setHttpClientRouter(router);
    }, [router]);

    return null;
}
