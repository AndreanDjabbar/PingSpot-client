import z from "zod";

type TFn = (key: string, values?: Record<string, string | number>) => string;

export const createRegisterSchema = (t: TFn) =>
    z.object({
        fullName: z.string().min(3, t("full_name_min", { min: 3 })),
        username: z.string().min(3, t("username_min", { min: 3 })),
        email: z.email({ message: t("email_invalid") }),
        password: z.string().min(6, t("password_min", { min: 6 })),
        provider: z.string().optional(),
        passwordConfirmation: z.string(),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: t("password_mismatch"),
        path: ["passwordConfirmation"],
    });

export const createLoginSchema = (t: TFn) =>
    z.object({
        emailOrUsername: z.string().min(3, t("email_or_username_min", { min: 3 })),
        password: z.string().min(6, t("password_min", { min: 6 })),
        provider: z.string().optional(),
    });

export const createVerificationSchema = (t: TFn) =>
    z.object({
        code1: z.string().min(1, t("verification_code1_required")),
        userId: z.string().min(1, t("verification_user_id_required")),
        code2: z.string().min(1, t("verification_code2_required")),
    });

export const createForgotPasswordEmailVerificationSchema = (t: TFn) =>
    z.object({
        email: z.email({ message: t("email_invalid") }),
    });

export const createForgotPasswordResetPasswordSchema = (t: TFn) =>
    z.object({
        password: z.string().min(6, t("password_min", { min: 6 })),
        email: z.email({ message: t("email_invalid") }).optional(),
        passwordConfirmation: z.string(),
    }).refine((data) => data.password === data.passwordConfirmation, {
        message: t("password_mismatch"),
        path: ["passwordConfirmation"],
    });