import React from "react";
import { BiPlus } from "react-icons/bi";
import { Button } from "../UI";

interface EmptyStateProps {
    emptyTitle: string;
    emptyMessage: string;
    emptyIcon: React.ReactNode;
    showCommandButton?: boolean;
    commandLabel?: string;
    commandIcon?: React.ReactNode;
    commandLoading?: boolean;
    commandLoadingMessage?: string;
    onCommandButton?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    emptyTitle,
    emptyMessage,
    emptyIcon,
    showCommandButton = false,
    commandLabel = "Aksi",
    onCommandButton,
    commandIcon,
    commandLoadingMessage = "Memproses...",
    commandLoading = false,
}) => {
    return (
        <div className="bg-white backdrop-blur-sm rounded-2xl p-12 text-center">
        <div className="text-5xl text-surface/70 mb-4 flex justify-center">
            {emptyIcon}
        </div>

        <h3 className="text-xl font-medium text-surface mb-2">{emptyTitle}</h3>
        <p className="text-surface/70 mb-4">{emptyMessage}</p>

        {showCommandButton && onCommandButton && (
            <Button
            isLoading={commandLoading}
            loadingText={commandLoadingMessage}
            onClick={onCommandButton}
            className="py-6"
            icon={commandIcon ? commandIcon : <BiPlus className="w-4 h-4" />}
            >
                {commandLabel}
            </Button>
        )}
        </div>
    );
};

export default EmptyState;
