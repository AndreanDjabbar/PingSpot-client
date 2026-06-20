import { 
    getMyProfileService, 
    getProfileByUsernameService, 
    getUserStatisticsService, 
    saveProfileService, 
    saveSecurityService, 
    searchUsersDataService
} from "@/services";
import { 
    IGetProfileResponse, 
    IGetUserStatisticsResponse, 
    ISaveProfileResponse, 
    ISaveSecurityRequest, 
    ISaveSecurityResponse, 
    ISearchUsersResponse
} from "@/types";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { useDebounce } from "use-debounce";

export const useGetProfileByUsername = (username: string) => {
    return useQuery<IGetProfileResponse, AxiosError>({
        queryKey: ['profile', username],
        queryFn: () => getProfileByUsernameService(username),
    })
}

export const useGetUserStatistics = () => {
    return useQuery<IGetUserStatisticsResponse, Error>({
        queryKey: ['user-statistics'],
        queryFn: () => getUserStatisticsService(),
    });
};

export const useMyProfile = () => {
    return useQuery<IGetProfileResponse, AxiosError>({
        queryKey: ['my-profile'],
        queryFn: () => getMyProfileService(),
    })
}

export const useSaveProfile = () => {
    return useMutation<ISaveProfileResponse, AxiosError, FormData>({
        mutationFn: (data: FormData) => saveProfileService(data) 
    })
}

export const useSaveSecurity = () => {
    return useMutation<ISaveSecurityResponse, AxiosError, ISaveSecurityRequest>({
        mutationFn: (data: ISaveSecurityRequest) => saveSecurityService(data) 
    })
}
    
export const useSearchUsers = (searchQuery: string, enabled: boolean) => {
    const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
    
    return useInfiniteQuery<ISearchUsersResponse, Error>({
        queryKey: ['search-users', debouncedSearchQuery],
        queryFn: ({ pageParam }) => {
            const params = pageParam as { usersDataCursorID?: number };
            return searchUsersDataService(
                debouncedSearchQuery,
                params?.usersDataCursorID,
            );
        },
        getNextPageParam: (lastPage) => {
            const nextUsersID = lastPage.data?.nextCursorUsersData;
            
            if (!nextUsersID) {
                return undefined;
            }
            
            return {
                usersDataCursorID: nextUsersID,
            };
        },
        initialPageParam: undefined,
        enabled: enabled,
    });
};