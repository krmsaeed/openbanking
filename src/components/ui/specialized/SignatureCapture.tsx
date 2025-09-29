"use client";

import React, { useState, useRef, useEffect } from "react";
import { TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "../core/Button";
import { Card, CardContent } from "../core/Card";
import { Box, Typography } from "../core";

interface SignatureCaptureProps {
    onComplete: (signatureFile: File) => void;
    onCancel: () => void;
    onStepChange?: (step: number) => void;
}

export function SignatureCapture({ onComplete, onCancel, onStepChange }: SignatureCaptureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(2, 2);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 3;
        }
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        setIsDrawing(true);
        setHasSignature(true);

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const x = clientX - rect.left;
        const y = clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);
        setHasSignature(false);
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasSignature) return;

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });
                onComplete(file);
                try {
                    if (typeof onStepChange === 'function') {

                        onStepChange(6);
                    }
                } catch (e) {
                    console.error('onStepChange callback failed', e);
                }
            }
        }, 'image/png');
    };

    return (
        <Card padding="sm">


            <CardContent>
                <Box className="space-y-4">
                    <Box className="border-2 border-dashed border-gray-300 rounded-lg p-1 bg-gray-50 w-80 h-96">
                        <canvas
                            ref={canvasRef}
                            className="w-full  h-full bg-gray-50 border border-gray-200 rounded cursor-crosshair touch-none"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            height={568}
                        />
                    </Box>

                    <Box className="bg-gray-100  rounded-lg p-3">
                        <Typography variant="caption" className="text-gray-800 text-center block font-bold">
                            امضای خود را با ماوس یا انگشت در کادر بالا بکشید
                        </Typography>
                    </Box>
                    <Box className=" w-full">
                        <Button
                            variant="secondary"
                            onClick={clearSignature}
                            disabled={!hasSignature}
                            className="flex items-center gap-2 mx-auto"
                        >
                            <TrashIcon className="w-4 h-4" />
                            پاک کردن
                        </Button>
                    </Box>
                    <Box className="flex justify-between items-center gap-4">

                        <Box className="w-full flex gap-2 items-center">
                            <Button
                                onClick={onCancel}
                                variant="destructive"
                                className="w-full flex justify-center gapo-3 px-5 py-3 items-center text-white"
                            >
                                <XMarkIcon className="w-5 h-5 text-white" />
                                بازگشت
                            </Button>
                            <Button
                                variant="primary"
                                onClick={saveSignature}
                                disabled={!hasSignature}
                                className="  text-white gap-3 px-5 py-3 flex items-center justify-center  w-full bg-primary-600 hover:bg-primary-700"
                            >
                                <CheckIcon className="h-5 w-5" />
                                <Typography variant="body1" className="text-white text-xs font-medium">
                                    تایید
                                </Typography>
                            </Button>

                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
