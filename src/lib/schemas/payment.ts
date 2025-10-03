import { z } from 'zod';

export const cardFormSchema = z.object({
    cardNumber: z
        .string()
        .min(1, 'شماره کارت ضروری است')
        .regex(/^\d{4}[-\s]\d{4}[-\s]\d{4}[-\s]\d{4}$/, 'شماره کارت باید ۱۶ رقم باشد'),
    expiryMonth: z
        .string()
        .length(2, 'ماه باید ۲ رقم باشد')
        .regex(/^(0[1-9]|1[0-2])$/, 'ماه باید بین ۰۱ تا ۱۲ باشد'),
    expiryYear: z
        .string()
        .length(2, 'سال باید ۲ رقم باشد')
        .regex(/^\d{2}$/, 'سال انقضا معتبر نیست'),
    cvv2: z.string().regex(/^\d{3,4}$/, 'CVV2 باید ۳ یا ۴ رقم باشد'),
    captchaInput: z.string().min(1, 'کد امنیتی ضروری است'),
});

export const otpFormSchema = z.object({
    digit1: z.string().length(1, '').regex(/^\d$/, ''),
    digit2: z.string().length(1, '').regex(/^\d$/, ''),
    digit3: z.string().length(1, '').regex(/^\d$/, ''),
    digit4: z.string().length(1, '').regex(/^\d$/, ''),
    digit5: z.string().length(1, '').regex(/^\d$/, ''),
    digit6: z.string().length(1, '').regex(/^\d$/, ''),
});

export type CardFormData = z.infer<typeof cardFormSchema>;
export type PaymentOtpFormData = z.infer<typeof otpFormSchema>;
