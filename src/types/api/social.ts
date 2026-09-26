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

export interface IUserConnection {
    userID: number;
    username: string;
    followID: number;
    fullName: string;
    profilePicture: string;
    relation: 'follower' | 'following';
    status: string;
}

export interface IGetUserConnectionsResponse {
    data: {
        followers: IUserConnection[];
        following: IUserConnection[];
    },
    message: string;
}

export interface IGetUserConnectionsFollowersResponse {
    data: {
        followers: IUserConnection[];
        nextCursor?: number | null;
    },
    message: string;
}

export interface IGetUserConnectionsFollowingResponse {
    data: {
        following: IUserConnection[];
        nextCursor?: number | null;
    },
    message: string;
}