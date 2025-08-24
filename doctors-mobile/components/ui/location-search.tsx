import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  MapPin,
  X,
  ArrowLeft,
  Navigation,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

interface LocationSearchProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (place: PlaceResult | null, coordinates?: {lat: number, lng: number}) => void;
  placeholder?: string;
}

interface PlaceResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlaceResult {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
}

export default function LocationSearch({
  value,
  onChange,
  onPlaceSelect,
  placeholder = 'Enter location...',
}: LocationSearchProps) {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [predictions, setPredictions] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Google Places API key - you'll need to add this to your environment
  const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const searchPlaces = async (input: string) => {
    if (!input.trim() || input.length < 3) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&types=geocode&key=${GOOGLE_PLACES_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        setPredictions(data.predictions);
      } else {
        console.log('Places API error:', data.status);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const getPlaceDetails = async (placeId: string): Promise<PlaceResult | null> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address&key=${GOOGLE_PLACES_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        const place = data.result as GooglePlaceResult;
        
        // Create a simplified place result
        const placeResult: PlaceResult = {
          place_id: place.place_id,
          description: place.formatted_address,
          structured_formatting: {
            main_text: place.name,
            secondary_text: place.formatted_address,
          },
        };
        
        onChange(place.formatted_address);
        
        // Pass coordinates along with the place result
        const coordinates = {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        };
        
        onPlaceSelect?.(placeResult, coordinates);
        setShowModal(false);
        setSearchTerm('');
        setPredictions([]);
        
        return placeResult;
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to get location details',
      });
    }
    return null;
  };

  const handleSearch = (text: string) => {
    setSearchTerm(text);
    searchPlaces(text);
  };

  const handleLocationSelect = async (prediction: PlaceResult) => {
    await getPlaceDetails(prediction.place_id);
  };

  const clearLocation = () => {
    onChange('');
    onPlaceSelect?.(null, undefined);
  };

  const useCurrentLocation = () => {
    onChange('Current Location');
    onPlaceSelect?.(null, undefined); // This will trigger using current location
    setShowModal(false);
  };

  const handleInputPress = () => {
    setShowModal(true);
    // Focus the input after modal opens
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleInputPress}
        className="flex-1 bg-gray-50 rounded-xl flex-row items-center px-4 py-3"
      >
        <MapPin size={20} color="#9ca3af" />
        <Text className="flex-1 ml-3 text-gray-900">
          {value || placeholder}
        </Text>
        {value && (
          <TouchableOpacity onPress={clearLocation} className="ml-2">
            <X size={16} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          {/* Header */}
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            style={{ 
              paddingHorizontal: 20, 
              paddingTop: 20, 
              paddingBottom: 20,
            }}
          >
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
              >
                <ArrowLeft size={20} color="white" />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-white">Search Location</Text>
              <View className="w-10 h-10" />
            </View>
          </LinearGradient>

          {/* Search Input */}
          <View className="p-4 border-b border-gray-200">
            <View className="bg-gray-50 rounded-xl flex-row items-center px-4 py-3">
              <Search size={20} color="#9ca3af" />
              <TextInput
                ref={inputRef}
                placeholder="Type to search locations..."
                value={searchTerm}
                onChangeText={handleSearch}
                className="flex-1 ml-3 text-gray-900"
                placeholderTextColor="#9ca3af"
                autoFocus
              />
              {loading && (
                <ActivityIndicator size="small" color="#3b82f6" />
              )}
            </View>
          </View>

          {/* Current Location Option */}
          <TouchableOpacity
            onPress={useCurrentLocation}
            className="p-4 border-b border-gray-100 flex-row items-center bg-blue-50"
          >
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Navigation size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-blue-900 font-medium">Use Current Location</Text>
              <Text className="text-blue-700 text-sm">GPS location</Text>
            </View>
          </TouchableOpacity>

          {/* Results */}
          <ScrollView className="flex-1">
            {predictions.length > 0 ? (
              predictions.map((prediction) => (
                <TouchableOpacity
                  key={prediction.place_id}
                  onPress={() => handleLocationSelect(prediction)}
                  className="p-4 border-b border-gray-100 flex-row items-center"
                >
                  <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                    <MapPin size={20} color="#6b7280" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      {prediction.structured_formatting.main_text}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {prediction.structured_formatting.secondary_text}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : searchTerm.length >= 3 && !loading ? (
              <View className="flex-1 justify-center items-center p-8">
                <MapPin size={48} color="#9ca3af" />
                <Text className="text-gray-500 text-lg font-medium mt-4">No locations found</Text>
                <Text className="text-gray-400 text-center mt-2">
                  Try searching for a different location
                </Text>
              </View>
            ) : searchTerm.length < 3 && searchTerm.length > 0 ? (
              <View className="flex-1 justify-center items-center p-8">
                <Text className="text-gray-500 text-lg font-medium">Type at least 3 characters</Text>
                <Text className="text-gray-400 text-center mt-2">
                  to search for locations
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
} 
