'use client';

import { applyThemeColors, getTheme } from '@/lib/colorPalette';
import React, { useEffect, useState } from 'react';

const SimpleThemeToggle: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // Wait for hydration
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = stored || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme as 'light' | 'dark');

        // Apply theme immediately
        applyTheme(initialTheme as 'light' | 'dark');
    }, []);

    const applyTheme = (newTheme: 'light' | 'dark') => {
        // Set data-theme and classes
        document.documentElement.setAttribute('data-theme', newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            document.body.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.body.classList.remove('dark');
        }

        // Apply theme colors using the color palette
        const isDarkMode = newTheme === 'dark';
        const currentTheme = getTheme(isDarkMode);
        applyThemeColors(currentTheme);

        localStorage.setItem('theme', newTheme);
    };

    const toggle = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    if (!mounted) {
        return null; // Avoid hydration mismatch
    }

    return (
        <>
            <button
                onClick={toggle}
                style={{
                    position: 'fixed',
                    top: '16px',
                    right: '16px',
                    zIndex: 60,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--card-shadow)',
                }}
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
        </>
    );
};

export default SimpleThemeToggle;
