'use client';
import { useEffect, useState } from 'react';

export default function ServiceWorkerRegistrar() {
    const [status, setStatus] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        let mounted = true;

        const register = async () => {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js');
                if (!mounted) return;
                setStatus(reg.installing ? 'installing' : reg.waiting ? 'waiting' : 'active');

                reg.addEventListener('updatefound', () => setStatus('updatefound'));
                navigator.serviceWorker.addEventListener('controllerchange', () =>
                    setStatus('controllerchange')
                );
            } catch (err) {
                console.warn('SW registration failed:', err);
                if (mounted) setStatus('error');
            }
        };

        register();

        return () => {
            mounted = false;
        };
    }, []);

    if (!status) return null;
    return (
        <div aria-hidden className="sr-only">
            Service worker: {status}
        </div>
    );
}
