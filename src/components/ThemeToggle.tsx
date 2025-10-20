'use client';

import { applyThemeColors, getTheme } from '@/lib/colorPalette';
import { getCookie, setCookie } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = getCookie('theme');
        const initialTheme = stored || 'light';
        setTheme(initialTheme as 'light' | 'dark');

        applyTheme(initialTheme as 'light' | 'dark');
    }, []);

    const applyTheme = (newTheme: 'light' | 'dark') => {
        document.documentElement.setAttribute('data-theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }

        const isDarkMode = newTheme === 'dark';
        const currentTheme = getTheme(isDarkMode);
        applyThemeColors(currentTheme);

        setCookie('theme', newTheme);
    };

    const toggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={toggle}
            className={`border-border bg-surface text-text shadow-card absolute z-60 cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out hover:scale-105 ${className || ''}`}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
            }}
            aria-label="تغییر تم"
        >
            {theme === 'dark' ? '☀️ ' : <span className="!text-gray">🌙 </span>}
        </button>
    );
};

export default ThemeToggle;
