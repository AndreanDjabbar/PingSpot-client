"use client";

import { useGlobalStore } from "@/stores/global.store";
import { useLocationStore } from "@/stores/location.store";
import { useEffect } from "react";

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
    const globalStore = useGlobalStore();
    const locationStore = useLocationStore();

    useEffect(() => {
        const now = Date.now();
        if (globalStore.expiredAt && now > globalStore.expiredAt) {
        globalStore.clearGlobalData();
        }

        if (locationStore.location?.expiresAt && now > locationStore.location.expiresAt) {
        locationStore.clearLocation();
        }
    }, []);

    return <>{children}</>;
};

export default ClientLayout;