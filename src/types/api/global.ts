import { IReverseLocation } from "../model/global";

export interface IReverseLocationRequest {
    latitude: string;
    longitude: string;
}
export interface IReverseLocationResponse {
    message: string;
    data?: IReverseLocation;
}