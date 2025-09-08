import { z } from "zod";

// Step 1: Personal Info Schema
export const personalInfoSchema = z.object({
    firstName: z.string()
        .min(2, "نام باید حداقل ۲ حرف باشد")
        .regex(/^[\u0600-\u06FF\s]+$/, "نام باید فقط شامل حروف فارسی باشد"),
    lastName: z.string()
        .min(2, "نام خانوادگی باید حداقل ۲ حرف باشد")
        .regex(/^[\u0600-\u06FF\s]+$/, "نام خانوادگی باید فقط شامل حروف فارسی باشد"),
    nationalCode: z.string()
        .length(10, "کد ملی باید ۱۰ رقم باشد")
        .regex(/^\d+$/, "کد ملی باید فقط شامل اعداد باشد"),
    phoneNumber: z.string()
        .length(11, "شماره موبایل باید ۱۱ رقم باشد")
        .regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شود"),
    email: z.string()
        .email("ایمیل نامعتبر است")
        .optional()
        .or(z.literal(""))
});

// Step 2: Birth Date & Postal Code Schema
export const birthDatePostalSchema = z.object({
    birthDate: z.string()
        .min(1, "تاریخ تولد الزامی است")
        .regex(/^\d{4}\/\d{2}\/\d{2}$/, "فرمت تاریخ تولد نامعتبر است"),
    postalCode: z.string()
        .length(10, "کد پستی باید ۱۰ رقم باشد")
        .regex(/^\d+$/, "کد پستی باید فقط شامل اعداد باشد")
});

// Step 5: Password Schema
export const passwordSchema = z.object({
    password: z.string()
        .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
        .regex(/[A-Z]/, "رمز عبور باید شامل حداقل یک حرف بزرگ باشد")
        .regex(/[a-z]/, "رمز عبور باید شامل حداقل یک حرف کوچک باشد")
        .regex(/[0-9]/, "رمز عبور باید شامل حداقل یک عدد باشد")
        .regex(/[^A-Za-z0-9]/, "رمز عبور باید شامل حداقل یک کاراکتر خاص باشد"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن باید یکسان باشند",
    path: ["confirmPassword"]
});

// Step 6 & 7: OTP Schema
export const otpSchema = z.object({
    otp: z.string()
        .length(5, "کد تایید باید ۵ رقم باشد")
        .regex(/^\d+$/, "کد تایید باید فقط شامل اعداد باشد")
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type BirthDatePostalFormData = z.infer<typeof birthDatePostalSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
