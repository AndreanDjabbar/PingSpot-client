import axiosInstance from "@/lib/axiosInstance";
import {  IGetNotificationsResponse } from "@/types";

export const getNotificationsService = async (): Promise<IGetNotificationsResponse> => {
    const response = await axiosInstance.get<IGetNotificationsResponse>(`/notification`);
    return response.data;
}

export const markNotificationAsReadService = async (notificationId: number): Promise<void> => {
    await axiosInstance.patch(`/notification/${notificationId}/read`);
}