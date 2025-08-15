'use client'
import React, { useCallback, useState } from 'react';
import { Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';

interface ReusableMapProps {
    places: { lat: number; lng: number; name?: string | null }[];
    center: { lat: number; lng: number; };
    zoom?: number;
    updateLocation: (index: number, location: { lat: number; lng: number }) => void;
}

const ReusableMap: React.FC<ReusableMapProps> = ({ places, center, zoom = 12, updateLocation }) => {
    const [selectedPlace, setSelectedPlace] = useState<number | null>(null);

    const handleMarkerDragEnd = useCallback((event: google.maps.MapMouseEvent, index: number) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat !== undefined && lng !== undefined) {
            updateLocation(index, { lat, lng });
        }
    }, [updateLocation]);

    return (
        <Map
            style={{ width: '100%', height: '100%' }}
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
                    onClick={() => setSelectedPlace(index)}
                />
            ))}
            {selectedPlace !== null && places[selectedPlace] && (
                <InfoWindow
                    position={places[selectedPlace]}
                    onCloseClick={() => setSelectedPlace(null)}
                >
                    <div>{places[selectedPlace].name}</div>
                </InfoWindow>
            )}
        </Map>
    );
};

export default ReusableMap; 