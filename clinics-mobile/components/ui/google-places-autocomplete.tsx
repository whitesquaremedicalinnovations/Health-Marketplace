import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator 
} from 'react-native';
import { axiosInstance } from '@/lib/axios';

interface GooglePlacesAutocompleteProps {
  onPlaceSelect: (place: any) => void;
  initialAddress?: string;
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
  error?: boolean;
}

export default function GooglePlacesAutocomplete({ 
  onPlaceSelect, 
  initialAddress, 
  onChange,
  value,
  placeholder = "Search for a location",
  error = false
}: GooglePlacesAutocompleteProps) {
  const [query, setQuery] = useState(initialAddress || value || '');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (initialAddress) {
      setQuery(initialAddress);
    }
  }, [initialAddress]);

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const handleInputChange = async (text: string) => {
    setQuery(text);
    onChange?.(text);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (text.length > 2) {
      setLoading(true);
      setShowPredictions(true);
      
      // Debounce API calls
      debounceRef.current = setTimeout(async () => {
        try {
          const response = await axiosInstance.get(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${"AIzaSyCJOf56DvpaMPweP-6zP_iYV_k8hjmHxFs"}&language=en&types=address`
          );
          setPredictions(response.data.predictions || []);
        } catch (error) {
          console.error('Error fetching places:', error);
          setPredictions([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setPredictions([]);
      setShowPredictions(false);
      setLoading(false);
    }
  };

  const handlePlaceSelect = async (placeId: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${"AIzaSyCJOf56DvpaMPweP-6zP_iYV_k8hjmHxFs"}&language=en&fields=formatted_address,geometry,place_id,name`
      );
      const place = response.data.result;
      onPlaceSelect(place);
      setQuery(place.formatted_address);
      onChange?.(place.formatted_address);
      setPredictions([]);
      setShowPredictions(false);
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      position: 'relative',
      zIndex: 1000,
    },
    input: {
      borderWidth: 1,
      borderColor: error ? '#EF4444' : '#E5E7EB',
      borderRadius: 6,
      padding: 10,
      fontSize: 16,
      color: '#000000',
      backgroundColor: '#FFFFFF',
    },
    inputFocused: {
      borderColor: '#2563EB',
    },
    predictionsContainer: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: 6,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderTopWidth: 0,
      maxHeight: 200,
      zIndex: 1001,
    },
    predictionItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    predictionText: {
      fontSize: 14,
      color: '#000000',
    },
    predictionSecondary: {
      fontSize: 12,
      color: '#9CA3AF',
      marginTop: 2,
    },
    loadingContainer: {
      padding: 10,
      alignItems: 'center',
    },
    noResultsContainer: {
      padding: 10,
      alignItems: 'center',
    },
    noResultsText: {
      fontSize: 14,
      color: '#9CA3AF',
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={handleInputChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        style={[
          styles.input,
          showPredictions && styles.inputFocused
        ]}
        autoCapitalize="none"
        autoCorrect={false}
      />
      
      {showPredictions && (
        <View style={styles.predictionsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2563EB" />
            </View>
          ) : predictions.length > 0 ? (
            <View>
              {predictions.map((item: any) => (
                <TouchableOpacity 
                  key={item.place_id}
                  style={styles.predictionItem}
                  onPress={() => handlePlaceSelect(item.place_id)}
                >
                  <Text style={styles.predictionText}>{item.description}</Text>
                  {item.structured_formatting?.secondary_text && (
                    <Text style={styles.predictionSecondary}>
                      {item.structured_formatting.secondary_text}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : query.length > 2 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No results found</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
} 