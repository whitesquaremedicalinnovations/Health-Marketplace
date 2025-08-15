'use client'
import React from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { Building, MapPin } from 'lucide-react';

interface ClinicMapProps {
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

const ClinicSearchMap: React.FC<ClinicMapProps> = ({ 
    clinics, 
    userLocation, 
    center, 
    onClinicClick,
    zoom = 12 
}) => {
    console.log('ClinicSearchMap rendered with:', {
        clinicsCount: clinics.length,
        userLocation,
        center,
        zoom
    });

    return (
        <Map
            style={{ width: '100%', height: '500px' }}
            defaultCenter={center}
            defaultZoom={zoom}
            gestureHandling={'greedy'}
            disableDefaultUI={false}
            className="rounded-lg"
        >
            {/* User Location Marker */}
            {userLocation && (
                <AdvancedMarker
                    position={userLocation}
                    title="Your Location"
                >
                    <Pin 
                        background={'#3B82F6'} 
                        borderColor={'#1E40AF'} 
                        glyphColor={'white'}
                    >
                        <MapPin className="h-4 w-4" />
                    </Pin>
                </AdvancedMarker>
            )}

            {/* Clinic Markers */}
            {clinics.map((clinic) => {
                if (!clinic.latitude || !clinic.longitude) return null;
                
                return (
                    <AdvancedMarker
                        key={clinic.id}
                        position={{ lat: clinic.latitude, lng: clinic.longitude }}
                        title={clinic.clinicName}
                        onClick={() => onClinicClick?.(clinic.id)}
                    >
                        <Pin 
                            background={clinic.totalActiveJobs > 0 ? '#10B981' : '#6B7280'} 
                            borderColor={clinic.totalActiveJobs > 0 ? '#059669' : '#4B5563'} 
                            glyphColor={'white'}
                        >
                            <Building className="h-4 w-4" />
                        </Pin>
                    </AdvancedMarker>
                );
            })}
        </Map>
    );
};

export default ClinicSearchMap; 