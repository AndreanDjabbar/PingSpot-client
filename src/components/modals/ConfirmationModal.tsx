"use client";
import React from 'react';
import { BiX } from 'react-icons/bi';
import { MdOutlineWarning } from 'react-icons/md';
import { FaInfoCircle } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { Button } from '../UI';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isPending: boolean;
    type: 'warning' | 'info';
    title: string;
    message: string;
    explanation?: string;
    icon: React.ReactNode;
    confirmTitle?: string;
    cancelTitle?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    isPending,
    type = 'warning',
    title = 'Konfirmasi Keluar',
    message='Apakah anda yakin?',
    explanation='Anda akan keluar dari sesi PingSpot saat ini.',
    icon,
    confirmTitle = 'Keluar',
    cancelTitle = 'Batal'
}) => {
    if (!isOpen) return null;

    const isWarning = type === 'warning';
    const iconColorClass = isWarning ? 'text-danger-dark' : 'text-surface';
    const iconBgClass = isWarning ? 'bg-danger/10' : 'bg-muted';

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-5 border-b border-muted">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 ${iconBgClass} rounded-full`}>
                            {isWarning ? (
                                <MdOutlineWarning className={`${iconColorClass}`} size={24} />
                            ) : (
                                <FaInfoCircle className={`${iconColorClass}`} size={24} />
                            )}
                        </div>
                        <h3 className={`text-xl font-semibold ${iconColorClass}`}>
                            {title}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1 rounded-full hover:bg-muted transition-colors cursor-pointer"
                        disabled={isPending}
                        aria-label="Close modal"
                    >
                        <BiX className={`w-6 h-6 ${iconColorClass}`} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <h4 className="text-base font-semibold text-surface mb-2">
                            {message}
                        </h4>
                        {explanation && (
                            <p className="text-sm text-surface leading-relaxed">
                                {explanation}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 p-5 pt-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isPending}>
                        {cancelTitle}
                    </Button>
                    
                    {isWarning ? (
                            <Button
                                onClick={onConfirm}
                                disabled={isPending}
                                variant="danger"
                                icon={isPending ? <AiOutlineLoading3Quarters className='animate-spin' size={16} /> : icon}
                                iconPosition="left"
                            >
                                {confirmTitle}
                            </Button>
                    ) : (
                        <Button
                            onClick={onConfirm}
                            disabled={isPending}
                            variant="primary"
                            icon={isPending ? <AiOutlineLoading3Quarters className='animate-spin' size={16} /> : icon}
                            iconPosition="left"
                        >
                                {confirmTitle}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
