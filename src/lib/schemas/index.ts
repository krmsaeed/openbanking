// Export all validation schemas from consolidated files
export * from './creditAssessment';
export * from './identity';
export * from './payment';
export * from './personal';
export * from './registration';

// Backward compatibility aliases
export {
    detailedPersonalInfoSchema as birthDatePostalSchema,
    otpFormSchema as otpSchema,
    passwordWithConfirmSchema as passwordSchema,
    basicPersonalInfoSchema as personalInfoSchema,
} from './personal';

export { cardFormSchema } from './payment';

export type {
    DetailedPersonalInfo as BirthDatePostalFormData,
    OtpForm as OtpFormData,
    PasswordWithConfirm as PasswordFormData,
    BasicPersonalInfo as PersonalInfoFormData,
} from './personal';

export type { CardFormData, PaymentOtpFormData } from './payment';
