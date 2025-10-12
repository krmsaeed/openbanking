'use client';

import { Button } from '@/components/ui/core/Button';
import { getCookie, setCookie } from '@/lib/utils';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

export const ThemeToggle: React.FC = React.memo(() => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window === 'undefined') return 'light';
        const stored = getCookie('theme');
        if (stored === 'dark' || stored === 'light') return stored as 'light' | 'dark';
        return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
            setCookie('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
            document.documentElement.setAttribute('data-theme', 'light');
            setCookie('theme', 'light');
        }
    }, [theme]);

    const toggle = React.useCallback(() => {
        setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
    }, []);

    return (
        <div className="fixed top-4 right-4 z-50">
            <Button onClick={toggle} variant="secondary" aria-label="تغییر تم">
                {theme === 'dark' ? (
                    <SunIcon className="h-5 w-5" />
                ) : (
                    <MoonIcon className="h-5 w-5" />
                )}
            </Button>
        </div>
    );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
