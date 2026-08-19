import axiosInstance from "@/lib/axiosInstance";
import {  IGetNotificationsResponse } from "@/types";

export const getNotificationsService = async (): Promise<IGetNotificationsResponse> => {
    const response = await axiosInstance.get<IGetNotificationsResponse>(`/notification`);
    return response.data;
}