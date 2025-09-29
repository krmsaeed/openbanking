"use client";

import React, { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/core/Button";

export const ThemeToggle: React.FC = React.memo(() => {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window === "undefined") return "light";
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') return stored as "light" | "dark";
        return document.documentElement.classList.contains("dark") ? "dark" : "light";
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            document.body.classList.add("dark");
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove("dark");
            document.body.classList.remove("dark");
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);

    const toggle = React.useCallback(() => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
    }, []);

    return (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 60 }}>
            <Button onClick={toggle} variant="secondary" aria-label="تغییر تم">
                {theme === "dark" ? (
                    <SunIcon className="w-5 h-5" />
                ) : (
                    <MoonIcon className="w-5 h-5" />
                )}
            </Button>
        </div>
    );
});

ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;
