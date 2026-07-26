/* eslint-disable @typescript-eslint/no-explicit-any */
import { IFollowResponse, IGetFollowDataResponse, IGetUserStatisticsResponse, ISaveSecurityRequest, ISaveSecurityResponse, ISearchUsersResponse } from "@/types/api/user";
import { IGetProfileResponse, ISaveProfileResponse } from "@/types";
import axiosInstance from "@/lib/axiosInstance";

export const saveProfileService = async (payload: FormData): Promise<ISaveProfileResponse> => {
    const response = await axiosInstance.post<ISaveProfileResponse>(`/user/profile`, payload, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
        },
    });
    return response.data;
}

export const followService = async (followID: number, followingType: 'user' | 'community'): Promise<IFollowResponse> => {
    const response = await axiosInstance.post<IFollowResponse>(`/user/follow`, { followID, followingType }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    return response.data;
}

export const getFollowDataService = async (followingID: number, followingType: 'user' | 'community'): Promise<IGetFollowDataResponse> => {
    const response = await axiosInstance.get<IGetFollowDataResponse>(`/user/follow/${followingID}/${followingType}`);
    return response.data;
}

export const saveSecurityService = async (payload: ISaveSecurityRequest): Promise<ISaveSecurityResponse> => {
    const response = await axiosInstance.post<ISaveSecurityResponse>(`/user/security`, payload);
    return response.data;
}

export const getUserStatisticsService = async (): Promise<IGetUserStatisticsResponse> => {
    const response = await axiosInstance.get<IGetUserStatisticsResponse>(`/user/statistics/`);
    return response.data;
}

export const getMyProfileService = async (): Promise<IGetProfileResponse> => {
    const response = await axiosInstance.get<IGetProfileResponse>(`/user/profile/`);
    return response.data;
}

export const getProfileByUsernameService = async (username: string): Promise<IGetProfileResponse> => {
    const response = await axiosInstance.get<IGetProfileResponse>(`/user/profile/${username}`);
    return response.data;
}

export const searchUsersDataService = async (searchQuery: string, usersDatacursorID?: number): Promise<ISearchUsersResponse> => {
    const params = new URLSearchParams();

    if (usersDatacursorID) params.append('usersDataCursorID', usersDatacursorID.toString());
    params.append('searchQuery', searchQuery);
    const queryString = params.toString() ? `&${params.toString()}` : '';
    const response = await axiosInstance.get<ISearchUsersResponse>(`/user/search/?${queryString}`);
    return response.data;
}