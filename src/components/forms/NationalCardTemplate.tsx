'use client';

import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { Box, Button, Typography } from '../ui/core';
import LoadingButton from '../ui/core/LoadingButton';
import { Checkbox } from '../ui/forms';

interface NationalCardTemplateProps {
    firstName: string;
    lastName: string;
    nationalCode: string;
    birthDate: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}
export function NationalCardTemplate({
    nationalCode,
    birthDate,
    onConfirm,
    onCancel,
}: NationalCardTemplateProps) {
    const [confirmed, setConfirmed] = useState(false);

    const formatBirthDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('/');
        return `${year}/${month}/${day}`;
    };
    return (
        <Box className="space-y-6">
            <Box className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border border-gray-200 p-0 shadow-lg">
                <svg
                    className="pointer-events-none absolute top-4 left-4 w-28 rotate-6 opacity-10"
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="48"
                        stroke="none"
                        style={{ fill: 'var(--color-primary-700)' }}
                    />
                    <path
                        d="M50 18 L58 42 L82 42 L62 56 L70 80 L50 64 L30 80 L38 56 L18 42 L42 42 Z"
                        style={{ fill: 'var(--color-white)' }}
                        opacity={0.08}
                    />
                </svg>

                <div className="overlay-stripes absolute inset-0" />

                <div className="relative z-10 bg-gradient-to-r from-blue-300 to-blue-200 p-3 px-5 text-white">
                    <div className="flex flex-col items-center justify-center">
                        <Typography variant="body2" className="text-xs font-bold">
                            کارت شناسایی ملی
                        </Typography>
                    </div>
                </div>

                <div className="relative z-10 bg-gradient-to-br from-blue-50 to-white p-6">
                    <div className="mb-4 flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                            <div className="flex flex-col gap-2">
                                <div className="mt-2 flex items-center gap-2">
                                    <Typography
                                        variant="caption"
                                        className="text-xs text-emerald-700"
                                    >
                                        شماره ملی:
                                    </Typography>
                                    <Typography variant="h6" className="text-xs font-bold">
                                        {nationalCode}
                                    </Typography>
                                </div>
                                <div className="flex gap-2">
                                    <Typography
                                        variant="caption"
                                        className="text-xs text-emerald-700"
                                    >
                                        تاریخ تولد:
                                    </Typography>
                                    <Typography variant="body2" className="">
                                        {formatBirthDate(birthDate)}
                                    </Typography>
                                </div>
                            </div>
                        </div>

                        <div className="flex h-28 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-md border-1 border-gray-100 bg-white">
                            <div className="flex h-24 w-20 items-center justify-center rounded-sm bg-gray-100 text-gray-400">
                                عکس
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-6 bg-gradient-to-r from-emerald-100 to-transparent opacity-90" />
            </Box>

            <Box className="text-center">
                <Box className="mb-4">
                    <Checkbox
                        checked={confirmed}
                        onChange={() => setConfirmed(!confirmed)}
                        label="اطلاعات نمایش داده شده با کارت ملی من مطابقت دارد"
                        size="md"
                    />
                </Box>
            </Box>

            <Box className="text-center">
                <Typography variant="body1" className="text-xs text-gray-500">
                    در صورت عدم مطابقت اطلاعات، به مرحله قبل بازگردید و اطلاعات را اصلاح کنید.
                </Typography>
            </Box>
            <Box className="flex w-full items-center gap-2">
                <Button
                    onClick={onCancel}
                    variant="destructive"
                    className="gapo-3 flex w-full items-center justify-center px-5 py-3 text-white"
                >
                    <XMarkIcon className="h-5 w-5 text-white" />
                    انصراف
                </Button>
                <LoadingButton
                    onClick={onConfirm}
                    disabled={!confirmed}
                    className="bg-primary flex w-full items-center justify-center gap-3 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <CheckIcon className="h-5 w-5" />
                    <Typography variant="body1" className="text-xs font-medium text-white">
                        تایید
                    </Typography>
                </LoadingButton>
            </Box>
        </Box>
    );
}
