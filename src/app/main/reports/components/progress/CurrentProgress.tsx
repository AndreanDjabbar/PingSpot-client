import { IReportProgress } from "@/types"
import { getFormattedDate, getImageURL } from "@/utils";
import Image from "next/image";
import React from "react"

interface CurrentProgressProps {
    reportProgress: IReportProgress[];
    handleImageClick: (imageUrl: string) => void;
}

const CurrentProgress: React.FC<CurrentProgressProps> = ({
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'RESOLVED':
                return 'bg-green-700 border-green-700 text-white';
            case 'WAITING_CONFIRMATION':
                return 'bg-sky-600 border-sky-600 text-white';
            case 'EXPIRED':
                return 'bg-indigo-700 text-white';
            case 'ON_PROGRESS':
                return 'bg-yellow-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const latestProgress = reportProgress[0];
    const latestImages = [
        latestProgress.attachment1,
        latestProgress.attachment2
    ].filter((url): url is string => typeof url === 'string' && url.length > 0);
    return (
        <div>
            <div className="bg-primary/10 rounded-lg p-4 border border-primary">
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">Perkembangan Terakhir</p>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            getStatusColor(latestProgress.status)
                        }`}>
                            {getStatusLabel(latestProgress.status)}
                        </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">
                        {getFormattedDate(latestProgress.createdAt, {
                            formatStr: 'dd MMMM yyyy - HH:mm',
                        })}
                    </p>
                    
                    {latestProgress.notes && (
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">
                            {latestProgress.notes}
                        </p>
                    )}
                    
                    {latestImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {latestImages.map((imageUrl, imgIndex) => (
                                <div 
                                    key={imgIndex}
                                    className="relative aspect-video rounded-lg overflow-hidden bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => onImageClick(`report/progress/${imageUrl}`)}
                                >
                                    <Image
                                        src={getImageURL(`/report/progress/${imageUrl}`, "main")}
                                        alt={`Latest progress - Image ${imgIndex + 1}`}
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
    )
}

export default CurrentProgress