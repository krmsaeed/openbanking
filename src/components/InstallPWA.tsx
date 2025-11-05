'use client';
import { useEffect, useState } from 'react';
import { Button } from './ui';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPWA() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // بررسی اینکه آیا قبلاً نصب شده
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
            setIsInstallable(true);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setInstallPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;

        try {
            await installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('✅ PWA نصب شد');
            } else {
                console.log('❌ کاربر نصب را رد کرد');
            }

            setInstallPrompt(null);
            setIsInstallable(false);
        } catch (error) {
            console.error('خطا در نصب PWA:', error);
        }
    };

    // نمایش ندادن دکمه اگر نصب شده یا قابل نصب نیست
    if (isInstalled || !isInstallable) {
        return null;
    }

    return (
        <div className="fixed right-4 bottom-4 left-4 z-50 md:right-4 md:left-auto md:w-auto">
            <div className="bg-primary-600 rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">نصب اپلیکیشن</p>
                        <p className="text-primary-100 text-xs">
                            برای دسترسی سریع‌تر، اپلیکیشن را نصب کنید
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsInstallable(false)}
                            className="bg-white/10 text-white hover:bg-white/20"
                        >
                            بعداً
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={handleInstallClick}
                            className="text-primary-600 hover:bg-primary-50 bg-white"
                        >
                            نصب
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
