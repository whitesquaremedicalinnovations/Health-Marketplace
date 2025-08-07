'use client';

import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';
import { Input } from './input';
import { Label } from './label';

interface AddressAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  value: string;
  onChange: (value: string) => void;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ onPlaceSelect, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const autocomplete = new places.Autocomplete(inputRef.current, {
        types: ['address']
    });

    autocomplete.addListener('place_changed', () => {
        onPlaceSelect(autocomplete.getPlace());
    });
  }, [places, onPlaceSelect]);

  return (
    <div className="space-y-2">
      <Label htmlFor="clinicAddress">Clinic Address</Label>
      <Input
        id="clinicAddress"
        ref={inputRef}
        placeholder="123 Health St, Medtown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};

export default AddressAutocomplete; 