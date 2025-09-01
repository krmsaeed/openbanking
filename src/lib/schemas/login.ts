import { z } from "zod";

export const loginSchema = z.object({
    nationalId: z.string().length(10, "کد ملی باید ۱۰ رقم باشد").regex(/^\d+$/, "کد ملی باید فقط شامل عدد باشد"),
    phoneNumber: z.string().regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد")
});

export const otpSchema = z.object({
    otp: z.string().length(5, "کد تأیید باید ۵ رقم باشد").regex(/^\d+$/, "کد تأیید باید فقط شامل عدد باشد")
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type LoginOtpFormData = z.infer<typeof otpSchema>;
