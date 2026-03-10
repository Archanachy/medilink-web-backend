import z from "zod";
import { UserSchema } from "../types/user.type";
// re-use UserSchema from types
export const CreateUserDTO = UserSchema.pick(
    {
        firstName: true,
        lastName: true,
        email: true,
        username: true,
        password: true,
        role: true,
        phone: true,
        profileImage: true
    }
).extend( 
    {
        confirmPassword: z.string().min(6)
    }
).refine( 
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
)
export type CreateUserDTO = z.infer<typeof CreateUserDTO>;

export const LoginUserDTO = z.object({
    email: z.email(),
    password: z.string().min(6)
});
export type LoginUserDTO = z.infer<typeof LoginUserDTO>;

export const ForgotPasswordDTO = z.object({
    email: z.email(),
});
export type ForgotPasswordDTO = z.infer<typeof ForgotPasswordDTO>;

export const ResetPasswordDTO = z.object({
    token: z.string().min(10),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
}).refine(
    (data) => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    }
);
export type ResetPasswordDTO = z.infer<typeof ResetPasswordDTO>;

export const ChangePasswordDTO = z.object({
    oldPassword: z.string().min(6),
    newPassword: z.string().min(8),
});
export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;