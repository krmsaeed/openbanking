"use client";

import React, { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/core/Button";

export const ThemeToggle: React.FC = React.memo(() => {
    const [theme, setTheme] = useState<"light" | "dark">(() => {
        if (typeof window === "undefined") return "light";
        return document.documentElement.classList.contains("dark") ? "dark" : "light";
    });

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    const toggle = React.useCallback(() => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
    }, []);

    return (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 60 }}>
            <Button onClick={toggle} variant="ghost" aria-label="تغییر تم">
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
