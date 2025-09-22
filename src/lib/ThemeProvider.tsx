"use client";

import React, { useEffect } from "react";

interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    useEffect(() => {
        try {
            const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
            const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = stored || (prefersDark ? 'dark' : 'light');

            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.documentElement.setAttribute('data-theme', 'light');
            }
        } catch {
            // ignore
        }
    }, []);

    return <>{children}</>;
}

export default ThemeProvider;
