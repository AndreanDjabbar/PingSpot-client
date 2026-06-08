import { create } from "zustand";
import { OptionItem } from "@/types";

type ConfirmationModalType = "warning" | "info" | "danger";

interface ConfirmationModalState {
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    isPending?: boolean;
    confirmTitle?: string;
    type?: ConfirmationModalType;
    description?: string;
    useCancelButton?: boolean;
    additionalInfo?: string;
    openConfirm: (options: {
        title: string;
        subtitle?: string;
        onConfirm?: () => void;
        onClose?: () => void;
        type?: ConfirmationModalType;
        description: string;
        additionalInfo?: string;
        confirmTitle?: string;
        isPending?: boolean;
        useCancelButton?: boolean;
    }) => void;
    onClose?: () => void;
    onConfirm?: () => void;
    closeConfirm: () => void;
}

interface ImagePreviewModalState {
    isOpen: boolean;
    imageUrl?: string;
    openImagePreview: (imageUrl: string) => void;
    closeImagePreview: () => void;
}

interface OptionsModalState {
    isOpen: boolean;
    optionsList?: OptionItem[];
    anchorRef?: React.RefObject<HTMLElement | null> | null;
    openOptionsModal: (options: {
        optionsList: OptionItem[];
        anchorRef?: React.RefObject<HTMLElement | null> | null;
    }) => void;
    closeOptionsModal: () => void;
}

export const useConfirmationModalStore = create<ConfirmationModalState>(
    (set) => ({
        isOpen: false,
        title: "",
        onClose: undefined,
        onConfirm: undefined,
        type: "info",
        description: "",
        useCancelButton: true,
        additionalInfo: undefined,
        subtitle: undefined,
        isPending: undefined,
        confirmTitle: undefined,
        openConfirm: (options) =>
        set({ 
            ...options, 
            type: options.type || "info", 
            isOpen: true,
            isPending: options.isPending || false,
            onConfirm: options.onConfirm,
            onClose: options.onClose 
        }),

        closeConfirm: () =>
        set({
            isOpen: false,
            title: "",
            type: "info",
            description: "",
            additionalInfo: undefined,
            subtitle: undefined,
            isPending: undefined,
            confirmTitle: undefined,
        }),
    })
);

export const useImagePreviewModalStore = create<ImagePreviewModalState>(
    (set) => ({
        isOpen: false,
        imageUrl: undefined,
        openImagePreview: (imageUrl) => set({ isOpen: true, imageUrl }),
        closeImagePreview: () => set({ isOpen: false, imageUrl: undefined }),
    })
);

export const useOptionsModalStore = create<OptionsModalState>((set) => ({
    isOpen: false,
    optionsList: undefined,
    anchorRef: null,

    openOptionsModal: ({ optionsList, anchorRef = null }) =>
        set({ isOpen: true, optionsList, anchorRef }),

    closeOptionsModal: () =>
        set({ isOpen: false, optionsList: undefined, anchorRef: null }),
}));