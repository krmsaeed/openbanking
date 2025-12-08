'use client';

import { useEffect } from 'react';
import { Typography } from '@/components/ui';

interface TimerProps {
    timeLeft: number;
    setTimeLeft: React.Dispatch<React.SetStateAction<number>>;
    onTimeUp?: () => void;
}

export default function Timer({ timeLeft, setTimeLeft, onTimeUp }: TimerProps) {
    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp?.();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, setTimeLeft, onTimeUp]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Typography className="text-purple-700">{formatTime(timeLeft)}</Typography>
    );
}
