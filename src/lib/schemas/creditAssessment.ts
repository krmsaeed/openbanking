import { z } from 'zod';

// Financial information schemas
export const financialInfoSchema = z.object({
    monthlyIncome: z
        .string({ message: 'درآمد ماهانه ضروری است' })
        .min(1, 'درآمد ماهانه ضروری است')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'درآمد باید عدد مثبت باشد'),
    otherIncome: z.string().optional(),
    monthlyExpenses: z.string().optional(),
    workExperience: z
        .string({ message: 'سابقه کاری ضروری است' })
        .min(1, 'سابقه کاری ضروری است')
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'سابقه کاری باید عدد باشد'),
    jobTitle: z.string().optional(),
    companyName: z.string().optional(),
    workAddress: z.string().optional(),
    requestedAmount: z
        .string({ message: 'مبلغ درخواستی ضروری است' })
        .min(1, 'مبلغ درخواستی ضروری است')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'مبلغ باید عدد مثبت باشد'),
    loanPurpose: z.string().optional(),
});

// Document upload schemas
export const identityFilesSchema = z.object({
    nationalCardFront: z.array(z.instanceof(File)).min(1, 'تصویر جلوی کارت ملی ضروری است'),
    nationalCardBack: z.array(z.instanceof(File)).min(1, 'تصویر پشت کارت ملی ضروری است'),
    birthCertificate: z.array(z.instanceof(File)).min(1, 'تصویر شناسنامه ضروری است'),
});

export const jobFilesSchema = z.object({
    salarySlips: z.array(z.instanceof(File)).min(1, 'حداقل یک فیش حقوقی ضروری است'),
});

// Complete credit assessment schema
export const creditAssessmentSchema = financialInfoSchema
    .merge(identityFilesSchema)
    .merge(jobFilesSchema);

// Type exports
export type FinancialInfoFormData = z.infer<typeof financialInfoSchema>;
export type IdentityFilesFormData = z.infer<typeof identityFilesSchema>;
export type JobFilesFormData = z.infer<typeof jobFilesSchema>;
export type CreditAssessmentFormData = z.infer<typeof creditAssessmentSchema>;
