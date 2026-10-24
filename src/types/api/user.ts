import z from "zod";
import { buildSaveProfileSchema, buildSaveSecuritySchema } from "@/schemas/user.schema";
import { IUserProfile } from "../common/user";

export interface IGetProfileByUsernameResponse {
    message: string;
    data?: IUserProfile;
}

export interface IGetProfileResponse {
    message: string;
    data?: IUserProfile;
}

export type ISaveProfileRequest = z.infer<ReturnType<typeof buildSaveProfileSchema>>;

export interface ISaveProfileResponse {
    message: string;
    data?: IUserProfile;
}

export type ISaveSecurityRequest = z.infer<ReturnType<typeof buildSaveSecuritySchema>>;

export interface ISaveSecurityResponse {
    message: string;
}

export interface IGetUserStatisticsResponse {
    message: string;
    data?: {
        totalUsers: number;
        usersByGender: Record<string, number>;
        monthlyUserCounts: Record<string, number>;
    }
}

export interface ISearchUsersResponse {
    message: string;
    data?: {
        usersData: {
            usersData: IUserProfile[];
        };
        nextCursorUsersData?: number | null;
    }
}