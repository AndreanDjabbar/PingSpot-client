import React from 'react';
import dynamic from 'next/dynamic';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { BiInfoCircle } from 'react-icons/bi';
import 'leaflet/dist/leaflet.css';
import { useTranslations } from 'next-intl';

const DynamicMap = dynamic(() => import('../../../../../../../components/UI/DynamicMap'), {
    ssr: false,
});

interface MapStepProps {
    onMarkerPositionChange: (position: { lat: number; lng: number } | null) => void;
    markerPosition: { lat: number; lng: number } | null;
    latitudeError?: string;
    longitudeError?: string;
    isDisabledStatus?: boolean;
    isResolvedStatus: boolean;
    onOpenInfo?: () => void;
}

const MapStep: React.FC<MapStepProps> = ({ 
    onMarkerPositionChange,
    markerPosition,
    latitudeError, 
    longitudeError,
    isDisabledStatus = false,
    isResolvedStatus,
    onOpenInfo
}) => {
    const t = useTranslations('report.edit_report_page.map_step');
    return (
        <div>
            <div className="w-full bg-gray-100 rounded-lg p-4 border-2 border-dashed border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    {isDisabledStatus || isResolvedStatus ? (
                        <div className='flex items-center gap-2'>
                            {t('title_disabled')}
                            <button
                                type="button"
                                onClick={onOpenInfo}
                                aria-label={t('info_button_aria')}
                                title={t('info_button_title')}
                                className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded"
                            >
                                <BiInfoCircle className="w-5 h-5" aria-hidden="true" />
                                <span className="sr-only">{t('info_sr_label')}</span>
                            </button>
                        </div>
                    ) : (
                        <>
                            <FaMapMarkerAlt className="mr-2 text-gray-700" />
                            {t('title_editable')}
                        </>
                    )}
                </h2>
                
                {isDisabledStatus || isResolvedStatus ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4">
                        <p className="text-gray-600 text-sm leading-relaxed">
                            {t('description_disabled')}
                        </p>
                    </div>
                ) : (
                    <p className="text-gray-600 mb-4 text-sm">
                        {t('description_editable')}
                    </p>
                )}
                
                <div className="h-[400px] w-full mb-4">
                    <DynamicMap 
                        onMarkerPositionChange={onMarkerPositionChange}
                        initialMarker={markerPosition}
                        disabled={isDisabledStatus || isResolvedStatus}
                    />
                </div>
            </div>
            <div className="text-red-500 text-sm font-semibold">
                {latitudeError || longitudeError}
            </div>
        </div>
    );
};

export default MapStep;
