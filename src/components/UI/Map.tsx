"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo } from 'react'
import { FaMap, FaMapPin, FaSpinner } from 'react-icons/fa'
import camelize from 'camelize';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import { useLocationStore } from '@/stores';
import { useCurrentLocation, useErrorToast, useReverseCurrentLocation } from '@/hooks';
import { ErrorSection } from '../feedback';
import { getDataResponseDetails, getErrorResponseDetails, getErrorResponseMessage } from '@/utils';
import { useTranslations } from 'next-intl';

interface ReverseLocationResponse {
    display_name?: string;
    address?: {
        tourism?: string;
        road?: string;
        residential?: string;
        hamlet?: string;
        city?: string;
        [key: string]: string | undefined;
    };
}

const Map = () => {
    const t = useTranslations('component.map.map');
    const { mutate: reverseLocation, data, isPending: reverseLoading } = useReverseCurrentLocation();
    const { location, isError, error, loading, permissionDenied, isPermissionDenied, requestLocation, isUpdateRequest } = useCurrentLocation();
    const setLocationStore = useLocationStore((state) => state.setLocation);
    const clearLocationStore = useLocationStore((state) => state.clearLocation);
    
    useErrorToast(isError, error);
    useErrorToast(isPermissionDenied, permissionDenied);

    const customIcon = useMemo(() => new L.Icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    }), []);

    const mapCenter = useMemo(() => {
        if (!location) return [0, 0];
        return [Number(location.lat), Number(location.lng)];
    }, [location?.lat, location?.lng]);

    const mapKey = location 
    ? `${location.lat}-${location.lng}`
    : 'no-location';
    
    useEffect(() => {
        if (location && location.expiresAt) {
            const now = Date.now()
            const isExpired = now > location.expiresAt;
            if (isExpired) {
                clearLocationStore();
            }
        }
    }, []);

    useEffect(() => {
        if (location) {
            if (!location.displayName || !location.address || isUpdateRequest) {
                reverseLocation({
                    latitude: location.lat,
                    longitude: location.lng
                });
            }
        }
    }, [location?.lat, location?.lng, location?.lastUpdated, reverseLocation, isUpdateRequest]);

    useEffect(() => {
        if (data) {
            const locationData = camelize(getDataResponseDetails(data));
            setLocationStore({
                ...location,
                lat: location?.lat ?? "",
                lng: location?.lng ?? "",
                lastUpdated: location?.lastUpdated || new Date().toLocaleString(),
                displayName: locationData.displayName || locationData.display_name,
                address: locationData.address || null,
                type: locationData.type || null,
                name: locationData.name || null,
                osmType: locationData.osmType || null,
                osmId: locationData.osmId || null,
            });
        }
    }, [data, setLocationStore]);

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 shadow-lg p-6 flex flex-col gap-6">
            <div>
                {isPermissionDenied && (
                    <ErrorSection 
                        message={getErrorResponseMessage(permissionDenied)} 
                        errors={getErrorResponseDetails(permissionDenied)}
                    />
                )}
            </div>
            <div className='flex w-full justify-between items-start'>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <FaMap className="w-6 h-6 text-primary mr-2" />
                    {t('title')}
                </h2>
                <div className="flex flex-col items-end">
                    {!location &&  <>
                        <button
                            className="bg-primary text-white hover:bg-primary/90 px-6 py-2 rounded-lg transition-colors"
                            disabled={loading}
                            onClick={() => requestLocation(false)}
                        >
                            {loading ? (
                                <div className='flex items-center gap-2'>
                                    <FaSpinner className='animate-spin'/> 
                                    {t('buttons.requesting_location')}
                                </div>
                            )
                            : t('buttons.grant_location_access')}
                        </button>
                    </>}
                    {location && (
                        <div className='flex flex-col items-center gap-2'>
                            <button 
                                className="bg-primary flex items-center px-6 py-2 gap-2 text-white rounded-lg hover:bg-primary/90 transition-colors"
                                onClick={() => requestLocation(true)}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <FaSpinner className="w-4 h-4 animate-spin" />
                                        <span className="text-sm font-medium">{t('buttons.updating')}</span>
                                    </>
                                ) : (
                                    <>
                                        <FaMapPin className="w-4 h-4" />
                                        <span className="text-sm font-medium">{t('buttons.update_location')}</span>
                                    </>
                                )}
                            </button>
                            <p className='text-xs text-gray-500'>{t('last_updated', { timestamp: location.lastUpdated || '' })}</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-linear-to-br from-primary/10 to-indigo-100 rounded-lg p-8 text-center border-2 border-dashed border-primary/30">
                <div className='h-96 w-full'>
                    {location ? (
                        <MapContainer 
                            center={mapCenter as [number, number]} 
                            zoom={13} 
                            scrollWheelZoom={false}
                            style={{ height: '100%', width: '100%' }}
                            key={mapKey}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker 
                            position={[Number(location.lat), Number(location.lng)]}
                            icon={customIcon}
                            >
                                <Popup>
                                    {t('your_location_popup.line1')} <br /> {location.displayName || t('your_location_popup.fallback')}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <div className="text-center">
                                <FaMapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>{t('empty_state.message')}</p>
                                <p className="text-sm">{t('empty_state.hint')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {location && (
                <div className='bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3'>
                    {reverseLoading ? (
                        <div className="flex items-center justify-center space-x-2 text-gray-600">
                            <FaSpinner className="w-3 h-3 animate-spin" />
                            <span className="text-xs">{t('address.searching')}</span>
                        </div>
                    ) : data || location.displayName || location.address ? (
                        <div className="text-xs text-green-600 flex flex-col gap-2">
                            <p className="flex items-center gap-1 p-1 text-green-700 font-semibold">
                            <FaMapPin className="text-red-500" />
                            {t('address.your_location_label')}
                            </p>
                            <div className="">
                                {(data as ReverseLocationResponse)?.display_name || location.displayName || t('address.not_found')}
                            </div>
                        </div>
                    ) : (
                        <div className="text-xs text-green-600">
                            <div>{t('address.lat_label', { lat: location?.lat || '' })}</div>
                            <div>{t('address.lng_label', { lng: location?.lng || '' })}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Map