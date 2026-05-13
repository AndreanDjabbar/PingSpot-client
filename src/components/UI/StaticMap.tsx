"use client";

import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StaticMapProps {
    latitude: number;
    longitude: number;
    height?: string | number;
    width?: string | number;
    zoom?: number;
    markerColor?: string;
    popupText?: string;
    className?: string;
}

const StaticMap: React.FC<StaticMapProps> = ({
    latitude,
    longitude,
    height = '200px',
    width = '100%',
    markerColor = 'blue',
    zoom = 15,
    popupText = 'Lokasi',
    className = ''
}) => {
    const createPrimaryIcon = () => {
        const svgIcon = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
                <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="#6C5CE7"/>
                <circle cx="12.5" cy="12.5" r="4.5" fill="white"/>
            </svg>
        `;
        const blob = new Blob([svgIcon], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        return new L.Icon({
            iconUrl: url,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
        });
    };

    const customIcon = useMemo(() => createPrimaryIcon(), [markerColor]);


    const mapKey = `map-${latitude}-${longitude}`;

    const containerStyle = {
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
    };

    return (
        <div className={`relative overflow-hidden rounded-lg ${className}`} style={containerStyle}>
            <MapContainer 
                center={[latitude, longitude]} 
                zoom={zoom} 
                scrollWheelZoom={false}
                zoomControl={true}
                attributionControl={false}
                dragging={true}
                doubleClickZoom={false}
                style={{ height: '100%', width: '100%' }}
                key={mapKey}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker 
                    position={[latitude, longitude]}
                    icon={customIcon}
                >
                    <Popup>
                        {popupText}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}

export default StaticMap;