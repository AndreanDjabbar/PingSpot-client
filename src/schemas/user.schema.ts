import z from "zod";

export type TFn = (key: string, values?: Record<string, string | number>) => string;

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export const buildSaveProfileSchema = (t: TFn) =>
    z.object({
        fullName: z.string().min(3, t("full_name_min", { min: 3 })),
        username: z.string().min(3, t("username_min", { min: 3 })),
        gender: z.enum(["male", "female"], {
            message: t("gender_invalid"),
        }).optional().nullable(),
        bio: z.string().max(200, t("bio_max", { max: 200 })).optional(),
        birthday: z.string().refine((date) => {
            if (!date || date.trim() === "") return true;

            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) return false;

            const minDate = new Date("1905-01-01");
            const maxDate = new Date("2023-12-31");
            return parsedDate >= minDate && parsedDate <= maxDate;
        }, { message: t("birthday_invalid") }).optional().nullable(),
        profilePicture: z.file()
            .min(1, t("file_empty"))
            .max(MAX_FILE_SIZE, t("file_max", { max: MAX_FILE_SIZE_MB }))
            .optional(),
    });

export const buildSaveSecuritySchema = (t: TFn) =>
    z.object({
        currentPassword: z.string().min(6, t("current_password_min", { min: 6 })),
        currentPasswordConfirmation: z.string().min(6, t("current_password_confirmation_min", { min: 6 })),
        newPassword: z.string().min(6, t("new_password_min", { min: 6 })),
        newPasswordConfirmation: z.string().min(6, t("new_password_confirmation_min", { min: 6 })),
    }).refine((data) => data.currentPassword === data.currentPasswordConfirmation, {
        message: t("current_password_mismatch"),
        path: ["currentPasswordConfirmation"],
    }).refine((data) => data.newPassword === data.newPasswordConfirmation, {
        message: t("new_password_mismatch"),
        path: ["newPasswordConfirmation"],
    }).refine((data) => data.currentPassword !== data.newPassword, {
        message: t("new_password_same_as_old"),
        path: ["newPassword"],
    });
