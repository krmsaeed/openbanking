"use client";

import { useState, useRef, useEffect } from "react";
import { PencilIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import { Button } from "../core/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../core/Card";

interface SignatureCaptureProps {
    onComplete: (signatureFile: File) => void;
    onCancel: () => void;
}

export function SignatureCapture({ onComplete, onCancel }: SignatureCaptureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2; // For high DPI
        canvas.height = rect.height * 2;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(2, 2);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = '#1f2937';
            ctx.lineWidth = 2;
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
            }
        }, 'image/png');
    };

    return (
        <Card padding="lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <PencilIcon className="w-6 h-6 text-blue-600" />
                    ثبت امضای الکترونیک
                </CardTitle>
                <CardDescription>
                    لطفاً امضای خود را در کادر زیر بکشید
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="space-y-4">
                    {/* Signature Canvas */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                        <canvas
                            ref={canvasRef}
                            className="w-full h-40 bg-white border border-gray-200 rounded cursor-crosshair touch-none"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>

                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800 text-center">
                            امضای خود را با ماوس یا انگشت در کادر بالا بکشید
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="flex items-center gap-2"
                        >
                            بازگشت
                        </Button>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={clearSignature}
                                disabled={!hasSignature}
                                className="flex items-center gap-2"
                            >
                                <TrashIcon className="w-4 h-4" />
                                پاک کردن
                            </Button>

                            <Button
                                onClick={saveSignature}
                                disabled={!hasSignature}
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                            >
                                <CheckIcon className="w-4 h-4" />
                                تأیید امضا
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
