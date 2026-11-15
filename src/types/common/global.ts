import { ReactNode } from "react";

export interface IReverseLocation {
    display_name: string;
    address: {
        country?: string;
        country_code?: string;
        state?: string;
        county?: string;
        postcode?: string;
        road?: string;
        suburb?: string;
        village?: string;
        region?: string;
        city?: string;
        town?: string;
        neighbourhood?: string;
        hamlet?: string;
    };
}

export interface ICurrentLocation {
    lat: string;
    lng: string;
    lastUpdated?: string;
    expiresAt?: number;
    displayName?: string;
    address?: object | null;
    type?: string;
    name?: string;
    osmType?: string;
    osmId?: string;
};

export interface ImageItem {
    file: File;
    preview: string;
    isExisting?: boolean;
    existingUrl?: string;
};

export interface OptionItem {
    label: string;
    icon?: ReactNode;
    description?: string;
    onClick: () => void;
}

export type TabType = 'users' | 'reports' | 'communities';