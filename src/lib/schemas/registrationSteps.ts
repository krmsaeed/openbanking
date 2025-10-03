import { z } from 'zod';
import {
    firstNameSchema,
    lastNameSchema,
    nationalCodeSchema,
    phoneNumberSchema,
    birthDateSchema,
    postalCodeSchema,
    passwordSchema,
    otpSchema,
} from './personal';

export const step1Schema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    nationalCode: nationalCodeSchema,
    phoneNumber: phoneNumberSchema,
    email: z.string().email('ایمیل معتبر وارد کنید').optional().or(z.literal('')),
});

export const step2Schema = z.object({
    birthDate: birthDateSchema,
    postalCode: postalCodeSchema,
});

export const step3Schema = z.object({
    nationalCardPhoto: z.instanceof(File).refine((file) => file instanceof File, {
        message: 'عکس کارت ملی اجباری است',
    }),
});

export const step4Schema = z.object({
    selfiePhoto: z.instanceof(File).refine((file) => file instanceof File, {
        message: 'عکس سلفی اجباری است',
    }),
});

export const step5Schema = z.object({
    videoFile: z.instanceof(File).refine((file) => file instanceof File, {
        message: 'فیلم احراز هویت اجباری است',
    }),
});

export const step6Schema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string('تایید رمز عبور اجباری است'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'رمز عبور و تایید آن باید یکسان باشد',
        path: ['confirmPassword'],
    });

export const step7Schema = z.object({
    otp: otpSchema,
});

export const step8Schema = z.object({
    otp: otpSchema,
});

export const step9Schema = z.object({
    digitalSignature: z.boolean(),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
export type Step7Data = z.infer<typeof step7Schema>;
export type Step8Data = z.infer<typeof step8Schema>;
export type Step9Data = z.infer<typeof step9Schema>;
