'use client'
import React, { useCallback } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface ReusableMapProps {
    places: { lat: number; lng: number; }[];
    center: { lat: number; lng: number; };
    zoom?: number;
    updateLocation: (index: number, location: { lat: number; lng: number }) => void;
}

const ReusableMap: React.FC<ReusableMapProps> = ({ places, center, zoom = 12, updateLocation }) => {
    const handleMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent, index: number) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat !== undefined && lng !== undefined) {
            updateLocation(index, { lat, lng });
        }
    }, [updateLocation]);

    return (
            <Map
                style={{ width: '100%', height: '400px' }}
                defaultCenter={center}
                defaultZoom={zoom}
                gestureHandling={'greedy'}
                disableDefaultUI={true}
                mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
            >
                {places.map((place, index) => (
                    <AdvancedMarker
                        key={index}
                        position={place}
                        draggable={true}
                        onDragEnd={(event) => handleMarkerDragEnd(event, index)}
                    />
                ))}
            </Map>
    );
};

export default ReusableMap; 