"use client";
import { useEffect, useRef, useState, useCallback } from "react";

type UseOtpTimer = {
    secondsLeft: number;
    isExpired: boolean;
    start: (duration?: number) => void;
    reset: (duration?: number) => void;
    formatTime: () => string;
};

export function useOtpTimer(initialSeconds = 120): UseOtpTimer {
    const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
    const intervalRef = useRef<number | null>(null);

    const clear = useCallback(() => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const tick = useCallback(() => {
        setSecondsLeft((s) => {
            if (s <= 1) {
                clear();
                return 0;
            }
            return s - 1;
        });
    }, [clear]);

    const start = useCallback((duration = initialSeconds) => {
        clear();
        setSecondsLeft(duration);
        intervalRef.current = window.setInterval(() => tick(), 1000);
    }, [clear, tick, initialSeconds]);

    const reset = useCallback((duration = initialSeconds) => {
        start(duration);
    }, [start, initialSeconds]);

    useEffect(() => {
        // start automatically
        start(initialSeconds);
        return () => clear();
    }, [start, initialSeconds, clear]);

    const formatTime = useCallback(() => {
        const mins = Math.floor(secondsLeft / 60);
        const secs = secondsLeft % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, [secondsLeft]);

    return {
        secondsLeft,
        isExpired: secondsLeft <= 0,
        start,
        reset,
        formatTime,
    };
}
