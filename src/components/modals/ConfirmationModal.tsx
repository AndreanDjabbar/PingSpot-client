"use client";
import React from 'react';
import { BiX } from 'react-icons/bi';
import { MdOutlineWarning } from 'react-icons/md';
import { FaInfoCircle } from 'react-icons/fa';
import { Button } from '../UI';
import { cn } from '@/lib';

type ModalType = 'warning' | 'info';

const typeStyles: Record<ModalType, {
    iconBg:        string;
    iconColor:     string;
    titleColor:    string;
    DefaultIcon:   React.FC<{ size?: number; className?: string }>;
    confirmVariant: 'danger' | 'primary';
}> = {
    warning: {
        iconBg:         'bg-danger/10',
        iconColor:      'text-danger-dark',
        titleColor:     'text-danger-dark',
        DefaultIcon:    MdOutlineWarning,
        confirmVariant: 'danger',
    },
    info: {
        iconBg:         'bg-muted',
        iconColor:      'text-surface',
        titleColor:     'text-surface',
        DefaultIcon:    FaInfoCircle,
        confirmVariant: 'primary',
    },
};

interface ConfirmationModalProps {
    isOpen:        boolean;
    onClose:       () => void;
    onConfirm:     () => void;
    isPending:     boolean;
    type?:         ModalType;
    title?:        string;
    message?:      string;
    explanation?:  string;
    icon?:         React.ReactNode;
    confirmTitle?: string;
    cancelTitle?:  string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isPending,
    type         = 'warning',
    title        = 'Konfirmasi',
    message      = 'Apakah anda yakin?',
    explanation,
    icon,
    confirmTitle = 'Konfirmasi',
    cancelTitle  = 'Batal',
}) => {
    if (!isOpen) return null;

    const { iconBg, iconColor, titleColor, DefaultIcon, confirmVariant } = typeStyles[type];

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-xl w-full max-w-lg"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-muted">
                    <div className="flex items-center gap-3">
                        <div className={cn('p-2 rounded-full', iconBg)}>
                            <DefaultIcon className={iconColor} size={24} />
                        </div>
                        <h3 className={cn('text-xl font-semibold', titleColor)}>
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        aria-label="Close modal"
                        className={cn('p-1 rounded-full hover:bg-muted transition-colors cursor-pointer', iconColor)}
                    >
                        <BiX className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-2">
                    <h4 className="text-base font-semibold text-surface">
                        {message}
                    </h4>
                    {explanation && (
                        <p className="text-sm text-surface leading-relaxed">
                            {explanation}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-5 pt-0">
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        {cancelTitle}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        disabled={isPending}
                        isLoading={isPending}
                        icon={icon}
                        iconPosition="left"
                    >
                        {confirmTitle}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;