import { z } from "zod";
import { loginFormSchema } from "./common";


export const otpSchema = z.object({
    otp: z.string().length(5, "کد تأیید باید ۵ رقم باشد").regex(/^\d+$/, "کد تأیید باید فقط شامل عدد باشد")
});


export { loginFormSchema };

export type LoginOtpFormData = z.infer<typeof otpSchema>;
