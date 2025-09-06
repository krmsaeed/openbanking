import { z } from "zod";

export const nationalCodeSchema = z
    .string("کد ملی اجباری است")
    .length(10, "کد ملی باید ۱۰ رقم باشد")
    .regex(/^\d+$/, "کد ملی باید فقط شامل عدد باشد")
    .refine((value) => {
        if (!/^\d{10}$/.test(value)) return false;

        const digits = value.split('').map(Number);
        const checksum = digits[9];

        const invalidCodes = [
            '0000000000', '1111111111', '2222222222', '3333333333', '4444444444',
            '5555555555', '6666666666', '7777777777', '8888888888', '9999999999'
        ];

        if (invalidCodes.includes(value)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += digits[i] * (10 - i);
        }

        const remainder = sum % 11;
        const calculatedChecksum = remainder < 2 ? remainder : 11 - remainder;

        return calculatedChecksum === checksum;
    }, "کد ملی وارد شده معتبر نیست");

export const phoneNumberSchema = z
    .string("شماره موبایل اجباری است")
    .regex(/^09\d{9}$/, "شماره موبایل باید با ۰۹ شروع شده و ۱۱ رقم باشد")
    .refine((value) => {
        const validPrefixes = [
            '0901', '0902', '0903', '0905', '0990', '0991', '0992', '0993', '0994',
            '0910', '0911', '0912', '0913', '0914', '0915', '0916', '0917', '0918', '0919',
            '0920', '0921', '0922',
            '0934', '0935', '0936', '0937', '0938', '0939'
        ];

        return validPrefixes.some(prefix => value.startsWith(prefix));
    }, "شماره موبایل معتبر نیست");

export const firstNameSchema = z
    .string("نام اجباری است")
    .min(2, "نام باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام نباید بیشتر از ۵۰ کاراکتر باشد")
    .regex(/^[آ-ی\u200c\s]+$/, "نام باید فقط شامل حروف فارسی باشد");

export const lastNameSchema = z
    .string("نام خانوادگی اجباری است")
    .min(2, "نام خانوادگی باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام خانوادگی نباید بیشتر از ۵۰ کاراکتر باشد")
    .regex(/^[آ-ی\u200c\s]+$/, "نام خانوادگی باید فقط شامل حروف فارسی باشد");

export const birthDateSchema = z
    .string("تاریخ تولد اجباری است")
    .min(1, "تاریخ تولد را انتخاب کنید");

export const postalCodeSchema = z
    .string("کد پستی اجباری است")
    .length(10, "کد پستی باید ۱۰ رقم باشد")
    .regex(/^\d+$/, "کد پستی باید فقط شامل عدد باشد");

export const passwordSchema = z
    .string("رمز عبور اجباری است")
    .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
    .max(20, "رمز عبور نباید بیشتر از ۲۰ کاراکتر باشد")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "رمز عبور باید شامل حروف کوچک، بزرگ، عدد و کاراکتر خاص باشد");

export const otpSchema = z
    .string("کد تایید اجباری است")
    .length(5, "کد تایید باید ۵ رقم باشد")
    .regex(/^\d+$/, "کد تایید باید فقط شامل عدد باشد");

export type NationalCode = z.infer<typeof nationalCodeSchema>;
export type PhoneNumber = z.infer<typeof phoneNumberSchema>;
export type FirstName = z.infer<typeof firstNameSchema>;
export type LastName = z.infer<typeof lastNameSchema>;
export type BirthDate = z.infer<typeof birthDateSchema>;
export type PostalCode = z.infer<typeof postalCodeSchema>;
export type Password = z.infer<typeof passwordSchema>;
export type OTP = z.infer<typeof otpSchema>;
