'use client';

import { initErrorCatalog } from '@/services/errorCatalog';
import { useEffect } from 'react';

export default function ErrorCatalogInitializer() {
    useEffect(() => {
        // Initialize error catalog on app mount
        initErrorCatalog().catch((error) => {
            console.warn('Failed to initialize error catalog on mount:', error);
        });
    }, []);

    return null;
}
