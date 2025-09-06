import { z } from "zod";
import { firstNameSchema, lastNameSchema, nationalCodeSchema, phoneNumberSchema } from "./personal";

export const loginFormSchema = z.object({
    nationalCode: nationalCodeSchema,
    phoneNumber: phoneNumberSchema,
});

export const registrationFormSchema = z.object({
    nationalCode: nationalCodeSchema,
    phoneNumber: phoneNumberSchema,
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    email: z.string().email("ایمیل وارد شده معتبر نیست").optional().or(z.literal("")),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type RegistrationFormData = z.infer<typeof registrationFormSchema>;
