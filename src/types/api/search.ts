import { IReport } from "../common/report";
import { IUserProfile } from "../common/user";

export interface ISearchDataResponse {
    message: string;
    data?: {
        usersData: {
            users: IUserProfile[];
            type: string;
        };
        reportsData: {
            reports: IReport[];
            type: string;
        },
        nextCursorUsersData?: number | null;
        nextCursorReportsData?: number | null;
    }
}