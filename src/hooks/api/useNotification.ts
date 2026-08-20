import { getNotificationsService, markNotificationAsReadService } from "@/services"
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