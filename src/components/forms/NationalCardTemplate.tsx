"use client";

import { useState } from "react";
import { Button } from "../ui/core/Button";
import { CheckIcon } from "@heroicons/react/24/outline";
import { Box, Typography } from "../ui/core";

interface NationalCardTemplateProps {
    firstName: string;
    lastName: string;
    nationalCode: string;
    birthDate: string;
    onConfirm: () => void;
}

export function NationalCardTemplate({
    firstName,
    lastName,
    nationalCode,
    birthDate,
    onConfirm
}: NationalCardTemplateProps) {
    const [confirmed, setConfirmed] = useState(false);

    const formatBirthDate = (dateString: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('/');
        return `${year}/${month}/${day}`;
    };

    const formatNationalCode = (code: string) => {
        if (code.length === 10) {
            return `${code.slice(0, 3)}-${code.slice(3, 9)}-${code.slice(9)}`;
        }
        return code;
    };

    const handleConfirm = () => {
        setConfirmed(true);
        onConfirm();
    };

    return (
        <Box className="space-y-6">
            {/* تمپلیت کارت ملی */}
            <Box className="relative rounded-2xl p-0 mx-auto max-w-sm shadow-lg overflow-hidden border border-gray-200">
                {/* Emblem watermark */}
                <svg className="absolute left-4 top-4 w-28 opacity-10 rotate-6 pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <circle cx="50" cy="50" r="48" stroke="none" fill="#0f5132" />
                    <path d="M50 18 L58 42 L82 42 L62 56 L70 80 L50 64 L30 80 L38 56 L18 42 L42 42 Z" fill="#ffffff" opacity="0.08" />
                </svg>

                {/* Subtle diagonal pattern */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.06) 1px,transparent 1px,transparent 8px)] pointer-events-none" />

                {/* Header strip */}
                <div className="relative z-10 bg-gradient-to-r from-blue-300 to-blue-200 text-white p-3 px-5">
                    <div className="flex items-center justify-center flex-col ">
                        <Typography variant="body2" className="text-xs font-bold">کارت شناسایی ملی</Typography>
                    </div>
                </div>

                {/* Card content */}
                <div className="relative z-10 bg-gradient-to-br from-emerald-50 to-white p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Typography variant="caption" className="text-xs text-emerald-700">نام</Typography>
                                    <Typography variant="subtitle1" className="font-semibold text-emerald-900">{firstName} {lastName}</Typography>
                                </div>
                                <div className="text-right">
                                    <Typography variant="caption" className="text-xs text-emerald-700">تولد</Typography>
                                    <Typography variant="body2" className="text-emerald-800">{formatBirthDate(birthDate)}</Typography>
                                </div>
                            </div>
                            <div className="mt-2">
                                <Typography variant="caption" className="text-xs text-gray-600">شماره ملی</Typography>
                                <Typography variant="h6" className="font-bold text-emerald-900">{formatNationalCode(nationalCode)}</Typography>
                            </div>

                        </div>

                        <div className="w-24 h-28 bg-white border-1 border-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <div className="w-20 h-24 bg-gray-100 rounded-sm flex items-center justify-center text-gray-400">
                                عکس
                            </div>
                        </div>
                    </div>

                    <div className="mt-2">
                        <div className="text-sm text-red-600">اطلاعات نمایش داده شده باید مطابق کارت ملی باشد.</div>
                    </div>
                </div>

                {/* Bottom microprint stripe */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-emerald-100 to-transparent opacity-90 pointer-events-none" />
            </Box>

            <Box className="text-center">
                <Box className="mb-4">
                    <label className="flex items-center justify-center gap-2 ">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Typography variant="body1" className="text-sm text-gray-700">
                            اطلاعات نمایش داده شده با کارت ملی من مطابقت دارد
                        </Typography>
                    </label>
                </Box>

                <Button
                    onClick={handleConfirm}
                    disabled={!confirmed}
                    size="sm"
                    className="w-full flex gap-2 justify-center"
                >
                    <CheckIcon className="w-6 h-6" />
                    تایید اطلاعات
                </Button>
            </Box>

            <Box className="text-center">
                <Typography variant="body1" className="text-xs text-gray-500">
                    در صورت عدم مطابقت اطلاعات، به مرحله قبل بازگردید و اطلاعات را اصلاح کنید.
                </Typography>
            </Box>
        </Box>
    );
}
