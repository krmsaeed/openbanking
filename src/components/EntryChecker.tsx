'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EntryChecker() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            const params = new URLSearchParams(window.location.search);
            const nationalId = params.get('nationalId');

            if (!nationalId) return;

            const { isValidNationalId, cleanNationalId } = await import(
                '@/components/NationalIdValidator'
            );
            const cleaned = cleanNationalId(nationalId);
            if (!isValidNationalId(cleaned)) {
                return;
            }

            try {
                const res = await fetch('/api/registry-check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nationalId }),
                });

                const json = await res.json();

                if (!res.ok || !json.success) {
                    router.push('/register');
                    return;
                }

                // Directly redirect to register since banking service is removed
                router.push('/register');
            } catch (err) {
                console.error('EntryChecker error:', err);
            }
        })();
    }, [router]);

    return null;
}
