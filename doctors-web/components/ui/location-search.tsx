'use client';

import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { MapPin } from 'lucide-react';

interface LocationSearchProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  value: string;
  onChange: (value: string) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onPlaceSelect, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
        types: [],
    });

    autocomplete.addListener('place_changed', () => {
        onPlaceSelect(autocomplete.getPlace());
    });
  }, [places, onPlaceSelect]);

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        id="locationSearch"
        ref={inputRef}
        placeholder="Enter location..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 h-12"
      />
    </div>
  );
};

export default LocationSearch; 