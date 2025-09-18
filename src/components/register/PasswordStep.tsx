"use client";

import React from 'react';
import { Input } from '@/components/ui/forms';
import { Button } from '@/components/ui/core/Button';
import { Box } from '../ui';

interface Props {
    password: string;
    confirmPassword: string;
    onPasswordChange: (v: string) => void;
    onConfirmChange: (v: string) => void;
    trigger: (names?: string | string[]) => Promise<boolean>;
    setError: (name: string, error: { type: string; message?: string }) => void;
    resetPasswords: () => void;
    passwordSet: boolean;
    setPasswordSet: (v: boolean) => void;
    onConfirmed?: () => void;
}

export default function PasswordStep({ password, confirmPassword, onPasswordChange, onConfirmChange, trigger, setError, resetPasswords, passwordSet, setPasswordSet, onConfirmed }: Props) {
    return (
        <>
            {!passwordSet ? (
                <div className="space-y-4">
                    <Box className="bg-gray-100  rounded-xl p-4">
                        <ul className="text-sm text-error-800 space-y-1 text-center">
                            <li className='text-bold text-lg text-red-500'>در نگهداری رمز عبور خود دقت کنید </li>
                            <li>رمز عبور باید حداقل 8 کاراکتر باشد</li>
                            <li>رمز عبور و تایید آن باید یکسان باشند</li>

                        </ul>
                    </Box>
                    <Input type="password" label="رمز عبور" placeholder="حداقل 8 کاراکتر" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPasswordChange(e.target.value)} />

                    <Input type="password" label="تایید رمز عبور" placeholder="رمز عبور را دوباره وارد کنید" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onConfirmChange(e.target.value)} />

                    <div className="flex gap-2">
                        <Button onClick={resetPasswords} variant="ghost" className="w-40">بازنشانی</Button>
                        <Button onClick={async () => {
                            const ok = await trigger(['password', 'confirmPassword']);
                            if (!ok) return setError('password', { type: 'manual', message: 'لطفا خطاهای فرم را رفع کنید' });
                            setPasswordSet(true);
                            onConfirmed?.();
                        }} variant="primary" className="w-full">تعیین رمز عبور</Button>
                    </div>
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-600">رمز عبور تعیین شده است.</p>
                </div>
            )}
        </>
    );
}
