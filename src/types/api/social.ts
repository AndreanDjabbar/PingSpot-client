export interface IFollowRequest {
    followID: number;
    followingType: 'user' | 'community';
}

export interface IFollowResponse {
    message: string;
    data?: {
        followingID: number;
        followingType: 'user' | 'community';
        followerUserID: number;
        followProcess: 'follow' | 'unfollow';
    }
}

export interface IGetFollowDataRequest {
    followingID: number;
    followingType: 'user' | 'community';
}

export interface IGetFollowDataResponse {
    message: string;
    data?: {
        followingID: number;
        followersCount: number;
        followingCount: number;
        myFollowData?: {
            id: number;
            followingID: number;
            followingType: 'user' | 'community';
            followerUserID: number;
            createdAt: number;
        }
    }
}