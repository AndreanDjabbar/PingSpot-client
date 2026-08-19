export interface IGetNotificationsResponse {
    message: string;
    data?: {
        notifications: INotification[];
    }
}

export interface INotification {
    id: number;
    userID: number;
    type: 'INFO' | 'WARNING' | 'ERROR';
    category: 'GENERAL' | 'REPORT' | 'USER';
    entityType: 'POST' | 'COMMENT' | 'USER' | 'REPORT' | 'COMMUNITY';
    title: string;
    description: string;
    isRead: boolean;
    readAt?: number;
    createdAt: number;
    entityID?: number;
}