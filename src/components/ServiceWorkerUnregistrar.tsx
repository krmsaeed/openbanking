"use client";
import { useEffect } from "react";

export default function ServiceWorkerUnregistrar() {
    useEffect(() => {
        if (typeof window === "undefined" || !('serviceWorker' in navigator)) return;

        const unregister = async () => {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                    console.log('Service worker unregistered');
                }
            } catch (err) {
                console.warn('SW unregistration failed:', err);
            }
        };

        unregister();
    }, []);

    return null;
}