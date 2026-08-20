import React from "react";
import { BiPlus } from "react-icons/bi";
import { Button } from "../UI";

const cn = (...classes: Array<string | false | undefined | null>) =>
    classes.filter(Boolean).join(" ");

type EmptyStateSize = "sm" | "md" | "lg";
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    emptyTitle: string;
    emptyMessage: React.ReactNode;
    emptyIcon: React.ReactNode;

    showCommandButton?: boolean;
    commandLabel?: React.ReactNode;
    commandIcon?: React.ReactNode;
    commandLoading?: boolean;
    commandLoadingMessage?: string;
    onCommandButton?: () => void;

    size?: EmptyStateSize;   
    containerClassName?: string;    
    iconClassName?: string;
    titleClassName?: string;
    messageClassName?: string;
    buttonClassName?: string;
    buttonVariant?: ButtonVariant;         
    renderCommandButton?: (defaultButton: React.ReactNode) => React.ReactNode;
    children?: React.ReactNode;
}

const SIZE_STYLES: Record<EmptyStateSize, { wrapper: string; icon: string; title: string }> = {
    sm: { wrapper: "p-6", icon: "text-3xl mb-3", title: "text-lg" },
    md: { wrapper: "p-12", icon: "text-5xl mb-4", title: "text-xl" },
    lg: { wrapper: "p-16", icon: "text-6xl mb-6", title: "text-2xl" },
};

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
    size = "md",
    containerClassName,
    iconClassName,
    titleClassName,
    messageClassName,
    buttonClassName,
    buttonVariant,
    renderCommandButton,
    children,
    className,
    ...rest
}) => {
    const s = SIZE_STYLES[size];

    const defaultButton =
        showCommandButton && onCommandButton ? (
            <Button
                isLoading={commandLoading}
                loadingText={commandLoadingMessage}
                onClick={onCommandButton}
                variant={buttonVariant}
                className={cn("py-6", buttonClassName)}
                icon={commandIcon ?? <BiPlus className="w-4 h-4" />}
            >
                {commandLabel}
            </Button>
        ) : null;

    return (
        <div
            className={cn("backdrop-blur-sm rounded-2xl text-center", s.wrapper, containerClassName, className)}
            {...rest}
        >
            <div className={cn("text-surface/70 flex justify-center", s.icon, iconClassName)}>
                {emptyIcon}
            </div>

            <h3 className={cn("font-medium text-surface mb-2", s.title, titleClassName)}>
                {emptyTitle}
            </h3>
            <p className={cn("text-surface/70 mb-4", messageClassName)}>{emptyMessage}</p>

            {renderCommandButton ? renderCommandButton(defaultButton) : defaultButton}

            {children}
        </div>
    );
};

export default EmptyState;