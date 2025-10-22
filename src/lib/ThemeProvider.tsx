'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCookie } from './utils';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
    attribute?: string;
}

export function ThemeProvider({
    children,
    defaultTheme = 'light',
    storageKey = 'theme',
    attribute = 'data-theme',
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    const applyTheme = useCallback(
        (newTheme: 'light' | 'dark') => {
            try {
                const root = document.documentElement;
                const body = document.body;

                root.style.setProperty('--theme-transition-duration', '200ms');
                root.classList.add('theme-transition');

                if (newTheme === 'dark') {
                    root.classList.add('dark');
                    body.classList.add('dark');
                    root.setAttribute(attribute, 'dark');
                } else {
                    root.classList.remove('dark');
                    body.classList.remove('dark');
                    root.setAttribute(attribute, 'light');
                }

                setResolvedTheme(newTheme);

                setTimeout(() => {
                    root.classList.remove('theme-transition');
                    root.style.removeProperty('--theme-transition-duration');
                }, 300);
            } catch (error) {
                console.warn('Failed to apply theme:', error);
            }
        },
        [attribute]
    );

    const updateTheme = useCallback(() => {
        const resolved = theme;
        applyTheme(resolved);
    }, [theme, applyTheme]);

    const handleSetTheme = useCallback(
        (newTheme: Theme) => {
            try {
                setTheme(newTheme);
                localStorage.setItem(storageKey, newTheme);
                document.cookie = `${storageKey}=${newTheme}; path=/; max-age=31536000`;
            } catch (error) {
                console.warn('Failed to save theme:', error);
            }
        },
        [storageKey]
    );

    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey) || getCookie(storageKey);
            if (stored && ['light', 'dark'].includes(stored)) {
                setTheme(stored as Theme);
            }
        } catch (error) {
            console.warn('Failed to load theme from storage:', error);
        }
    }, [storageKey]);

    useEffect(() => {
        updateTheme();
    }, [updateTheme]);

    const value = {
        theme,
        setTheme: handleSetTheme,
        resolvedTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;
