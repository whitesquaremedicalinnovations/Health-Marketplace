import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import { axiosInstance } from '@/lib/axios';

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: any) => void;
  initialAddress?: string;
}

export default function GooglePlacesAutocomplete({ onPlaceSelect, initialAddress }: GooglePlacesAutocompleteProps) {
  const [query, setQuery] = useState(initialAddress || '');
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    if (initialAddress) {
      setQuery(initialAddress);
    }
  }, [initialAddress]);

  const handleInputChange = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await axiosInstance.get(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${text}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&language=en`
        );
        setPredictions(response.data.predictions);
      } catch (error) {
        console.error('Error fetching places:', error);
      }
    } else {
      setPredictions([]);
    }
  };

  const handlePlaceSelect = async (placeId: string) => {
    try {
      const response = await axiosInstance.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}&language=en`
      );
      onPlaceSelect(response.data.result);
      setQuery(response.data.result.formatted_address);
      setPredictions([]);
    } catch (error) {
      console.error('Error fetching place details:', error);
    }
  };

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={handleInputChange}
        placeholder="Search for a location"
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10 }}
      />
      <FlatList
        data={predictions}
        keyExtractor={(item: any) => item.place_id}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity onPress={() => handlePlaceSelect(item.place_id)}>
            <Text style={{ padding: 10 }}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
} 