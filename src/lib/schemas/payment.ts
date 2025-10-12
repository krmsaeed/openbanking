import { z } from 'zod';
import { otpSchema } from './personal';
export const cardNumberSchema = z
    .string({ message: 'شماره کارت اجباری است' })
    .length(16, 'شماره کارت باید ۱۶ رقم باشد')
    .regex(/^\d+$/, 'شماره کارت باید فقط شامل اعداد باشد');

export const expiryMonthSchema = z
    .string({ message: 'ماه انقضا اجباری است' })
    .regex(/^(0[1-9]|1[0-2])$/, 'ماه انقضا باید بین ۰۱ تا ۱۲ باشد');

export const expiryYearSchema = z
    .string({ message: 'سال انقضا اجباری است' })
    .regex(/^\d{2}$/, 'سال انقضا باید ۲ رقم باشد');

export const cvv2Schema = z
    .string({ message: 'CVV2 اجباری است' })
    .length(3, 'CVV2 باید ۳ رقم باشد')
    .regex(/^\d+$/, 'CVV2 باید فقط شامل اعداد باشد');

export const amountSchema = z
    .string({ message: 'مبلغ اجباری است' })
    .min(1, 'مبلغ نمی‌تواند خالی باشد')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'مبلغ باید عدد مثبت باشد');

export const captchaInputSchema = z
    .string({ message: 'کد امنیتی اجباری است' })
    .min(1, 'کد امنیتی نمی‌تواند خالی باشد');

export const paymentFormSchema = z.object({
    cardNumber: cardNumberSchema,
    expiryMonth: expiryMonthSchema,
    expiryYear: expiryYearSchema,
    cvv2: cvv2Schema,
    amount: amountSchema,
    captchaInput: captchaInputSchema,
});

export const expiryDateSchema = z
    .string({ message: 'تاریخ انقضا اجباری است' })
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'فرمت تاریخ انقضا نامعتبر است (MM/YY)');

export const paymentOTPFormSchema = z.object({
    digit1: z.string().regex(/^\d$/, 'رقم معتبر وارد کنید').optional(),
    digit2: z.string().regex(/^\d$/, 'رقم معتبر وارد کنید').optional(),
    digit3: z.string().regex(/^\d$/, 'رقم معتبر وارد کنید').optional(),
    digit4: z.string().regex(/^\d$/, 'رقم معتبر وارد کنید').optional(),
    digit5: z.string().regex(/^\d$/, 'رقم معتبر وارد کنید').optional(),
    digit6: z.string().regex(/^\d$/, 'رقم معتبر وارد کنید').optional(),
});

export const singleOtpSchema = z.object({
    otp: otpSchema,
});

export type PaymentForm = z.infer<typeof paymentFormSchema>;
export type PaymentOTPForm = z.infer<typeof paymentOTPFormSchema>;

export const cardFormSchema = paymentFormSchema;
export type CardFormData = PaymentForm;
export type PaymentOtpFormData = PaymentOTPForm;
