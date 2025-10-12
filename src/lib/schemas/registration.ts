import { z } from 'zod';
import {
    birthDateSchema,
    emailSchema,
    firstNameSchema,
    lastNameSchema,
    nationalCodeSchema,
    otpSchema,
    passwordSchema,
    phoneNumberSchema,
    postalCodeSchema,
} from './personal';

const fileSchema = z.instanceof(File).refine((file) => file instanceof File, {
    message: 'فایل اجباری است',
});

export const step1Schema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    nationalCode: nationalCodeSchema,
    phoneNumber: phoneNumberSchema,
    email: emailSchema,
});

export const step2Schema = z.object({
    birthDate: birthDateSchema,
    postalCode: postalCodeSchema,
});

export const step3Schema = z.object({
    nationalCardPhoto: fileSchema.refine((file) => file instanceof File, {
        message: 'عکس کارت ملی اجباری است',
    }),
});

export const step4Schema = z.object({
    selfiePhoto: fileSchema.refine((file) => file instanceof File, {
        message: 'عکس سلفی اجباری است',
    }),
});

export const step5Schema = z.object({
    videoFile: fileSchema.refine((file) => file instanceof File, {
        message: 'فیلم احراز هویت اجباری است',
    }),
});

export const step6Schema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string({ message: 'تایید رمز عبور اجباری است' }),
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
    digitalSignature: z.boolean({ message: 'امضای دیجیتال اجباری است' }),
});

export const registrationFormSchema = step1Schema
    .merge(step2Schema)
    .merge(step6Schema.omit({ confirmPassword: true }))
    .extend({
        nationalCardPhoto: step3Schema.shape.nationalCardPhoto,
        selfiePhoto: step4Schema.shape.selfiePhoto,
        videoFile: step5Schema.shape.videoFile,
        digitalSignature: step9Schema.shape.digitalSignature,
    });

export const mainRegistrationSchema = z.object({
    nationalCode: nationalCodeSchema,
    phoneNumber: phoneNumberSchema,
    birthDate: z.string({ message: 'تاریخ تولد الزامی است' }).min(1, 'تاریخ تولد الزامی است'),
    postalCode: postalCodeSchema,
});

export const extendedRegistrationSchema = mainRegistrationSchema
    .extend({
        password: z.string().optional(),
        confirmPassword: z.string().optional(),
        otp: z.string().optional(),
        certOtp: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        const pw = data.password;
        const cpw = data.confirmPassword;
        if ((pw !== undefined && pw !== '') || (cpw !== undefined && cpw !== '')) {
            if (!pw || pw.length < 8) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['password'],
                    message: 'رمز عبور باید حداقل ۸ کاراکتر باشد',
                });
            }
            if (pw !== cpw) {
                ctx.addIssue({
                    code: 'custom',
                    path: ['confirmPassword'],
                    message: 'رمز عبور و تایید آن باید یکسان باشند',
                });
            }
        }
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
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
export type MainRegistrationForm = z.infer<typeof mainRegistrationSchema>;
export type ExtendedRegistrationForm = z.infer<typeof extendedRegistrationSchema>;
