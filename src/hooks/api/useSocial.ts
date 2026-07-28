import { followService, getFollowDataService } from "@/services"
import { useMutation, useQuery } from "@tanstack/react-query"


export const useGetFollowData = (followingID: number, followingType: 'user' | 'community') =>{
    return useQuery({
        queryKey: ['follow-data', followingID, followingType],
        queryFn: () => getFollowDataService(followingID, followingType),
    })
}

export const useFollow = (followID: number, followingType: 'user' | 'community') => {
    return useMutation({
        mutationFn: () => followService(followID, followingType)
    })
}