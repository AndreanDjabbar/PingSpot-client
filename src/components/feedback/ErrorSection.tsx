/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { MdCircle } from "react-icons/md";
import { FaRegCircleXmark } from "react-icons/fa6";
import { IoMdArrowBack, IoMdRefresh, IoMdHome } from "react-icons/io";
import { Button } from '../UI';

interface ErrorSectionProps {
    message?: string;
    errors?: any;
    onRetry?: () => void;
    onGoBack?: () => void;
    onGoHome?: () => void;
    showRetryButton?: boolean;
    showBackButton?: boolean;
    showHomeButton?: boolean;
}

const ErrorSection: React.FC<ErrorSectionProps> = ({ 
    message, 
    errors, 
    onRetry,
    onGoBack,
    onGoHome,
    showRetryButton = false,
    showBackButton = false,
    showHomeButton = false
}) => {
    if (!message && (!errors || Object.keys(errors).length === 0)) {
        return null;
    }

    const renderErrorValue = (value: any): string => {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value, null, 2);
        }
        return String(value);
    };

    const formatFieldName = (key: string): string => {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .replace(/_/g, ' ');
    };

    return (
        <div className="bg-danger/20 border border-danger/20 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col">
                <div className="flex gap-2 items-center mb-3">
                    <FaRegCircleXmark size={20} className="text-danger-dark"/>
                    <h3 className="text-sm font-semibold text-danger-dark">
                        {message || 'Silahkan perbaiki kesalahan berikut:'}
                    </h3>
                </div>

                <div className="flex-1 px-1">
                    {errors && typeof errors === "string" && (
                        <div className="bg-white/90 rounded-lg px-3 py-2 border border-danger/10">
                            <p className="text-sm text-surface/90">{errors}</p>
                        </div>
                    )}

                    {errors && typeof errors === "object" && Object.keys(errors).length > 0 && (
                        <div className="space-y-2">
                            {Object.entries(errors).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="bg-white rounded-lg px-3 py-3 border border-muted shadow-sm"
                                >
                                    <div className="flex flex-col">
                                        <div className='flex gap-2 items-center mb-1'>
                                            <div className="text-danger-dark/70">
                                                <MdCircle size={8}/>
                                            </div>
                                            <p className="text-xs font-bold text-surface uppercase tracking-widest">
                                                {formatFieldName(key)}
                                            </p>
                                        </div>
                                        <p className="text-sm text-surface/80 break-words pl-[16px]">
                                            {renderErrorValue(value)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    {!errors && message && (
                        <div className="bg-white/90 rounded-lg px-3 py-2 border border-danger/10">
                            <p className="text-sm text-surface/90">
                                {message}
                            </p>
                        </div>
                    )}
                </div>

                {(showRetryButton || showBackButton || showHomeButton) && (
                    <div className="flex flex-wrap gap-2 mt-5">
                        {showRetryButton && onRetry && (
                            <Button 
                                variant='danger' 
                                icon={<IoMdRefresh size={20}/>}
                                onClick={onRetry}
                                size='sm'
                                className="rounded-lg shadow-sm"
                            >Coba Lagi</Button>
                        )}
                        
                        {showBackButton && onGoBack && (
                            <Button 
                                variant='secondary' 
                                size='sm'
                                icon={<IoMdArrowBack size={20}/>}
                                onClick={onGoBack}
                                className="rounded-lg border border-muted"
                            >Kembali</Button>
                        )}
                        
                        {showHomeButton && onGoHome && (
                            <Button 
                                variant='primary' 
                                size='sm'
                                icon={<IoMdHome size={20}/>}
                                onClick={onGoHome}
                                className="rounded-lg shadow-sm"
                            >Beranda</Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ErrorSection;