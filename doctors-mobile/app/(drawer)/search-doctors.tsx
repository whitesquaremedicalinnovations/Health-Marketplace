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
import {
  Briefcase,
  LocateFixed,
  MapPin,
  Search,
  SlidersHorizontal,
  User as UserIcon,
} from "lucide-react-native";

import GooglePlacesAutocomplete from "../../components/ui/google-places-autocomplete";
import { getClinic } from "../../lib/utils";
import { getDoctorsByLocation } from "../../lib/utils";
import { useRouter } from "expo-router";

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
  const [radius, setRadius] = useState(50);
  const [customLocation, setCustomLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [customLocationAddress, setCustomLocationAddress] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

      const fetchedDoctors = await getDoctorsByLocation(
        searchLat,
        searchLng,
        radius,
        experienceRange[0],
        experienceRange[1],
        sortBy,
        searchTerm
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
    experienceRange,
    sortBy,
    customLocation,
    searchTerm,
  ]);

  useEffect(() => {
    fetchClinicAndDoctors();
  }, [fetchClinicAndDoctors]);

  const handlePlaceSelect = (details: PlaceDetails) => {
    if (details?.geometry.location) {
      setCustomLocation(details.geometry.location);
      setCustomLocationAddress(details.formatted_address);
    }
  };

  const handleClearCustomLocation = () => {
    setCustomLocation(null);
    setCustomLocationAddress("");
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
            onPress={handleClearCustomLocation}
            className="p-2 ml-2"
          >
            <LocateFixed color="#3b82f6" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {showFilters && (
        <View className="bg-white p-4 rounded-lg shadow-md mb-4">
          <View>
            <Text className="text-base font-semibold mb-2">
              Experience (Years): {experienceRange[0]} - {experienceRange[1]}
            </Text>
            <View className="flex-row justify-between">
              <Slider
                className="w-[48%]"
                minimumValue={0}
                maximumValue={50}
                step={1}
                value={experienceRange[0]}
                onValueChange={(value) =>
                  setExperienceRange([value, experienceRange[1]])
                }
              />
              <Slider
                className="w-[48%]"
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

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
          <Text className="mt-2 text-gray-600">
            Finding doctors near you...
          </Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctorItem}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-16">
              <Text className="text-lg text-gray-600">No doctors found.</Text>
              <Text className="text-gray-500">
                Try adjusting your filters or search radius.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
} 