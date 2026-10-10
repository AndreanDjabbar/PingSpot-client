import z from "zod";

export type TFn = (key: string, values?: Record<string, string | number>) => string;

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const REPORT_TYPES = [
    'infrastructure',
    'environment',
    'safety',
    'traffic',
    'public_facility',
    'waste',
    'water',
    'electricity',
    'health',
    'social',
    'education',
    'administrative',
    'disaster',
    'other',
] as const;

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

const buildReportBaseShape = (t: TFn) => ({
    reportTitle: z.string()
        .min(5, t("report_title_min", { min: 5 }))
        .max(100, t("report_title_max", { max: 100 })),
    reportDescription: z.string()
        .min(10, t("report_description_min", { min: 10 }))
        .max(500, t("report_description_max", { max: 500 })),
    reportType: z.enum(REPORT_TYPES, {
        message: t("report_type_required"),
    }),
    location: z.string().min(3, t("location_min", { min: 3 })),
    latitude: z.string().min(1, t("map_location_required")).refine(
        (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)),
        { message: t("latitude_invalid") }
    ),
    longitude: z.string().min(1, t("map_location_required")).refine(
        (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)),
        { message: t("longitude_invalid") }
    ),
    hasProgress: z.boolean().optional(),
});

export const buildCreateReportSchema = (t: TFn) =>
    z.object({
        ...buildReportBaseShape(t),
        mapZoom: z.string().optional(),
        reportImages: z
            .array(z.instanceof(File))
            .max(5, t("images_max", { max: 5 }))
            .refine(
                (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
                t("image_size_max", { max: MAX_FILE_SIZE_MB })
            )
            .optional(),
    });

export const buildEditReportSchema = (t: TFn) =>
    z.object({ ...buildReportBaseShape(t) });

export const buildReactReportSchema = (t: TFn) =>
    z.object({
        reactionType: z.enum(['LIKE', 'DISLIKE'], {
            message: t("reaction_type_invalid"),
        }),
    });

export const buildVoteReportSchema = (t: TFn) =>
    z.object({
        voteType: z.enum(['RESOLVED', 'ON_PROGRESS', 'NOT_RESOLVED'], {
            message: t("vote_type_invalid"),
        }),
    });

export const buildUploadProgressReportSchema = (t: TFn) =>
    z.object({
        progressStatus: z.enum(['RESOLVED', 'ON_PROGRESS', 'NOT_RESOLVED'], {
            message: t("progress_status_invalid"),
        }),
        progressNotes: z.string()
            .min(5, t("progress_notes_min", { min: 5 }))
            .max(300, t("progress_notes_max", { max: 300 })),
        progressAttachments: z
            .array(z.instanceof(File))
            .max(2, t("images_max", { max: 2 }))
            .refine(
                (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
                t("image_size_max", { max: MAX_FILE_SIZE_MB })
            )
            .optional(),
    });

export const buildCreateReportCommentSchema = (t: TFn) =>
    z.object({
        commentContent: z.string()
            .min(1, t("comment_required"))
            .max(500, t("comment_max", { max: 500 })),
        threadRootID: z.string().optional().nullable(),
        parentCommentID: z.string().optional().nullable(),
        mediaType: z.enum(['IMAGE', 'GIF']).optional().nullable(),
        mediaURL: z.string().optional().nullable(),
        mediaFile: z.file()
            .min(1, t("file_empty"))
            .max(MAX_FILE_SIZE, t("file_max", { max: MAX_FILE_SIZE_MB }))
            .optional(),
    });