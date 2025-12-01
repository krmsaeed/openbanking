import { z } from 'zod';

export const firstNameSchema = z
    .string({ message: 'نام اجباری است' })
    .min(2, 'نام باید حداقل ۲ حرف باشد')
    .regex(/^[\u0600-\u06FF\s]+$/, 'نام باید فقط شامل حروف فارسی باشد');

export const lastNameSchema = z
    .string({ message: 'نام خانوادگی اجباری است' })
    .min(2, 'نام خانوادگی باید حداقل ۲ حرف باشد')
    .regex(/^[\u0600-\u06FF\s]+$/, 'نام خانوادگی باید فقط شامل حروف فارسی باشد');

export const nationalCodeSchema = z
    .string({ message: 'کد ملی اجباری است' })
    .length(10, 'کد ملی باید ۱۰ رقم باشد')
    .regex(/^\d+$/, 'کد ملی باید فقط شامل اعداد باشد');

export const phoneNumberSchema = z
    .string({ message: 'شماره موبایل اجباری است' })
    .length(11, 'شماره موبایل باید ۱۱ رقم باشد')
    .regex(/^09\d{9}$/, 'شماره موبایل باید با ۰۹ شروع شود');

export const emailSchema = z.string().email('ایمیل معتبر نیست').optional().or(z.literal(''));

export const birthDateSchema = z
    .string({ message: 'تاریخ تولد اجباری است' })
    .min(1, 'تاریخ تولد الزامی است')
    .regex(/^\d{4}\/\d{2}\/\d{2}$/, 'فرمت تاریخ تولد نامعتبر است');

export const postalCodeSchema = z
    .string({ message: 'کد پستی اجباری است' })
    .length(10, 'کد پستی باید ۱۰ رقم باشد')
    .regex(/^\d+$/, 'کد پستی باید فقط شامل اعداد باشد');

export const passwordSchema = z
    .string({ message: 'رمز عبور اجباری است' })
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید شامل حداقل یک حرف بزرگ باشد')
    .regex(/[a-z]/, 'رمز عبور باید شامل حداقل یک حرف کوچک باشد')
    .regex(/[0-9]/, 'رمز عبور باید شامل حداقل یک عدد باشد')
    .regex(/[^A-Za-z0-9]/, 'رمز عبور باید شامل حداقل یک کاراکتر خاص باشد');

export const otpSchema = z
    .string({ message: 'کد تایید اجباری است' })
    .length(5, 'کد تایید باید ۵ رقم باشد')
    .regex(/^\d+$/, 'کد تایید باید فقط شامل اعداد باشد');

export const englishFirstNameSchema = z
    .string({ message: 'نام لاتین الزامی است' })
    .min(4, 'نام لاتین باید حداقل ۴ کاراکتر باشد')
    .regex(/^[a-zA-Z ]+$/, 'نام لاتین باید شامل حروف انگلیسی باشد');

export const englishLastNameSchema = z
    .string({ message: 'نام خانوادگی لاتین الزامی است' })
    .length(8, 'رمز عبور باید دقیقاً ۸ رقم باشد')
    .regex(/^[0-9]+$/, 'رمز عبور باید فقط شامل عدد باشد');

export const simplePasswordSchema = z
    .string({ message: 'رمز عبور الزامی است' })
    .length(8, 'رمز عبور باید دقیقاً ۸ رقم باشد')
    .regex(/^[0-9]+$/, 'رمز عبور باید فقط شامل عدد باشد');

export const basicPersonalInfoSchema = z.object({
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    nationalCode: nationalCodeSchema,
    phoneNumber: phoneNumberSchema,
    email: emailSchema,
});

export const detailedPersonalInfoSchema = basicPersonalInfoSchema.extend({
    birthDate: birthDateSchema,
    postalCode: postalCodeSchema,
});

export const passwordWithConfirmSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string({ message: 'تایید رمز عبور اجباری است' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'رمز عبور و تایید آن باید یکسان باشند',
        path: ['confirmPassword'],
    });

export const otpFormSchema = z.object({
    otp: otpSchema,
});

export const personalInfoStepSchema = z.object({
    phoneNumber: phoneNumberSchema,
    postalCode: postalCodeSchema,
});

export const passwordStepSchema = z
    .object({
        ENFirstName: englishFirstNameSchema,
        ENLastName: englishLastNameSchema,
        password: simplePasswordSchema,
        confirmPassword: z.string({ message: 'تکرار رمز عبور الزامی است' }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'رمز عبور و تایید آن باید یکسان باشد',
        path: ['confirmPassword'],
    });

export const certificateOtpSchema = z.object({
    certOtp: z.string().min(1, 'کد تایید اجباری است'),
});

export type BasicPersonalInfo = z.infer<typeof basicPersonalInfoSchema>;
export type DetailedPersonalInfo = z.infer<typeof detailedPersonalInfoSchema>;
export type PasswordWithConfirm = z.infer<typeof passwordWithConfirmSchema>;
export type OtpForm = z.infer<typeof otpFormSchema>;
export type PersonalInfoStepForm = z.infer<typeof personalInfoStepSchema>;
export type PasswordStepForm = z.infer<typeof passwordStepSchema>;
export type CertificateOtpForm = z.infer<typeof certificateOtpSchema>;
