import { 
    createRegisterSchema,
    createLoginSchema,
    createVerificationSchema,
    createForgotPasswordEmailVerificationSchema,
    createForgotPasswordResetPasswordSchema
} from "@/app/auth/Schema";
import z from "zod";

export type IRegisterRequest = z.infer<ReturnType<typeof createRegisterSchema>>;

export type ILoginRequest = z.infer<ReturnType<typeof createLoginSchema>>;

export interface ILogoutRequest {
    authToken: string;
}

export interface ILogoutResponse {
    message: string;
}

export type IVerificationRequest = z.infer<ReturnType<typeof createVerificationSchema>>;

export type IForgotPasswordEmailVerificationRequest = z.infer<ReturnType<typeof createForgotPasswordEmailVerificationSchema>>;

export interface IForgotPasswordLinkVerificationRequest {
    code: string;
    email: string;
}

export type IForgotPasswordResetPasswordRequest = z.infer<ReturnType<typeof createForgotPasswordResetPasswordSchema>>;

export interface IRegisterResponse {
    message: string;
}

export interface ILoginResponse {
    message: string;
    data?: {
        accessToken: string;
        expiresIn: number;
    }
}

export interface IVerificationResponse {
    message: string;
    data?: {
        username: string;
        email: string;
        fullName: string;
    }
}

export interface IForgotPasswordEmailVerificationResponse {
    message: string;
}

export interface IForgotPasswordLinkVerificationResponse {
    message: string;
    data?: {
        email: string;
    }
}

export interface IForgotPasswordResetPasswordResponse {
    message: string;
}