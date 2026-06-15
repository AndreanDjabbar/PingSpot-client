export interface IUserProfile {
    userID: string;
    username: string;
    fullName: string;
    email: string;
    profilePicture?: string;
    gender?: string;
    bio?: string;
    birthday? : string;
    isDefaultUsername: boolean;
    isCompleteProfile: boolean;
    missingFields: string[];
}

export interface IMentionedUser {
    userID: number;
    username: string;
    fullName: string;
    profilePicture?: string;
    birthday?: string;
    bio?: string;
}