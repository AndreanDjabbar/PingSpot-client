// store/useUserStore.ts
import { create } from "zustand";
import { getMyProfileService } from "@/services";
import { IUserProfile } from "@/types";
import { getFormattedDate } from "@/utils";

interface UserProfileStore {
    userProfile: IUserProfile | null;
    loadUser: () => Promise<void>;
    clearUser: () => void;
    hasShownUpdateProfileModal?: boolean;
    setHasShownUpdateProfileModal?: (value: boolean) => void;
}

export const useUserProfileStore = create<UserProfileStore>((set) => ({
    userProfile: null,
    hasShownUpdateProfileModal: false,
    setHasShownUpdateProfileModal: (value: boolean) => set({ hasShownUpdateProfileModal: value }),
    loadUser: async () => {
        try {
        const profileData = await getMyProfileService();

        const mappedData: IUserProfile = {
            userID: profileData?.data?.userID || "",
            fullName: profileData?.data?.fullName || "",
            username: profileData?.data?.username || "",
            email: profileData?.data?.email || "",
            gender: profileData?.data?.gender || "",
            bio: profileData?.data?.bio || "",
            birthday:
            getFormattedDate(profileData?.data?.birthday || "", {
                formatStr: "yyyy-MM-dd",
            }) || "",
            profilePicture: profileData?.data?.profilePicture || "",
            isDefaultUsername: profileData?.data?.isDefaultUsername || false,
            isCompleteProfile: profileData?.data?.isCompleteProfile || false,
            missingFields: profileData?.data?.missingFields || [],
        };

        set({ userProfile: mappedData });
        } catch {
        set({ userProfile: null });
        }
    },

    clearUser: () => set({ userProfile: null }),
}));

