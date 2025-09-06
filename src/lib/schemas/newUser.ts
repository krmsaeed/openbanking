import { z } from "zod";

export const newUserSchema = z.object({
    firstName: z.string("نام اجباری است").min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    lastName: z.string("نام خانوادگی اجباری است").min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد"),
    nationalCode: z.string("کد ملی اجباری است").length(10, "کد ملی باید ۱۰ رقم باشد").regex(/^\d+$/, "کد ملی باید فقط شامل عدد باشد"),
    mobile: z.string("شماره موبایل اجباری است").regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد"),
    email: z.string("ایمیل اجباری است").email("ایمیل معتبر نیست").optional().or(z.literal("")),
    birthDate: z.string("تاریخ تولد اجباری است").optional(),
});

export type NewUserFormData = z.infer<typeof newUserSchema>;
