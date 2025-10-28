'use client';

import HomeLoader from '@/components/HomeLoader';
import { getAccessToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
    const router = useRouter();
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        const hasToken = getAccessToken();
        if (hasToken) {
            setShowLoader(true);
        } else {
            router.replace('/login');
        }
    }, [router]);

    if (!showLoader) {
        return null;
    }

    return (
        <main className="flex min-h-screen w-full items-center justify-center">
            <HomeLoader />
        </main>
    );
}
