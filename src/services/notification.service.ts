import axiosInstance from "@/lib/axiosInstance";
import {  IGetNotificationsResponse } from "@/types";

export const getNotificationsService = async (): Promise<IGetNotificationsResponse> => {
    const response = await axiosInstance.get<IGetNotificationsResponse>(`/notification`);
    return response.data;
}

export const markNotificationAsReadService = async (notificationId: number): Promise<void> => {
    await axiosInstance.patch(`/notification/${notificationId}/read`);
}

export const markAllNotificationsAsReadService = async (): Promise<void> => {
    await axiosInstance.patch(`/notification/read`);
}

export const deleteNotificationService = async (notificationId: number): Promise<void> => {
    await axiosInstance.delete(`/notification/${notificationId}`);
}

export const deleteAllNotificationsService = async (): Promise<void> => {
    await axiosInstance.delete(`/notification`);
}