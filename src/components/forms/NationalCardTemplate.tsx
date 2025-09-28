"use client";

import { useState } from "react";
import { Box, Button, Typography } from "../ui/core";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

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
            <Box className="relative rounded-2xl p-0 mx-auto max-w-sm shadow-lg overflow-hidden border border-gray-200">
                <svg className="absolute left-4 top-4 w-28 opacity-10 rotate-6 pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <circle cx="50" cy="50" r="48" stroke="none" style={{ fill: 'var(--color-primary-700)' }} />
                    <path d="M50 18 L58 42 L82 42 L62 56 L70 80 L50 64 L30 80 L38 56 L18 42 L42 42 Z" style={{ fill: 'var(--color-white)' }} opacity={0.08} />
                </svg>

                <div className="absolute inset-0 overlay-stripes" />

                <div className="relative z-10 bg-gradient-to-r from-blue-300 to-blue-200 text-white p-3 px-5">
                    <div className="flex items-center justify-center flex-col ">
                        <Typography variant="body2" className="text-xs font-bold">کارت شناسایی ملی</Typography>
                    </div>
                </div>

                <div className="relative z-10 bg-gradient-to-br from-blue-50 to-white p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1 space-y-3">
                            <div className="flex flex-col gap-2">
                                <div className="mt-2 flex gap-2 items-center">
                                    <Typography variant="caption" className="text-xs text-emerald-700">شماره ملی:</Typography>
                                    <Typography variant="h6" className="font-bold text-xs ">{nationalCode}</Typography>
                                </div>
                                <div className="flex gap-2">
                                    <Typography variant="caption" className="text-xs text-emerald-700">تاریخ تولد:</Typography>
                                    <Typography variant="body2" className="">{formatBirthDate(birthDate)}</Typography>
                                </div>
                            </div>
                        </div>

                        <div className="w-24 h-28 bg-white border-1 border-gray-100 rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <div className="w-20 h-24 bg-gray-100 rounded-sm flex items-center justify-center text-gray-400">
                                عکس
                            </div>
                        </div>
                    </div>


                </div>

                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-emerald-100 to-transparent opacity-90 pointer-events-none" />
            </Box>

            <Box className="text-center">
                <Box className="mb-4">
                    <label className="flex items-center justify-center gap-2 ">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => {
                                const val = e.target.checked;
                                setConfirmed(val);

                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Typography variant="body1" className="text-sm text-gray-700">
                            اطلاعات نمایش داده شده با کارت ملی من مطابقت دارد
                        </Typography>
                    </label>
                </Box>


            </Box>

            <Box className="text-center">
                <Typography variant="body1" className="text-xs text-gray-500">
                    در صورت عدم مطابقت اطلاعات، به مرحله قبل بازگردید و اطلاعات را اصلاح کنید.
                </Typography>
            </Box>
            <Box className="w-full flex gap-2 items-center">
                <Button
                    onClick={onCancel}
                    variant="destructive"
                    className="w-full flex justify-center gapo-3 px-5 py-3 items-center text-white"
                >
                    <XMarkIcon className="w-5 h-5 text-white" />
                    انصراف
                </Button>
                <Button
                    variant="primary"
                    onClick={onConfirm}
                    disabled={!confirmed}
                    className="  text-white  gap-3 px-5 py-3 flex items-center justify-center  w-full bg-primary"
                >
                    <CheckIcon className="h-5 w-5" />
                    <Typography variant="body1" className="text-white text-xs font-medium">
                        تایید
                    </Typography>
                </Button>
            </Box>
        </Box>
    );
}
