import axiosInstance from "@/lib/axiosInstance";
import { IFollowResponse, IGetFollowDataResponse, IGetUserConnectionsFollowersResponse, IGetUserConnectionsFollowingResponse, IGetUserConnectionsResponse } from "@/types";

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

export const getUserConnectionsFollowersService = async (userID: number, cursorID?: number): Promise<IGetUserConnectionsFollowersResponse> => {
    const params = new URLSearchParams();
    if (cursorID) params.append('cursorID', cursorID.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosInstance.get<IGetUserConnectionsFollowersResponse>(`/social/connection/${userID}/user/followers${queryString}`);
    return response.data;
}

export const getUserConnectionsFollowingService = async (userID: number, cursorID?: number): Promise<IGetUserConnectionsFollowingResponse> => {
    const params = new URLSearchParams();
    if (cursorID) params.append('cursorID', cursorID.toString());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await axiosInstance.get<IGetUserConnectionsFollowingResponse>(`/social/connection/${userID}/user/following${queryString}`);
    return response.data;
}