import React from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { BiPlus } from "react-icons/bi";

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
        <div className="bg-white backdrop-blur-sm rounded-2xl border border-muted shadow-sm p-12 text-center">
        <div className="text-5xl text-muted mb-4 flex justify-center">
            {emptyIcon}
        </div>

        <h3 className="text-xl font-medium text-surface mb-2">{emptyTitle}</h3>
        <p className="text-muted mb-4">{emptyMessage}</p>

        {showCommandButton && onCommandButton && (
            <button
            className="bg-pingspot-hoverable text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 mx-auto cursor-pointer"
            onClick={onCommandButton}
            disabled={commandLoading}
            >
            {commandLoading ? (
                <>
                    <AiOutlineLoading3Quarters className="animate-spin mr-2 text-lg" />
                    <span>{commandLoadingMessage}</span>
                </>
            ) : (
                <>
                    {commandIcon ? commandIcon : <BiPlus className="w-4 h-4" />}
                    <span>{commandLabel}</span>
                </>
            )}
            </button>
        )}
        </div>
    );
};

export default EmptyState;
