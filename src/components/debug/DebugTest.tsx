"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/core/Button";
import { Box } from "@/components/ui/core/Box";
import { Typography } from "@/components/ui/core/Typography";

/**
 * This component is for testing the debugger functionality
 */
export default function DebugTest() {
    const [count, setCount] = useState(0);
    const [message, setMessage] = useState<string | null>(null);

    // This function is good for setting breakpoints
    function incrementCounter() {
        // You can set a breakpoint on the next line
        const newCount = count + 1;
        console.log("Counter incremented to:", newCount);
        setCount(newCount);

        // This conditional is good for testing breakpoints with conditions
        if (newCount % 5 === 0) {
            setMessage(`تبریک! شما به ${newCount} رسیدید!`);
        } else {
            setMessage(null);
        }
    }

    // Effects are good for testing async debugging
    useEffect(() => {
        const timer = setTimeout(() => {
            // You can set a breakpoint here too
            console.log("Initial timer fired");
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Box className="p-8 max-w-md mx-auto">
            <Typography variant="h4" className="text-center mb-4">
                تست دیباگر VS Code
            </Typography>

            <Box className="bg-white shadow-md rounded-lg p-6 text-center">
                <Typography variant="h1" className="text-4xl mb-4">
                    {count}
                </Typography>

                <Button
                    onClick={incrementCounter}
                    className="bg-primary hover:bg-primary-700 mb-4"
                >
                    افزایش شمارنده
                </Button>

                {message && (
                    <Box className="bg-green-100 border border-green-300 text-green-700 p-3 rounded-md">
                        {message}
                    </Box>
                )}

                <Box className="mt-4 text-sm text-gray-500">
                    <p>باز کردن DevTools برای دیدن console.log ها</p>
                </Box>
            </Box>
        </Box>
    );
}
