import { followService, getFollowDataService, getUserConnectionsFollowersService, getUserConnectionsFollowingService, getUserConnectionsService } from "@/services"
import { IGetUserConnectionsFollowersResponse, IGetUserConnectionsFollowingResponse } from "@/types"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"


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

export const useGetUserConnectionsFollowers = (userID: number) => {
    return useInfiniteQuery<IGetUserConnectionsFollowersResponse>({
        queryKey: ['user-connections-followers', userID],
        queryFn: ({ pageParam }) => {
            const params = pageParam as { cursorID?: number };
            return getUserConnectionsFollowersService(userID, params?.cursorID);
        },
        getNextPageParam: (lastPage) => {
            const nextCursor = lastPage.data?.nextCursor;

            if (!nextCursor) return undefined;

            return {
                cursorID: nextCursor,
            }
        },
        initialPageParam: undefined,
    })
}

export const useGetUserConnectionsFollowing = (userID: number) => {
    return useInfiniteQuery<IGetUserConnectionsFollowingResponse>({
        queryKey: ['user-connections-following', userID],
        queryFn: ({ pageParam }) => {
            const params = pageParam as { cursorID?: number };
            return getUserConnectionsFollowingService(userID, params?.cursorID);
        },
        getNextPageParam: (lastPage) => {
            const nextCursor = lastPage.data?.nextCursor;

            if (!nextCursor) return undefined;

            return {
                cursorID: nextCursor,
            }
        },
        initialPageParam: undefined,
    })
}

