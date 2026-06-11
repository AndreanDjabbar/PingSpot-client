/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { FaCircleCheck } from "react-icons/fa6";

interface SuccessSectionProps {
    message?: string;
    data?: any | (() => any)
}

const SuccessSection: React.FC<SuccessSectionProps> = ({ 
    message, 
    data
}) => {
    const resolvedData = typeof data === 'function' ? data() : data;

    const getDataResponseMessage = (responseData: any): string => {
        if (typeof responseData === 'string') return responseData;
        if (responseData?.message) return responseData.message;
        if (responseData?.success) return responseData.success;
        if (responseData?.data?.message) return responseData.data.message;
        return 'Operation completed successfully!';
    };

    if (!message && (!data || Object.keys(data).length === 0)) {
        return null;
    }

    const displayMessage = message || getDataResponseMessage(data);

    return (
        <div className="bg-success/20 border border-success/20 rounded-xl p-4 shadow-sm transition-all duration-300 ease-in-out">
            <div className="flex flex-col items-start justify-between">
                <div className="flex space-x-2 items-center">
                    <div className="text-success-dark">
                        <FaCircleCheck size={20} />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-sm leading-5 text-success-dark">
                            {displayMessage}
                        </p>
                    </div>
                </div>
                
                <div className='ml-7 mt-1'>
                    {resolvedData && typeof resolvedData === 'string' && (
                        <p className="text-sm text-surface/70">
                            {resolvedData}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuccessSection;