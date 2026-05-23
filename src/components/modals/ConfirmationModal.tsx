"use client";
import { cn } from '@/lib';
import React from 'react';
import { BiX } from 'react-icons/bi';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { MdWarning } from 'react-icons/md';
import { Button } from '../UI';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    subtitle?: string;
    type: 'info' | 'warning';
    onClose:       () => void;
    onConfirm?:     () => void;
    isPending:     boolean;
    description: string;
    additionalInfo?: string;
    confirmTitle: string;
    cancelTitle?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    type,
    title=(type === 'info' ? 'Informasi' : 'Peringatan'),
    subtitle,
    description, 
    isOpen, 
    onClose,
    onConfirm=onClose,
    isPending,
    additionalInfo,
    confirmTitle,
    cancelTitle=(type === 'info' ? 'Tutup' : 'Batal')
}) => {
    if (!isOpen) return null;

    const typeConfig = {
        info: {
            icon: <BsFillInfoCircleFill size={24} />,
            iconBg: 'bg-primary/20',
            iconColor: 'text-primary',
            additionalBg: 'bg-primary/10 border-primary/30',
            additionalText: 'text-primary',
            buttonBg: 'bg-primary hover:bg-primary/90 active:bg-primary/80'
        },
        warning: {
            icon: <MdWarning size={24} />,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-700',
            additionalBg: 'bg-red-50 border-red-200',
            additionalText: 'text-red-700',
            buttonBg: 'bg-red-600 hover:bg-red-700 active:bg-red-800'
        }
    };

    const config = typeConfig[type];

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-5 py-3 border-b border-muted">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${config.iconBg}`}>
                            <span className={config.iconColor}>
                                {config.icon}
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold text-surface">
                            {title}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <BiX className="w-6 h-6 text-surface" />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4">
                    <div>
                        <h4 className="text-base font-semibold text-surface mb-0.5">
                            {subtitle}
                        </h4>
                        <p className={cn("text-sm text-surface leading-relaxed", (!subtitle || subtitle === '') && "text-base")}>
                            {description}
                        </p>
                    </div>

                    {additionalInfo && (
                        <div className={`p-4 border rounded-lg ${config.additionalBg}`}>
                            <p className={`text-sm ${config.additionalText}`}>
                                {additionalInfo}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-5 pt-0 gap-4">
                    <Button variant="outline" onClick={onClose} disabled={isPending}>
                        {cancelTitle}
                    </Button>
                    <Button
                        onClick={() => {
                            if (onConfirm) {
                                onConfirm();
                            }
                            onClose();
                        }}
                        className={config.buttonBg}
                        disabled={isPending}
                        isLoading={isPending}
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