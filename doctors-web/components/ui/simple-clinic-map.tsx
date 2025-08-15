'use client'
import React from 'react';
import { Map, Marker } from '@vis.gl/react-google-maps';

interface SimpleClinicMapProps {
    clinics: Array<{
        id: string;
        clinicName: string;
        latitude?: number;
        longitude?: number;
        totalActiveJobs: number;
    }>;
    userLocation: { lat: number; lng: number } | null;
    center: { lat: number; lng: number };
    onClinicClick?: (clinicId: string) => void;
    zoom?: number;
}

const SimpleClinicMap: React.FC<SimpleClinicMapProps> = ({ 
    clinics, 
    userLocation, 
    center, 
    onClinicClick,
    zoom = 12 
}) => {
    console.log('SimpleClinicMap rendered with:', {
        clinicsCount: clinics.length,
        userLocation,
        center,
        zoom
    });

    return (
        <div className="w-full h-full">
            <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={center}
                defaultZoom={zoom}
                gestureHandling={'greedy'}
                disableDefaultUI={false}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        title="Your Location"
                        icon={{
                            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                            fillColor: '#3B82F6',
                            fillOpacity: 1,
                            strokeColor: '#1E40AF',
                            strokeWeight: 2,
                            scale: 1.5,
                        }}
                    />
                )}

                {/* Clinic Markers */}
                {clinics.map((clinic) => {
                    if (!clinic.latitude || !clinic.longitude) return null;
                    
                    return (
                        <Marker
                            key={clinic.id}
                            position={{ lat: clinic.latitude, lng: clinic.longitude }}
                            title={clinic.clinicName}
                            onClick={() => onClinicClick?.(clinic.id)}
                            icon={{
                                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                                fillColor: clinic.totalActiveJobs > 0 ? '#10B981' : '#6B7280',
                                fillOpacity: 1,
                                strokeColor: clinic.totalActiveJobs > 0 ? '#059669' : '#4B5563',
                                strokeWeight: 2,
                                scale: 1.2,
                            }}
                        />
                    );
                })}
            </Map>
        </div>
    );
};

export default SimpleClinicMap; 