'use client';

import { useUser } from '@/contexts/UserContext';
import { CheckIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '../ui/core';
import { Button } from '../ui/core/Button';
import LoadingButton from '../ui/core/LoadingButton';

export function SignatureStep() {
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
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

    const startDrawing = (
        e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
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

    const saveSignature = async () => {
        setIsLoading(true);
        const canvas = canvasRef.current;
        if (!canvas || !hasSignature) {
            setIsLoading(false);
            return;
        }

        canvas.toBlob(async (blob) => {
            if (blob) {
                type MaybeCrypto = { crypto?: { randomUUID?: () => string } };
                const maybe = globalThis as unknown as MaybeCrypto;
                const uuid =
                    maybe?.crypto && typeof maybe.crypto.randomUUID === 'function'
                        ? maybe.crypto.randomUUID()
                        : Date.now().toString(36);
                const filename = `signature_${uuid}.jpg`;

                const file = new File([blob], filename, { type: 'image/jpeg' });
                const body = {
                    serviceName: 'virtual-open-deposit',
                    processId: userData.processId,
                    formName: 'VideoInquiry',
                    body: {},
                };
                const data = new FormData();
                data.append('messageDTO', JSON.stringify(body));
                data.append('files', file);
                await axios
                    .post('/api/bpms/deposit-files', data)
                    .then((res) => {
                        const { data } = res;
                        if (data.body.success) {
                            setUserData({ ...userData, step: 5 });
                        }
                    })
                    .finally(() => {
                        setIsLoading(false);
                    });
            }
        }, 'image/png');
    };

    return (
        <Box className="space-y-4">
            <Box className="dark:bg-primary h-[25rem] w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-1 md:h-96">
                <canvas
                    ref={canvasRef}
                    className="bg-dark-900 h-full w-full cursor-crosshair touch-none rounded"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    height={500}
                />
            </Box>

            <Box className="flex items-center justify-between rounded-lg bg-gray-200 px-3 py-2">
                <Typography variant="caption" className="font-bold text-gray-800">
                    امضای خود را در کادر بالا بکشید
                </Typography>
                <Button
                    onClick={clearSignature}
                    disabled={!hasSignature}
                    className="bg-error-400 items-between flex gap-x-2 gap-y-4"
                >
                    <TrashIcon className="h-4 w-4" />
                    پاک کردن
                </Button>
            </Box>
            <Box className="w-full"></Box>
            <Box className="flex items-center justify-between gap-4">
                <Box className="flex w-full items-center gap-2">
                    {/* <Button
                                onClick={() => setUserData({ ...userData, step: 4 })}
                                variant="destructive"
                                className="gapo-3 flex w-full items-center justify-center px-5 py-3 text-white"
                            >
                                <XMarkIcon className="h-5 w-5 text-white" />
                                بازگشت
                            </Button> */}
                    <LoadingButton
                        onClick={saveSignature}
                        disabled={!hasSignature || isLoading}
                        loading={isLoading}
                        className="bg-primary-600 hover:bg-primary-700 flex w-full items-center justify-center gap-3 px-5 py-3 text-white"
                    >
                        {!isLoading && <CheckIcon className="h-5 w-5" />}
                        <Typography variant="body1" className="text-xs font-medium text-white">
                            {isLoading ? 'در حال ارسال...' : 'تایید'}
                        </Typography>
                    </LoadingButton>
                </Box>
            </Box>
        </Box>
    );
}
