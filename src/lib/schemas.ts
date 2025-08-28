import { z } from "zod";

// Schema برای اطلاعات مالی
export const financialInfoSchema = z.object({
    monthlyIncome: z.string()
        .min(1, "درآمد ماهانه الزامی است")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: "درآمد ماهانه باید عدد مثبت باشد"
        })
        .refine((val) => Number(val) >= 1000000, {
            message: "حداقل درآمد ماهانه 1,000,000 ریال باید باشد"
        }),

    workExperience: z.string()
        .min(1, "سابقه کاری الزامی است")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: "سابقه کاری باید عدد مثبت باشد"
        }),

    employmentType: z.enum(["employee", "self-employed", "retired", "unemployed"], {
        message: "نوع اشتغال الزامی است"
    }),

    requestedAmount: z.string()
        .min(1, "مبلغ درخواستی الزامی است")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: "مبلغ درخواستی باید عدد مثبت باشد"
        })
        .refine((val) => Number(val) >= 5000000, {
            message: "حداقل مبلغ قابل درخواست 5,000,000 ریال است"
        }),

    loanPurpose: z.enum(["personal", "business", "education", "home", "car", "other"], {
        message: "هدف وام الزامی است"
    }),

    hasOtherLoans: z.boolean(),

    otherLoansAmount: z.string().optional(),

    companyName: z.string().min(2, "نام شرکت حداقل 2 کاراکتر باشد").optional(),

    jobTitle: z.string().min(2, "عنوان شغل حداقل 2 کاراکتر باشد").optional(),
});

// Schema برای مدارک شناسنامه‌ای
export const identityDocumentsSchema = z.object({
    nationalCardFront: z.array(z.instanceof(File))
        .min(1, "تصویر جلوی کارت ملی الزامی است")
        .max(1, "تنها یک فایل مجاز است")
        .refine((files) => {
            return files.every(file =>
                ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)
            );
        }, "فرمت فایل باید JPG، PNG یا PDF باشد")
        .refine((files) => {
            return files.every(file => file.size <= 10 * 1024 * 1024); // 10MB
        }, "حجم فایل باید کمتر از 10MB باشد"),

    nationalCardBack: z.array(z.instanceof(File))
        .min(1, "تصویر پشت کارت ملی الزامی است")
        .max(1, "تنها یک فایل مجاز است")
        .refine((files) => {
            return files.every(file =>
                ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)
            );
        }, "فرمت فایل باید JPG، PNG یا PDF باشد")
        .refine((files) => {
            return files.every(file => file.size <= 10 * 1024 * 1024);
        }, "حجم فایل باید کمتر از 10MB باشد"),

    birthCertificate: z.array(z.instanceof(File))
        .min(1, "تصویر شناسنامه الزامی است")
        .max(1, "تنها یک فایل مجاز است")
        .refine((files) => {
            return files.every(file =>
                ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)
            );
        }, "فرمت فایل باید JPG، PNG یا PDF باشد")
        .refine((files) => {
            return files.every(file => file.size <= 10 * 1024 * 1024);
        }, "حجم فایل باید کمتر از 10MB باشد"),
});

// Schema برای مدارک شغلی
export const jobDocumentsSchema = z.object({
    salarySlips: z.array(z.instanceof(File))
        .min(1, "حداقل یک فیش حقوقی الزامی است")
        .max(3, "حداکثر 3 فیش حقوقی مجاز است")
        .refine((files) => {
            return files.every(file =>
                ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)
            );
        }, "فرمت فایل باید JPG، PNG یا PDF باشد")
        .refine((files) => {
            return files.every(file => file.size <= 10 * 1024 * 1024);
        }, "حجم هر فایل باید کمتر از 10MB باشد"),

    workCertificate: z.array(z.instanceof(File))
        .min(1, "گواهی کار الزامی است")
        .max(1, "تنها یک فایل مجاز است")
        .refine((files) => {
            return files.every(file =>
                ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)
            );
        }, "فرمت فایل باید JPG، PNG یا PDF باشد")
        .refine((files) => {
            return files.every(file => file.size <= 10 * 1024 * 1024);
        }, "حجم فایل باید کمتر از 10MB باشد"),

    insuranceHistory: z.array(z.instanceof(File))
        .min(1, "سوابق بیمه الزامی است")
        .max(1, "تنها یک فایل مجاز است")
        .refine((files) => {
            return files.every(file =>
                ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)
            );
        }, "فرمت فایل باید JPG، PNG یا PDF باشد")
        .refine((files) => {
            return files.every(file => file.size <= 10 * 1024 * 1024);
        }, "حجم فایل باید کمتر از 10MB باشد"),

    // برای خود اشتغال
    businessLicense: z.array(z.instanceof(File)).optional()
        .refine((files) => {
            if (!files) return true;
            return files.every(file =>
                ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)
            );
        }, "فرمت فایل باید JPG، PNG یا PDF باشد")
        .refine((files) => {
            if (!files) return true;
            return files.every(file => file.size <= 10 * 1024 * 1024);
        }, "حجم فایل باید کمتر از 10MB باشد"),

    taxReturns: z.array(z.instanceof(File)).optional()
        .refine((files) => {
            if (!files) return true;
            return files.every(file =>
                ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)
            );
        }, "فرمت فایل باید JPG، PNG یا PDF باشد")
        .refine((files) => {
            if (!files) return true;
            return files.every(file => file.size <= 10 * 1024 * 1024);
        }, "حجم فایل باید کمتر از 10MB باشد"),
});

// Schema کامل اعتبارسنجی
export const creditAssessmentSchema = financialInfoSchema
    .and(identityDocumentsSchema)
    .and(jobDocumentsSchema);

// Types
export type FinancialInfoFormData = z.infer<typeof financialInfoSchema>;
export type IdentityDocumentsFormData = z.infer<typeof identityDocumentsSchema>;
export type JobDocumentsFormData = z.infer<typeof jobDocumentsSchema>;
export type CreditAssessmentFormData = z.infer<typeof creditAssessmentSchema>;
