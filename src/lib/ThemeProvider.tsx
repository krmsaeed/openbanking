'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCookie } from './utils';

type Theme = 'light' | 'dark' | 'system';

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
    defaultTheme = 'system',
    storageKey = 'theme',
    attribute = 'data-theme',
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Get system theme preference
    const getSystemTheme = useCallback((): 'light' | 'dark' => {
        if (typeof window === 'undefined') return 'light';
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }, []);

    // Apply theme to DOM
    const applyTheme = useCallback(
        (newTheme: 'light' | 'dark') => {
            try {
                const root = document.documentElement;
                const body = document.body;

                // Add transition class for smooth theme change
                root.style.setProperty('--theme-transition-duration', '300ms');
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

                // Remove transition class after animation
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

    // Update theme based on current theme value
    const updateTheme = useCallback(() => {
        const resolved = theme === 'system' ? getSystemTheme() : theme;
        applyTheme(resolved);
    }, [theme, getSystemTheme, applyTheme]);

    // Handle theme change
    const handleSetTheme = useCallback(
        (newTheme: Theme) => {
            try {
                setTheme(newTheme);
                localStorage.setItem(storageKey, newTheme);
                // Also set cookie for server-side rendering
                document.cookie = `${storageKey}=${newTheme}; path=/; max-age=31536000`;
            } catch (error) {
                console.warn('Failed to save theme:', error);
            }
        },
        [storageKey]
    );

    // Initialize theme on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(storageKey) || getCookie(storageKey);
            if (stored && ['light', 'dark', 'system'].includes(stored)) {
                setTheme(stored as Theme);
            }
        } catch (error) {
            console.warn('Failed to load theme from storage:', error);
        }
    }, [storageKey]);

    // Apply theme when theme changes
    useEffect(() => {
        updateTheme();
    }, [updateTheme]);

    // Listen for system theme changes
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => updateTheme();

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme, updateTheme]);

    const value = {
        theme,
        setTheme: handleSetTheme,
        resolvedTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;
