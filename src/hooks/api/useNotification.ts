import { deleteAllNotificationsService, deleteNotificationService, getNotificationsService, markAllNotificationsAsReadService, markNotificationAsReadService } from "@/services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


export const useGetNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: () => getNotificationsService(),
    })
}

export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: number) => markNotificationAsReadService(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    })
}

export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => markAllNotificationsAsReadService(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    })
}

export const useDeleteNotification = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notificationId: number) => deleteNotificationService(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    })
}

export const useDeleteAllNotifications = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => deleteAllNotificationsService(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    })
}