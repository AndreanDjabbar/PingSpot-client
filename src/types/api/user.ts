import z from "zod";
import { 
    IMentionedUser,
    IUserProfile 
} from "../model";
import { SaveProfileSchema, SaveSecuritySchema } from "@/app/main/schema";

export interface IGetProfileByUsernameResponse {
    message: string;
    data?: IUserProfile;
}

export interface IGetProfileResponse {
    message: string;
    data?: IUserProfile;
}

export type ISaveProfileRequest = z.infer<typeof SaveProfileSchema>;

export interface ISaveProfileResponse {
    message: string;
    data?: IUserProfile;
}

export interface IFollowRequest {
    followID: number;
    followingType: 'user' | 'community';
}

export interface IFollowResponse {
    message: string;
    data?: {
        followingID: number;
        followingType: 'user' | 'community';
        followerUserID: number;
        followProcess: 'follow' | 'unfollow';
    }
}

export interface IGetFollowDataRequest {
    followingID: number;
    followingType: 'user' | 'community';
}

export interface IGetFollowDataResponse {
    message: string;
    data?: {
        followingID: number;
        followersCount: number;
        followingCount: number;
    }
}

export type ISaveSecurityRequest = z.infer<typeof SaveSecuritySchema>;

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
            usersData: IMentionedUser[];
        };
        nextCursorUsersData?: number | null;
    }
}