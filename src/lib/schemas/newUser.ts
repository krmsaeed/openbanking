import { z } from "zod";

export const newUserSchema = z.object({
    firstName: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    lastName: z.string().min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
    nationalCode: z.string().length(10, "کد ملی باید ۱۰ رقم باشد").regex(/^\d+$/, "کد ملی باید فقط شامل عدد باشد"),
    mobile: z.string().regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد"),
    email: z.string().email("ایمیل معتبر نیست").optional().or(z.literal("")),
    birthDate: z.string().optional(),
});

export type NewUserFormData = z.infer<typeof newUserSchema>;
