import { z } from 'zod';

export const gradeSchema = z
    .string({ message: 'مدرک تحصیلی الزامی است' })
    .min(1, 'مدرک تحصیلی الزامی است')
    .refine((val) => ['diploma', 'associate', 'BA', 'MA', 'PHD'].includes(val), {
        message: 'مدرک تحصیلی نامعتبر است',
    });

export const addressSchema = z.string({ message: 'آدرس الزامی است' }).min(1, 'آدرس الزامی است');

export const provinceIdSchema = z
    .number({ message: 'استان الزامی است' })
    .nullable()
    .refine((val) => val !== null, { message: 'استان الزامی است' });

export const cityIdSchema = z
    .number({ message: 'انتخاب شهر الزامی است' })
    .nullable()
    .refine((val) => val !== null, { message: 'انتخاب شهر الزامی است' });

export const branchIdSchema = z
    .number({ message: 'انتخاب شعبه الزامی است' })
    .nullable()
    .refine((val) => val !== null, { message: 'انتخاب شعبه الزامی است' });

export const maritalStatusSchema = z
    .boolean({ message: 'وضعیت تاهل الزامی است' })
    .refine((val) => typeof val === 'boolean', {
        message: 'وضعیت تاهل نامعتبر است',
    });

export const nationalCardInfoSchema = z.object({
    isMarried: maritalStatusSchema,
    grade: gradeSchema,
    provinceId: provinceIdSchema,
    cityId: cityIdSchema,
    address: addressSchema,
    branch: branchIdSchema,
});

export type NationalCardInfoForm = z.infer<typeof nationalCardInfoSchema>;
