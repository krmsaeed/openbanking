"use client";

import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/forms';
import { Button } from '@/components/ui/core/Button';
import LoadingButton from '@/components/ui/core/LoadingButton';
import { Box } from '../ui';
import { Controller, useForm } from 'react-hook-form';
import List from '../ui/list';
import ListItem from '../ui/listItem';
import axios from 'axios';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'react-hot-toast';


export default function PasswordStep({ setPassword, setPasswordSet }:
    {
        setPassword: (value: string) => void,
        setPasswordSet: (value: boolean) => void
    }) {
    const { userData, setUserData } = useUser();
    const [isLoading, setIsLoading] = useState(false);
    const {
        control,
        getValues,
        formState: { errors },
        handleSubmit,
        reset
    } = useForm({
        defaultValues: {
            ENFirstName: '',
            ENLastName: '',
            password: '',
            confirmPassword: '',
        },
    })
    const onSubmit = async (data: { ENFirstName: string, ENLastName: string, password: string, confirmPassword: string }) => {
        const { ENFirstName, ENLastName, password } = data;
        setIsLoading(true);
        axios.post("/api/bpms/kekyc-user-send-message", {
            "serviceName": "virtual-open-deposit",
            "processId": userData.processId,
            "formName": "CertificateRequest",
            body: { ENFirstName, ENLastName, password }
        }).then((response) => {
            const { data } = response.data;
            if (data.body.success) {
                setPassword(data.password);
                setPasswordSet(true);
                setUserData({ password, ENFirstName, ENLastName });
            } else {
                const errorMessage = data.body.errorMessage || 'خطایی رخ داده است. لطفا دوباره تلاش کنید.';
                toast.error(errorMessage);
            }
        }).catch(() => {
            toast.error('خطایی رخ داده است. لطفا دوباره تلاش کنید.');
        }).finally(() => {
            setIsLoading(false);
        });

    }
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <Box className="space-y-6">
                <Box className="bg-gray-100  rounded-xl p-4">
                    <List className="text-sm text-error-800 space-y-1 text-center">
                        <ListItem className='text-bold text-lg text-red-500'>در نگهداری رمز عبور خود دقت کنید </ListItem>
                        <ListItem>رمز عبور باید حداقل 8 کاراکتر باشد</ListItem>
                        <ListItem>رمز عبور باید شامل حداقل یک حرف بزرگ، یک حرف کوچک، یک عدد و یک کاراکتر ویژه باشد</ListItem>

                    </List>
                </Box>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Controller
                        name="ENFirstName"
                        control={control}
                        rules={{
                            required: ' نام  لاتین الزامی است',
                            minLength: { value: 4, message: 'نام لاتین باید حداقل 4 کاراکتر باشد' },
                            pattern: { value: /^[a-zA-Z ]+$/, message: 'نام لاتین باید شامل حروف کوچک باشد' }
                        }}
                        render={({ field }) => (
                            <Input {...field}
                                type="text"
                                label="نام  لاتین"
                                placeholder="نام  لاتین را وارد کنید"
                                required
                                fullWidth
                                className='text-left'
                                dir='ltr'
                                maxLength={200}
                                error={errors.ENFirstName?.message}
                            />
                        )}
                    />
                    <Controller
                        name="ENLastName"
                        control={control}
                        rules={{
                            required: ' نام خانوادگی لاتین الزامی است',
                            minLength: { value: 4, message: ' حداقل 4 کاراکتر باید باشد' },
                            pattern: { value: /^[a-zA-Z ]+$/, message: 'فقط شامل حروف کوچک و بزرگ لاتین باید باشد' }
                        }}
                        render={({ field }) => (
                            <Input {...field}
                                type="text"
                                label="نام خانوادگی لاتین"
                                placeholder="نام خانوادگی لاتین را وارد کنید"
                                required
                                fullWidth
                                className='text-left'
                                dir='ltr'
                                maxLength={200}
                                error={errors.ENLastName?.message}
                            />
                        )}
                    />
                    <Controller
                        name="password"
                        control={control}
                        rules={{
                            required: 'رمز عبور الزامی است',
                            minLength: { value: 8, message: 'باید حداقل 8 کاراکتر باشد' },
                            pattern: { value: /^[a-zA-Z0-9]+$/, message: ' فقط شامل حروف انگلیسی و اعداد باشد' }
                        }}
                        render={({ field }) => (
                            <Input {...field}
                                type={showPassword ? 'text' : 'password'}
                                label="رمز عبور"
                                placeholder="رمز عبور را وارد کنید"
                                required
                                fullWidth
                                className='text-left'
                                dir='ltr'
                                error={errors.password?.message}
                                startAdornment={<Box onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</Box>}
                            />
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
                            <Input {...field}
                                type={showPassword ? 'text' : 'password'}
                                required
                                fullWidth
                                className='text-left'
                                dir='ltr'
                                label="تایید رمز عبور" placeholder="تکرار رمز عبور"
                                error={errors.confirmPassword?.message}
                                startAdornment={<Box onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}</Box>}
                            />
                        )}
                    />
                    <Box className="flex gap-2 mt-4">
                        <Button onClick={() => reset({ password: '', confirmPassword: '' })} className="w-full bg-error-200" disabled={isLoading}>بازنشانی</Button>
                        <LoadingButton type="submit" loading={isLoading} disabled={isLoading} className="w-full">تعیین رمز عبور</LoadingButton>
                    </Box>
                </form>
            </Box>

        </>
    );
}
