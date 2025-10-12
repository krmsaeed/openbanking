'use client';

import React, { useEffect } from 'react';
import { getCookie } from './utils';

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    useEffect(() => {
        try {
            const stored = typeof window !== 'undefined' ? getCookie('theme') : null;
            const prefersDark =
                typeof window !== 'undefined' &&
                window.matchMedia &&
                window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = stored || (prefersDark ? 'dark' : 'light');

            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
            }
        } catch {}
    }, []);

    return <>{children}</>;
}

export default ThemeProvider;
