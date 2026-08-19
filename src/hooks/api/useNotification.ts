import { getNotificationsService } from "@/services"
import { useQuery } from "@tanstack/react-query"


export const useGetNotifications = () => {
    return useQuery({
        queryKey: ['notifications'],
        queryFn: () => getNotificationsService(),
    })
}