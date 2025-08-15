'use client'
import React, { useCallback } from 'react';
import { Map, AdvancedMarker } from '@vis.gl/react-google-maps';

interface ReusableMapProps {
    places: { lat: number; lng: number; clinicName: string | null }[];
    center: { lat: number; lng: number; };
    zoom?: number;
    updateLocation: (index: number, location: { lat: number; lng: number }) => void;
}

const ReusableMap: React.FC<ReusableMapProps> = ({ places, center, zoom = 12, updateLocation }) => {
    console.log("places", places)
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
                    position={{ lat: place.lat, lng: place.lng }}
                    draggable={false}
                    onDragEnd={(event) => handleMarkerDragEnd(event, index)}
                >
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: 'red',
                            borderRadius: '50%',
                            margin: '0 auto',
                        }}></div>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            marginTop: '4px',
                            fontSize: '11px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }}>
                            {place.clinicName}
                        </div>
                    </div>
                </AdvancedMarker>
                
                ))}
            </Map>
    );
};

export default ReusableMap; 