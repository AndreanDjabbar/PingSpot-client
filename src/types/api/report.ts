import { 
    buildCreateReportSchema,
    buildReactReportSchema,
    buildEditReportSchema,
    buildUploadProgressReportSchema,
    buildVoteReportSchema,
    buildCreateReportCommentSchema
} from "@/app/main/schema";
import {  IGetReportSaved, IReport, IReportComment, IReportProgress, IReportReactions, IReportVote, ITotalReportCount } from "../model";
import z from "zod";

export interface IGetReportResponse {
    message: string;
    data?: {
        reports: {
            reports: IReport[];
            totalCounts: ITotalReportCount
        };
        nextCursor?: number | null;
    }
}

export interface IGetReportCommentsResponse {
    message: string;
    data?: {
        comments: {
            comments: IReportComment[];
            totalCounts: number;
        };
        nextCursor?: number | null;
    }
}

export interface IGetReportCommentRepliesResponse {
    message: string;
    data?: {
        replies: {
            replies: IReportComment[];
            totalCounts: number;
        };
        nextCursor?: number | null;
    }
}

export interface IGetReportByIDResponse {
    message: string;
    data?: {
        report: {
            report: IReport;
        };
    }
}

export type ICreateReportRequest = z.infer<ReturnType<typeof buildCreateReportSchema>>;

export type IEditReportRequest = z.infer<ReturnType<typeof buildEditReportSchema>>;

export type ICreateReportCommentRequest = z.infer<ReturnType<typeof buildCreateReportCommentSchema>>;

export interface ICreateReportCommentResponse {
    message: string;
    data?: IReportComment;
}

export type IUploadProgressReportRequest = z.infer<ReturnType<typeof buildUploadProgressReportSchema>>;

export interface IUploadProgressReportResponse {
    message: string;
    data?: IReportProgress;
}

export type IReactReportRequest = z.infer<ReturnType<typeof buildReactReportSchema>>;

export type IVoteReportRequest = z.infer<ReturnType<typeof buildVoteReportSchema>>;

export interface ICreateReportResponse {
    message: string;
    data?: IReport;
}

export interface IEditReportResponse {
    message: string;
    data?: IReport;
}

export interface IDeleteReportRequest {
    reportID: number;
}

export interface IDeleteReportResponse {
    message: string;
    data?: {
        reportID: number;
    };
}

export interface IReactReportResponse {
    message: string;
    data?: IReportReactions;
}

export interface ISaveReportResponse {
    message: string;
    data?: {
        reportID: number;
        save: boolean;
        userID: number;
    }
}

export interface IVoteReportResponse {
    message: string;
    data?: IReportVote;
}

export interface IGetProgressReportResponse {
    message: string;
    data?: IReportProgress[];
}

export interface IUpdateReportStatusResponse {
    message: string;
    data?: {
        id: number;
        status: string;
        updatedAt: number;
    };
}

export interface IGetReportStatisticsResponse {
    message: string;
    data?: {
        totalReports: number;
        reportsByStatus: Record<string, number>;
        monthlyReportCounts: Record<string, number>;
    }
}

export interface IGetReportSavedResponse {
    message: string;
    data?: {
        savedReports: {
            savedReports: IGetReportSaved[];
        }
        nextCursor?: number | null;
    }
}