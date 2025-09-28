"use client";

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/forms';
import { Button } from '@/components/ui/core/Button';
import { Box } from '../ui';
import { Controller, useForm } from 'react-hook-form';



export default function PasswordStep({ setPassword, setPasswordSet }:
    {
        setPassword: (value: string) => void,
        setPasswordSet: (value: boolean) => void
    }) {
    const {
        control,
        getValues,
        formState: { errors },
        handleSubmit,
        reset
    } = useForm({
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    })
    const onSubmit = (data: { password: string, confirmPassword: string }) => {
        setPassword(data.password);
        setPasswordSet(true);
    }
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <div className="space-y-6">
                <Box className="bg-gray-100  rounded-xl p-4">
                    <ul className="text-sm text-error-800 space-y-1 text-center">
                        <li className='text-bold text-lg text-red-500'>در نگهداری رمز عبور خود دقت کنید </li>
                        <li>رمز عبور باید حداقل 8 کاراکتر باشد</li>
                        <li>رمز عبور باید شامل حداقل یک حرف بزرگ، یک حرف کوچک، یک عدد و یک کاراکتر ویژه باشد</li>

                    </ul>
                </Box>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                        name="password"
                        control={control}
                        rules={{
                            required: 'رمز عبور الزامی است',
                            minLength: { value: 8, message: 'رمز عبور باید حداقل 8 کاراکتر باشد' },
                            pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, message: 'رمز عبور باید شامل حداقل یک حرف بزرگ، یک حرف کوچک، یک عدد و یک کاراکتر ویژه باشد' }
                        }}
                        render={({ field }) => (
                            <div className="relative">
                                <Input {...field} type={showPassword ? 'text' : 'password'} required label="رمز عبور" placeholder="رمز عبور را وارد کنید" error={!!errors.password} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute top-5/12 translate-y-5/12 left-1 flex items-center px-2 text-gray-600"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    />

                    <Controller
                        name="confirmPassword"
                        control={control}
                        rules={{
                            required: 'تکرار رمز عبور الزامی است',
                            validate: (value) => value === getValues('password') || 'رمز عبور و تایید آن باید یکسان نمی‌باشد',
                        }}
                        render={({ field }) => (
                            <div className="relative">
                                <Input {...field} type={showPassword ? 'text' : 'password'} required label="تایید رمز عبور" placeholder="تکرار رمز عبور" error={!!errors.confirmPassword} />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute top-5/12 translate-y-5/12 left-1 flex items-center px-2 text-gray-600"
                                    aria-label={showPassword ? 'Hide confirm password' : 'Show confirm password'}
                                >
                                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    />

                    <div className="flex gap-2 mt-4">
                        <Button onClick={() => reset({ password: '', confirmPassword: '' })} variant="ghost" className="w-40">بازنشانی</Button>
                        <Button type="submit" variant="primary" className="w-full">تعیین رمز عبور</Button>
                    </div>
                </form>
            </div>

        </>
    );
}
