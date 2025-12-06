'use client';
import { useEffect, useState, useRef } from 'react';

export default function ServiceWorkerRegistrar() {
    const [status, setStatus] = useState<string | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [swInfo, setSwInfo] = useState<{
        scope?: string;
        active?: boolean;
        waiting?: boolean;
        installing?: boolean;
        state?: string;
        error?: string;
        clearing?: boolean;
        cleared?: boolean;
    }>({});

    // Flag to prevent modal from showing again after user clicks update
    const isUpdatingRef = useRef(false);
    const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Global flag to ensure version checking starts only once across all instances
    const versionCheckStartedRef = useRef(false);

    // Check for app updates
    const checkForAppUpdate = async () => {
        // Don't check if we're already updating
        if (isUpdatingRef.current) return;

        try {
            // Force a network fetch for version.json (cache-busting query + no-store)
            const response = await fetch(`/version.json?_ts=${Date.now()}`, { cache: 'no-store' });
            const currentVersion = await response.json();

            const cachedVersion = localStorage.getItem('app-version');
            const cachedBuild = localStorage.getItem('app-build');

            if (!cachedVersion || !cachedBuild) {
                // First time - store current version
                localStorage.setItem('app-version', currentVersion.version);
                localStorage.setItem('app-build', currentVersion.build);
                return;
            }

            if (cachedVersion !== currentVersion.version || cachedBuild !== currentVersion.build) {
                // New version available — show update modal
                setShowUpdateModal(true);
                // Update stored version after user clicks update
            }
        } catch (error) {
            console.warn('Failed to check app version:', error);
        }
    };

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        let mounted = true;

        const register = async () => {
            try {
                const reg = await navigator.serviceWorker.register('/sw.js');
                if (!mounted) return;
                setRegistration(reg);
                setStatus(reg.installing ? 'installing' : reg.waiting ? 'waiting' : 'active');

                // Update SW info
                updateSwInfo(reg);

                reg.addEventListener('updatefound', () => {
                    setStatus('updatefound');
                    updateSwInfo(reg);
                });

                if (reg.waiting) {
                    // New version waiting — can be activated on next reload
                }

                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    setStatus('controllerchange');
                    updateSwInfo(reg);
                });

                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'SW_ERROR') {
                        console.warn('SW_ERROR received:', event.data.error);
                        // Don't show modal on SW errors - only on version change
                    }
                });
            } catch (err) {
                console.warn('SW registration failed:', err);
                if (mounted) {
                    setStatus('error');
                    setSwInfo({ error: err instanceof Error ? err.message : 'Unknown error' });
                    // Don't show modal on registration error - only on version change
                }
            }
        };

        const updateSwInfo = (reg: ServiceWorkerRegistration) => {
            setSwInfo({
                scope: reg.scope,
                active: !!reg.active,
                waiting: !!reg.waiting,
                installing: !!reg.installing,
                state: reg.active?.state || 'unknown',
            });
        };

        register();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!versionCheckStartedRef.current) {
            versionCheckStartedRef.current = true;
            checkForAppUpdate();
            updateIntervalRef.current = setInterval(checkForAppUpdate, 30000); // Check every 30 seconds
        }

        return () => {
            // Don't clear interval - let it run globally once started
        };
    }, []);

    const clearCacheAndReload = async () => {
        // Set updating flag to prevent modal from re-appearing
        isUpdatingRef.current = true;

        // Update stored version FIRST so modal won't show again
        try {
            const response = await fetch(`/version.json?_ts=${Date.now()}`, { cache: 'no-store' });
            const currentVersion = await response.json();
            localStorage.setItem('app-version', currentVersion.version);
            localStorage.setItem('app-build', currentVersion.build);
        } catch {
            // Ignore version fetch errors
        }

        // Close modal after version is saved
        setShowUpdateModal(false);

        // Show clearing status
        setSwInfo((prev) => ({ ...prev, clearing: true }));

        // Clear caches directly using the Cache API
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map((name) => caches.delete(name)));
            console.log('All caches cleared successfully');
            setSwInfo((prev) => ({ ...prev, cleared: true, clearing: false }));
        } catch (error) {
            console.error('Failed to clear caches:', error);
            setSwInfo((prev) => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Unknown error',
                clearing: false,
            }));
        }

        // Unregister service worker to force fresh install
        if (registration) {
            try {
                await registration.unregister();
                console.log('Service worker unregistered');
            } catch (error) {
                console.error('Failed to unregister SW:', error);
            }
        }

        // Reload after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    };

    if (!status) return null;

    return (
        <>
            {/* Update Modal - Custom Implementation */}
            {showUpdateModal && (
                <div className="fixed inset-0 z-70 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

                    {/* Modal Content */}
                    <div className="relative z-10 mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                            بروزرسانی برنامه
                        </h2>

                        <div className="space-y-4">
                            <div className="rounded-lg border border-blue-200 bg-blue-200 p-3">
                                <p className="text-sm text-blue-800">
                                    نسخه جدیدی از برنامه آماده شده است. برای دسترسی به ویژگی‌های
                                    جدید و بهبود عملکرد، لطفاً برنامه را بروزرسانی کنید.
                                </p>
                            </div>

                            {swInfo.clearing && (
                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                    در حال پاک کردن کش...
                                </div>
                            )}

                            {swInfo.cleared && (
                                <div className="text-sm text-green-600 dark:text-green-400">
                                    کش پاک شد، صفحه ریلود می‌شود...
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={clearCacheAndReload}
                                disabled={swInfo.clearing}
                                className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-blue-700 disabled:bg-blue-400"
                            >
                                {swInfo.clearing ? 'در حال پاک کردن...' : 'بروزرسانی'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
