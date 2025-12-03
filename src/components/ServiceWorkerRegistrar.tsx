'use client';
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/overlay/Modal';
import { Button } from '@/components/ui';

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

    // Check for app updates
    const checkForAppUpdate = async () => {
        try {
            const response = await fetch('/version.json', { cache: 'no-cache' });
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
                // New version available
                if (process.env.NODE_ENV === 'production') {
                    setShowUpdateModal(true);
                }
                // Update stored version
                localStorage.setItem('app-version', currentVersion.version);
                localStorage.setItem('app-build', currentVersion.build);
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
                    if (process.env.NODE_ENV === 'production') {
                        setShowUpdateModal(true);
                    }
                });

                if (reg.waiting) {
                    if (process.env.NODE_ENV === 'production') {
                        setShowUpdateModal(true);
                    }
                }

                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    setStatus('controllerchange');
                    updateSwInfo(reg);
                });

                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'SW_ERROR') {
                        if (process.env.NODE_ENV === 'production') {
                            setShowUpdateModal(true);
                        }
                    }
                });
            } catch (err) {
                console.warn('SW registration failed:', err);
                if (mounted) {
                    setStatus('error');
                    setSwInfo({ error: err instanceof Error ? err.message : 'Unknown error' });
                    if (process.env.NODE_ENV === 'production') {
                        setShowUpdateModal(true);
                    }
                }
            }
        };

        const updateSwInfo = (reg: ServiceWorkerRegistration) => {
            setSwInfo({
                scope: reg.scope,
                active: !!reg.active,
                waiting: !!reg.waiting,
                installing: !!reg.installing,
                state: reg.active?.state || 'unknown'
            });
        };

        register();

        // Check for app updates periodically
        checkForAppUpdate();
        const updateInterval = setInterval(checkForAppUpdate, 30000); // Check every 30 seconds

        return () => {
            mounted = false;
            clearInterval(updateInterval);
        };
    }, []);

    const clearCacheAndReload = async () => {
        if (!registration) return;

        try {
            setSwInfo(prev => ({ ...prev, clearing: true }));

            // Send message to SW to clear caches
            const messageChannel = new MessageChannel();
            registration.active?.postMessage({ type: 'CLEAR_CACHE' }, [messageChannel.port2]);

            // Wait for response
            await new Promise((resolve, reject) => {
                messageChannel.port1.onmessage = (event) => {
                    if (event.data.success) {
                        resolve(true);
                    } else {
                        reject(new Error(event.data.error));
                    }
                };
                setTimeout(() => reject(new Error('Timeout')), 5000);
            });

            setSwInfo(prev => ({ ...prev, cleared: true }));
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Failed to clear cache:', error);
            setSwInfo(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Unknown error', clearing: false }));
            // Still reload even if clearing failed
            setTimeout(() => window.location.reload(), 2000);
        }
    };

    if (!status) return null;

    return (
        <>
            {/* Update Modal */}
            <Modal
                isOpen={showUpdateModal}
                onClose={() => setShowUpdateModal(false)}
                title="بروزرسانی برنامه"
                size="md"
                closeOnClickOutside={false}
            >
                <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                            نسخه جدیدی از برنامه آماده شده است. برای دسترسی به ویژگی‌های جدید و بهبود عملکرد، لطفاً برنامه را بروزرسانی کنید.
                        </p>
                    </div>
                    {swInfo.clearing && (
                        <div className="text-blue-600 text-sm">
                            در حال پاک کردن کش...
                        </div>
                    )}

                    {swInfo.cleared && (
                        <div className="text-green-600 text-sm">
                            کش پاک شد، صفحه ریلود می‌شود...
                        </div>
                    )}
                </div>

                <div className="flex gap-3 justify-end mt-6">
                    <Button
                        onClick={clearCacheAndReload}
                        disabled={swInfo.clearing}
                        variant="primary"
                        size="md"
                    >
                        {swInfo.clearing ? 'در حال پاک کردن...' : 'بروزرسانی'}
                    </Button>
                    <Button
                        onClick={() => setShowUpdateModal(false)}
                        variant="outline"
                        size="md"
                    >
                        بعداً
                    </Button>
                </div>
            </Modal>
        </>
    );
}
