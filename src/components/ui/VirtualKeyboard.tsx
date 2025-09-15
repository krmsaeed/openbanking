"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Button } from "./core/Button";
import { Card } from "./core/Card";
import { Box, Typography } from "./core";
import {
    XMarkIcon,
    BackspaceIcon
} from "@heroicons/react/24/outline";

const KeyboardIcon = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
);

interface VirtualKeyboardProps {
    isVisible: boolean;
    onToggle: () => void;
    onInput: (value: string) => void;
    onBackspace: () => void;
    onCancel: () => void;
    maxLength?: number;
    currentValue?: string;
}

export function VirtualKeyboard({
    isVisible,
    onToggle,
    onInput,
    onBackspace,
    onCancel,
    maxLength = 10,
    currentValue = ""
}: VirtualKeyboardProps) {
    const [randomizedNumbers, setRandomizedNumbers] = useState<string[]>(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

    useEffect(() => {
        if (!isVisible) return;
        const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        // shuffle on client only
        for (let i = numbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
        }
        setRandomizedNumbers(numbers);
    }, [isVisible]);

    const handleNumberClick = useCallback((number: string) => {
        if (currentValue.length < maxLength) {
            onInput(number);
        }
    }, [currentValue, maxLength, onInput]);

    if (!isVisible) {
        return (
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 h-8 w-8 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
            >
                <KeyboardIcon className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Box className="relative">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 h-8 w-8 text-primary-500 hover:text-primary-700 z-10"
                tabIndex={-1}
            >
                <KeyboardIcon className="h-4 w-4" />
            </Button>

            <Box className="mt-12">
                <Card
                    className="p-4 bg-white shadow-lg border border-gray-200 w-full max-w-xs"
                    padding="none"
                >
                    <Box className="space-y-4">
                        <Box className="bg-gray-50 p-3 rounded-lg text-center font-mono text-lg tracking-wider border-2 border-dashed border-gray-300">
                            <Typography variant="body1" className="font-mono">
                                {currentValue || "---"}
                            </Typography>
                        </Box>

                        <Box className="grid grid-cols-3 gap-2">
                            {randomizedNumbers.map((number) => (
                                <Button
                                    key={number}
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleNumberClick(number)}
                                    className="h-12 text-lg font-bold hover:bg-primary-50 hover:border-primary-300"
                                    disabled={currentValue.length >= maxLength}
                                >
                                    {number}
                                </Button>
                            ))}
                        </Box>

                        <Box className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onBackspace}
                                className="h-10 text-red-600 hover:bg-red-50 hover:border-red-300"
                                disabled={!currentValue}
                            >
                                <BackspaceIcon className="h-4 w-4" />
                            </Button>



                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                className="h-10 text-gray-600 hover:bg-gray-50"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}