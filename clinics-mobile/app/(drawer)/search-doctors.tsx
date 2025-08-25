import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCallback, useEffect, useState } from "react";

import { useUser } from "@clerk/clerk-expo";
import { Picker } from "@react-native-picker/picker"; 
import Slider from "@react-native-community/slider";
import * as Location from 'expo-location';
import {
  Briefcase,
  LocateFixed,
  MapPin,
  Search,
  SlidersHorizontal,
  User as UserIcon,
  X,
} from "lucide-react-native";

import { getClinic , getDoctorsByLocation } from "../../lib/utils";
import { useRouter } from "expo-router";
import GooglePlacesAutocomplete from "@/components/ui/google-places-autocomplete";
import Toast from "react-native-toast-message";

interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  experience: number;
  address: string;
  profileImage: string | null;
  distance?: number;
}

interface PlaceDetails {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address: string;
}

export default function SearchDoctorsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("nearest");
  const [experienceRange, setExperienceRange] = useState([0, 50]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [radius, setRadius] = useState(50);
  const [customLocation, setCustomLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [customLocationAddress, setCustomLocationAddress] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  // Specializations list
  const SPECIALIZATIONS = [
    'GENERAL_PHYSICIAN',
    'CARDIOLOGIST', 
    'DERMATOLOGIST',
    'ENDOCRINOLOGIST',
    'GYNECOLOGIST',
    'NEUROSURGEON',
    'ORTHOPEDIC_SURGEON',
    'PLASTIC_SURGEON',
    'UROLOGIST',
    'ENT_SPECIALIST',
    'PEDIATRICIAN',
    'PSYCHIATRIST',
    'DENTIST'
  ];

  // Filter and search logic
  useEffect(() => {
    let filtered = doctors;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Specialization filter
    if (selectedSpecializations.length > 0) {
      filtered = filtered.filter(doctor => selectedSpecializations.includes(doctor.specialization));
    }

    // Experience range filter
    filtered = filtered.filter(doctor => 
      doctor.experience >= experienceRange[0] && doctor.experience <= experienceRange[1]
    );

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nearest":
          return (a.distance || 999999) - (b.distance || 999999);
        case "experience":
          return b.experience - a.experience;
        case "name":
          return a.fullName.localeCompare(b.fullName);
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, selectedSpecializations, experienceRange, sortBy]);

  const fetchClinicAndDoctors = useCallback(async () => {
    setLoading(true);
    if (!user?.id) return;

    try {
      let searchLat: number, searchLng: number;

      if (customLocation) {
        searchLat = customLocation.lat;
        searchLng = customLocation.lng;
      } else {
        const response = await getClinic(user.id);
        const clinicData = response.data?.success
          ? response.data.data
          : response.data.clinic;
        if (!clinicData?.latitude || !clinicData?.longitude) {
          console.log("User location not available");
          setDoctors([]);
          setLoading(false);
          return;
        }
        searchLat = clinicData.latitude;
        searchLng = clinicData.longitude;
      }

      // Only fetch with location and radius, do filtering client-side
      const fetchedDoctors = await getDoctorsByLocation(
        searchLat,
        searchLng,
        radius,
        0, // experience_min - don't filter on server
        50, // experience_max - don't filter on server
        "nearest", // sortBy - don't sort on server
        "", // search - don't search on server
        undefined // specializations - don't filter on server
      );
      setDoctors(fetchedDoctors || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [
    user,
    radius,
    customLocation,
  ]); // Only depend on location-related changes

  // Get current location on component mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          return;
        }

        // Get current position
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const { latitude, longitude } = location.coords;
        
        // Get address from coordinates
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        const address = addressResponse[0] 
          ? `${addressResponse[0].street}, ${addressResponse[0].city}, ${addressResponse[0].region}`
          : '';

        // Set the current location
        setCustomLocation({ lat: latitude, lng: longitude });
        setCustomLocationAddress(address);
        
        Toast.show({
          type: 'success',
          text1: 'Location Updated',
          text2: 'Using your current location to find doctors.',
        });
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    };

    initializeLocation();
  }, []);

  useEffect(() => {
    fetchClinicAndDoctors();
  }, [fetchClinicAndDoctors]);

  const handlePlaceSelect = (details: PlaceDetails) => {
    if (details?.geometry.location) {
      setCustomLocation(details.geometry.location);
      setCustomLocationAddress(details.formatted_address);
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Location Permission',
          text2: 'Please enable location access to find doctors near you.',
        });
        setLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      
      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = addressResponse[0] 
        ? `${addressResponse[0].street}, ${addressResponse[0].city}, ${addressResponse[0].region}`
        : '';

      // Set the current location
      setCustomLocation({ lat: latitude, lng: longitude });
      setCustomLocationAddress(address);
      
      Toast.show({
        type: 'success',
        text1: 'Location Updated',
        text2: 'Using your current location to find doctors.',
      });
      
      // Fetch doctors with the new location
      await fetchClinicAndDoctors();
    } catch (error) {
      console.error('Error getting current location:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Unable to get your current location. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-4 shadow-md"
      onPress={() => router.push(`/doctors/${item.id}`)}
    >
      <View className="flex-row items-center">
        {item.profileImage ? (
          <Image
            source={{ uri: item.profileImage }}
            className="w-16 h-16 rounded-full mr-4"
          />
        ) : (
          <View className="w-16 h-16 rounded-full mr-4 bg-gray-200 justify-center items-center">
            <UserIcon color="#3b82f6" size={32} />
          </View>
        )}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-800">
            {item.fullName}
          </Text>
          <View className="flex-row items-center mt-1">
            <Briefcase color="gray" size={14} />
            <Text className="ml-2 text-gray-600">
              {item.specialization.replace(/_/g, " ")}
            </Text>
          </View>
          <Text className="text-gray-600 mt-1">
            {item.experience} years of experience
          </Text>
        </View>
      </View>
      <View className="border-t border-gray-200 mt-4 pt-2">
        <View className="flex-row items-center">
          <MapPin color="gray" size={14} />
          <Text className="ml-2 text-gray-600 flex-1">{item.address}</Text>
        </View>
        {item.distance && (
          <Text className="text-blue-500 mt-2 font-semibold">
            {item.distance.toFixed(1)} km away
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <View className="bg-white p-4 rounded-lg shadow-md mb-4">
        <View className="flex-row items-center border border-gray-300 rounded-lg p-2">
          <Search color="gray" size={20} />
          <TextInput
            className="flex-1 ml-2 text-base"
            placeholder="Search by name or specialization"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            className="p-1"
          >
            <SlidersHorizontal color="#3b82f6" size={24} />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center mt-2">
          <View className="flex-1">
            <GooglePlacesAutocomplete onPlaceSelect={handlePlaceSelect} />
          </View>
          <TouchableOpacity
            onPress={handleCurrentLocation}
            className="p-2 ml-2"
          >
            <LocateFixed color="#3b82f6" size={24} />
          </TouchableOpacity>
        </View>
        
        {/* Current Location Indicator */}
        {customLocationAddress && (
          <View className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <View className="flex-row items-center">
              <MapPin color="#3b82f6" size={16} />
              <Text className="ml-2 text-blue-700 text-sm flex-1">
                Searching near: {customLocationAddress}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCustomLocation(null);
                  setCustomLocationAddress("");
                  fetchClinicAndDoctors();
                }}
                className="p-1"
              >
                <X color="#3b82f6" size={16} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {showFilters && (
        <View className="bg-white p-4 rounded-lg shadow-md mb-4">
          {/* Specialization Filter */}
          <View className="mb-4">
            <Text className="text-base font-semibold mb-2">Specialization</Text>
            <View className="flex-row flex-wrap gap-2">
              {SPECIALIZATIONS.map((spec) => {
                const isSelected = selectedSpecializations.includes(spec);
                return (
                  <TouchableOpacity
                    key={spec}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedSpecializations(selectedSpecializations.filter(s => s !== spec));
                      } else {
                        setSelectedSpecializations([...selectedSpecializations, spec]);
                      }
                    }}
                    className={`px-3 py-2 rounded-full border ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-gray-100 border-gray-300'
                    }`}
                  >
                    <Text className={`text-sm ${
                      isSelected ? 'text-white' : 'text-gray-700'
                    }`}>
                      {spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedSpecializations.length > 0 && (
              <TouchableOpacity
                onPress={() => setSelectedSpecializations([])}
                className="mt-2"
              >
                <Text className="text-blue-500 text-sm">Clear all specializations</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Sort By */}
          <View className="mb-4">
            <Text className="text-base font-semibold mb-2">Sort By</Text>
            <View style={{ backgroundColor: '#f9fafb', borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' }}>
              <Picker
                selectedValue={sortBy}
                onValueChange={(itemValue) => setSortBy(itemValue)}
                style={{ height: 50 }}
              >
                <Picker.Item label="Nearest First" value="nearest" />
                <Picker.Item label="Most Experienced" value="experience" />
                <Picker.Item label="Name A-Z" value="name" />
              </Picker>
            </View>
          </View>

          <View>
            <Text className="text-base font-semibold mb-2">
              Experience (Years): {experienceRange[0]} - {experienceRange[1]}
            </Text>
            <View className="flex-row justify-between">
              <Slider
                style={{ width: '48%' }}
                minimumValue={0}
                maximumValue={50}
                step={1}
                value={experienceRange[0]}
                onValueChange={(value) =>
                  setExperienceRange([value, experienceRange[1]])
                }
              />
              <Slider
                style={{ width: '48%' }}
                minimumValue={0}
                maximumValue={50}
                step={1}
                value={experienceRange[1]}
                onValueChange={(value) =>
                  setExperienceRange([experienceRange[0], value])
                }
              />
            </View>
          </View>
          <View className="mt-4">
            <Text className="text-base font-semibold mb-2">
              Search Radius (km): {radius}
            </Text>
            <Slider
              style={{ width: "100%", height: 40 }}
              minimumValue={1}
              maximumValue={100}
              step={1}
              value={radius}
              onValueChange={setRadius}
            />
          </View>
          <View className="mt-4">
            <Text className="text-base font-semibold mb-2">Sort By:</Text>
            <Picker selectedValue={sortBy} onValueChange={setSortBy}>
              <Picker.Item label="Nearest First" value="nearest" />
              <Picker.Item
                label="Experience (High to Low)"
                value="experience_desc"
              />
              <Picker.Item
                label="Experience (Low to High)"
                value="experience_asc"
              />
              <Picker.Item label="Name A-Z" value="name_asc" />
              <Picker.Item label="Name Z-A" value="name_desc" />
            </Picker>
          </View>
        </View>
      )}

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item.id}
        renderItem={renderDoctorItem}
        ListEmptyComponent={
          loading ? (
            <View className="flex-1 justify-center items-center mt-16">
              <ActivityIndicator size="large" />
              <Text className="mt-2 text-gray-600">
                Finding doctors near you...
              </Text>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center mt-16">
              <Text className="text-lg text-gray-600">No doctors found.</Text>
              <Text className="text-gray-500">
                Try adjusting your filters or search radius.
              </Text>
              <Text className="text-sm text-gray-400 mt-2">
                Found {doctors.length} total doctors, {filteredDoctors.length} match your criteria
              </Text>
            </View>
          )
        }
      />
    </View>
  );
} 