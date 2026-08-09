import { followService, getFollowDataService, getUserConnectionsService } from "@/services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


export const useGetFollowData = (followingID: number, followingType: 'user' | 'community') =>{
    return useQuery({
        queryKey: ['follow-data', followingID, followingType],
        queryFn: () => getFollowDataService(followingID, followingType),
    })
}

export const useFollow = (followID: number, followingType: 'user' | 'community') => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => followService(followID, followingType),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['follow-data', followID, followingType] });
        }
    })
}

export const useGetUserConnections = (userID: number) => {
    return useQuery({
        queryKey: ['user-connections', userID],
        queryFn: () => getUserConnectionsService(userID),
    })
}