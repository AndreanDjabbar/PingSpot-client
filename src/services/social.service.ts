import axiosInstance from "@/lib/axiosInstance";
import { IFollowResponse, IGetFollowDataResponse, IGetUserConnectionsResponse } from "@/types";

export const followService = async (followID: number, followingType: 'user' | 'community'): Promise<IFollowResponse> => {
    const response = await axiosInstance.post<IFollowResponse>(`/social/follow`, { followingID: followID, followingType }, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    });
    return response.data;
}

export const getFollowDataService = async (followingID: number, followingType: 'user' | 'community'): Promise<IGetFollowDataResponse> => {
    const response = await axiosInstance.get<IGetFollowDataResponse>(`/social/follow/${followingID}/${followingType}`);
    return response.data;
}

export const getUserConnectionsService = async (userID: number): Promise<IGetUserConnectionsResponse> => {
    const response = await axiosInstance.get<IGetUserConnectionsResponse>(`/social/connection/${userID}/user`);
    return response.data;
}