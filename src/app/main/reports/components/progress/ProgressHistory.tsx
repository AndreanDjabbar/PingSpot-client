import { IReportProgress } from "@/types/model/report"
import { getFormattedDate, getImageURL } from "@/utils";
import Image from "next/image";
import React from "react"
import { BiX } from "react-icons/bi";
import { MdDone } from "react-icons/md";
import { RiProgress3Fill } from "react-icons/ri";

interface ProgressHistoryProps {
    reportProgress: IReportProgress[];
    handleImageClick: (imageUrl: string) => void;
}

const ProgressHistory: React.FC<ProgressHistoryProps> = ({
    reportProgress,
    handleImageClick,
}) => {
    const onImageClick = (imageUrl: string) => {
        handleImageClick(imageUrl);
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'Terselesaikan';
            case 'EXPIRED':
                return 'Kadaluarsa';
            case 'WAITING_CONFIRMATION':
                return 'Menunggu Konfirmasi';
            case 'ON_PROGRESS':
                return 'Sedang Diproses';
            default:
                return 'Belum Diproses';
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'RESOLVED') return <MdDone className='text-white' size={20} />;
        if (status === 'ON_PROGRESS') return <RiProgress3Fill className='text-white' size={20} />;
        return <BiX className='text-white' size={20} />;
    };

    const getStatusIconBg = (status: string) => {
        if (status === 'RESOLVED') return 'bg-green-700';
        if (status === 'ON_PROGRESS') return 'bg-yellow-600';
        if (status === 'WAITING_CONFIRMATION') return 'bg-sky-600';
        return 'bg-red-700';
    };

    const getStatusCardStyle = (status: string) => {
        if (status === 'RESOLVED') return 'bg-green-50 border-green-200';
        if (status === 'ON_PROGRESS') return 'bg-yellow-50 border-yellow-200';
        if (status === 'WAITING_CONFIRMATION') return 'bg-sky-50 border-sky-200';
        return 'bg-red-50 border-red-200';
    };

    const getStatusTextColor = (status: string) => {
        if (status === 'RESOLVED') return 'text-green-700';
        if (status === 'ON_PROGRESS') return 'text-yellow-700';
        if (status === 'WAITING_CONFIRMATION') return 'text-sky-700';
        return 'text-red-700';
    };

    return (
        <div>
            <div className="max-h-[500px] overflow-y-auto mt-2">
                <div className="space-y-4">
                    <div className="relative">
                        {reportProgress.map((progress, index) => {
                            const isLast = index === reportProgress.length - 1;
                            const progressImages = [
                                progress.attachment1,
                                progress.attachment2
                            ].filter((url): url is string => typeof url === 'string' && url.length > 0);

                            return (
                                <div key={`${progress.id}-${index}`} className="relative pb-6">
                                    {!isLast && (
                                        <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-gray-200"></div>
                                    )}

                                    <div className="flex items-start gap-3">
                                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${getStatusIconBg(progress.status)}`}>
                                            {getStatusIcon(progress.status)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className={`rounded-lg p-3 border ${getStatusCardStyle(progress.status)}`}>
                                                <div className="flex items-center justify-between mb-2 lg:flex-col lg:items-start 2xl:flex-row">
                                                    <span className={`text-xs font-bold uppercase tracking-wide ${getStatusTextColor(progress.status)}`}>
                                                        {getStatusLabel(progress.status)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {getFormattedDate(progress.createdAt, {
                                                            formatStr: 'dd MMM yyyy - HH:mm',
                                                        })}
                                                    </span>
                                                </div>

                                                {progress.notes && (
                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                        {progress.notes}
                                                    </p>
                                                )}

                                                {progressImages.length > 0 && (
                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                        {progressImages.map((imageUrl, imgIndex) => (
                                                            <div
                                                                key={`${imgIndex}-${index}`}
                                                                className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                                onClick={() => onImageClick(`report/progress/${imageUrl}`)}
                                                            >
                                                                <Image
                                                                    src={getImageURL(`/report/progress/${imageUrl}`, "main")}
                                                                    alt={`Progress ${index + 1} - Image ${imgIndex + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProgressHistory