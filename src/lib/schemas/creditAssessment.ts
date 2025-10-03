import { z } from 'zod';

export const financialInfoSchema = z.object({
    monthlyIncome: z
        .string()
        .min(1, 'درآمد ماهانه ضروری است')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'درآمد باید عدد مثبت باشد'),
    otherIncome: z.string().optional(),
    monthlyExpenses: z.string().optional(),
    workExperience: z
        .string()
        .min(1, 'سابقه کاری ضروری است')
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'سابقه کاری باید عدد باشد'),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
    workAddress: z.string().optional(),
    requestedAmount: z
        .string()
        .min(1, 'مبلغ درخواستی ضروری است')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'مبلغ باید عدد مثبت باشد'),
    loanPurpose: z.string().optional(),
});

export const identityFilesSchema = z.object({
    nationalCardFront: z.array(z.instanceof(File)).min(1, 'تصویر جلوی کارت ملی ضروری است'),
    nationalCardBack: z.array(z.instanceof(File)).min(1, 'تصویر پشت کارت ملی ضروری است'),
    birthCertificate: z.array(z.instanceof(File)).min(1, 'تصویر شناسنامه ضروری است'),
});

export const jobFilesSchema = z.object({
    salarySlips: z.array(z.instanceof(File)).min(1, 'حداقل یک فیش حقوقی ضروری است'),
});

export type FinancialInfoFormData = z.infer<typeof financialInfoSchema>;
export type IdentityFilesFormData = z.infer<typeof identityFilesSchema>;
export type JobFilesFormData = z.infer<typeof jobFilesSchema>;
