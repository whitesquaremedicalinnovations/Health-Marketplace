'use client';

import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useCallback } from 'react';
import ReusableMap from './ui/reusable-map';
import { Button } from './ui/button';
import AddressAutocomplete from './ui/address-autocomplete';
import { toast } from 'sonner';

interface OnboardingMapSectionProps {
    clinicAddress: string;
    setClinicAddress: (address: string) => void;
    clinicLocation: { lat: number, lng: number } | null;
    setClinicLocation: (location: { lat: number, lng: number } | null) => void;
    mapCenter: { lat: number, lng: number };
    setMapCenter: (center: { lat: number, lng: number }) => void;
}

const OnboardingMapSection: React.FC<OnboardingMapSectionProps> = ({
    clinicAddress,
    setClinicAddress,
    clinicLocation,
    setClinicLocation,
    mapCenter,
    setMapCenter
}) => {
    const geocodingLibrary = useMapsLibrary('geocoding');

    const handleSetCurrentLocation = useCallback(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setClinicLocation({ lat: latitude, lng: longitude });
                setMapCenter({ lat: latitude, lng: longitude });
            },
            (error) => {
                console.log('Error obtaining location:', error);
                toast('Unable to retrieve your location. Please ensure location services are enabled.');
            }
        );
    }, [setClinicLocation, setMapCenter]);

    const updateLocation = (index: number, location: { lat: number, lng: number }) => {
        setClinicLocation(location);
        setMapCenter(location);
    };

    useEffect(() => {
        handleSetCurrentLocation();
    }, [handleSetCurrentLocation]);

    useEffect(() => {
        if (!geocodingLibrary || !clinicLocation) return;

        const geocoder = new geocodingLibrary.Geocoder();
        geocoder.geocode({ location: clinicLocation }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
                setClinicAddress(results[0].formatted_address);
            }
        });
    }, [geocodingLibrary, clinicLocation, setClinicAddress]);

    useEffect(() => {
        if (clinicLocation) {
            setMapCenter(clinicLocation);
        }
    }, [clinicLocation, setMapCenter]);


    return (
        <>
            <div className="space-y-2">
                <AddressAutocomplete
                    value={clinicAddress}
                    onChange={setClinicAddress}
                    onPlaceSelect={(place) => {
                        if (place?.geometry?.location) {
                            const lat = place.geometry.location.lat();
                            const lng = place.geometry.location.lng();
                            setClinicLocation({ lat, lng });
                            setMapCenter({ lat, lng });
                            setClinicAddress(place.formatted_address || '');
                        }
                    }}
                />
            </div>
            <Button type="button" variant="outline" onClick={handleSetCurrentLocation} className="mt-2">
                Use Current Location
            </Button>
            <div className="space-y-2 mt-4 ">
                <ReusableMap
                    places={clinicLocation ? [clinicLocation] : []}
                    center={mapCenter}
                    updateLocation={updateLocation}
                />
            </div>
        </>
    )
}

export default OnboardingMapSection; 