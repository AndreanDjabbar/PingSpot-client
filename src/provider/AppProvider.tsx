"use client";

import { 
    useConfirmationModalStore,
    useImagePreviewModalStore 
} from "@/stores";
import { 
    ConfirmationModal,
    ImagePreviewModal 
} from "@/components";

export const ConfirmationModalProvider = () => {
    const {
        isOpen,
        title,
        subtitle,
        type,
        isPending,
        description,
        useCancelButton,
        additionalInfo,
        confirmTitle,
        closeConfirm,
        onConfirm,
    } = useConfirmationModalStore();

    if (!isOpen) return null;

    return (
        <ConfirmationModal
            isOpen={isOpen}
            type={type || "info"}
            useCancelButton={useCancelButton}
            onClose={closeConfirm}
            onConfirm={onConfirm || closeConfirm}
            isPending={isPending || false}
            title={title || ""}
            confirmTitle={confirmTitle || "Mengerti"}
            description={description || ""}
            subtitle={subtitle}
            additionalInfo={additionalInfo}
        />
    );
};

export const ImagePreviewModalProvider = () => {
    const { isOpen, imageUrl, closeImagePreview } = useImagePreviewModalStore();

    if (!isOpen) return null;

    return (
        <ImagePreviewModal
        isOpen={isOpen}
        imageUrl={imageUrl || ""}
        onClose={closeImagePreview}
        />
    )
}