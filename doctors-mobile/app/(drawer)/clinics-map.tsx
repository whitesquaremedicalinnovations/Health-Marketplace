import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  Building,
  MapPin,
  Briefcase,
  Phone,
  Mail,
  Star,
  Users,
  X,
  ArrowLeft,
  Navigation,
  MessageSquare,
} from 'lucide-react-native';
import { axiosInstance } from '../../lib/axios';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

interface Clinic {
  id: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhoneNumber: string;
  clinicAdditionalDetails: string | null;
  profileImage: string | null;
  totalActiveJobs: number;
  distance?: number;
  latitude?: number;
  longitude?: number;
  isVerified?: boolean;
  owner: {
    email: string;
    ownerName: string;
    ownerPhoneNumber: string;
  };
  jobRequirements: JobRequirement[];
}

interface JobRequirement {
  id: string;
  title: string;
  description: string;
  type: 'FULLTIME' | 'PARTTIME' | 'ONETIME';
  specialization: string | null;
  location: string;
  date: string | null;
  createdAt: string;
  applicationsCount: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function ClinicsMapScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [region, setRegion] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Get user location
  const getUserLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Location Permission',
          text2: 'Please enable location access to find clinics near you.',
        });
        return null;
      }

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

      const locationData: LocationData = {
        latitude,
        longitude,
        address,
      };

      setUserLocation(locationData);
      
      // Update map region to user location
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      return locationData;
    } catch (error) {
      console.error('Error getting location:', error);
      Toast.show({
        type: 'error',
        text1: 'Location Error',
        text2: 'Unable to get your current location',
      });
      return null;
    }
  }, []);

  const fetchClinics = useCallback(async () => {
    if (!user?.id) return;

    try {
      const locationData = userLocation || await getUserLocation();
      if (!locationData) {
        Toast.show({
          type: 'error',
          text1: 'Location Required',
          text2: 'Please enable location access to find clinics',
        });
        return;
      }

      const response = await axiosInstance.get(`/api/doctor/get-clinics-by-location`, {
        params: {
          lat: locationData.latitude,
          lng: locationData.longitude,
          radius: 50,
          sortBy: 'nearest',
          doctorId: user.id,
        }
      });

      const clinicsWithDistance = response.data.clinics.map((clinic: any) => {
        if (clinic.latitude && clinic.longitude) {
          const distance = getDistance(locationData.latitude, locationData.longitude, clinic.latitude, clinic.longitude);
          return { ...clinic, distance, totalActiveJobs: clinic.activeJobs || 0 };
        }
        return { ...clinic, totalActiveJobs: clinic.activeJobs || 0 };
      });

      setClinics(clinicsWithDistance);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load clinics',
      });
    }
  }, [user, userLocation, getUserLocation]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    setLoading(true);
    getUserLocation().then(() => {
      fetchClinics().finally(() => setLoading(false));
    });
  }, []);

  const handleClinicPress = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setShowDetailModal(true);
  };

  const getMarkerColor = (clinic: Clinic) => {
    if (clinic.totalActiveJobs > 0) {
      return '#10B981'; // Green for hiring
    }
    return '#6B7280'; // Gray for not hiring
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-800 mt-4">Loading map...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
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
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white">Clinics Map</Text>
          <View className="w-10 h-10" />
        </View>
        <Text className="text-blue-100 text-sm mt-2">
          {clinics.length} clinics found in your area
        </Text>
      </LinearGradient>

      {/* Map */}
      <View className="flex-1">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ flex: 1 }}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {/* User Location Marker */}
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
              }}
              title="Your Location"
              description="You are here"
              pinColor="#3B82F6"
            />
          )}

          {/* Clinic Markers */}
          {clinics.map((clinic) => {
            if (!clinic.latitude || !clinic.longitude) return null;
            
            return (
              <Marker
                key={clinic.id}
                coordinate={{
                  latitude: clinic.latitude,
                  longitude: clinic.longitude,
                }}
                title={clinic.clinicName}
                description={`${clinic.totalActiveJobs} active jobs`}
                pinColor={getMarkerColor(clinic)}
                onPress={() => handleClinicPress(clinic)}
              >
                <Callout>
                  <View className="p-2 min-w-[200px]">
                    <Text className="font-bold text-gray-900 text-base">
                      {clinic.clinicName}
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      {clinic.clinicAddress}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Briefcase size={14} color="#3b82f6" />
                      <Text className="text-blue-600 font-medium ml-1">
                        {clinic.totalActiveJobs} active jobs
                      </Text>
                    </View>
                    {clinic.distance && (
                      <Text className="text-gray-500 text-xs mt-1">
                        {clinic.distance.toFixed(1)} km away
                      </Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>

      {/* Legend */}
      <View className="absolute bottom-20 left-4 bg-white rounded-xl p-3 shadow-lg">
        <Text className="font-semibold text-gray-900 mb-2">Legend</Text>
        <View className="space-y-2">
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
            <Text className="text-gray-700 text-sm">Your Location</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <Text className="text-gray-700 text-sm">Hiring Clinics</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 bg-gray-500 rounded-full mr-2" />
            <Text className="text-gray-700 text-sm">Other Clinics</Text>
          </View>
        </View>
      </View>

      {/* Clinic Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          {selectedClinic && (
            <View className="flex-1">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900">Clinic Details</Text>
                <TouchableOpacity
                  onPress={() => setShowDetailModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View className="flex-1 p-6">
                {/* Clinic Header */}
                <View className="items-center mb-6">
                  <View className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mb-4">
                    {selectedClinic.profileImage ? (
                      <View className="w-20 h-20 rounded-full overflow-hidden">
                        <View className="w-full h-full bg-gray-200" />
                      </View>
                    ) : (
                      <Building size={32} color="white" />
                    )}
                  </View>
                  <Text className="text-xl font-bold text-gray-900 text-center mb-1">
                    {selectedClinic.clinicName}
                  </Text>
                  {selectedClinic.isVerified && (
                    <View className="bg-blue-100 rounded-full px-3 py-1 mb-2">
                      <Text className="text-blue-800 text-sm font-medium">✓ Verified Clinic</Text>
                    </View>
                  )}
                  <View className="flex-row items-center">
                    <MapPin size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-1 text-center">{selectedClinic.clinicAddress}</Text>
                  </View>
                  {selectedClinic.distance && (
                    <Text className="text-gray-500 text-sm mt-1">
                      {selectedClinic.distance.toFixed(1)} km from your location
                    </Text>
                  )}
                </View>

                {/* Clinic Stats */}
                <View className="bg-gray-50 rounded-xl p-4 mb-6">
                  <Text className="text-gray-700 font-medium mb-3 text-center">Clinic Overview</Text>
                  <View className="grid grid-cols-2 gap-4">
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-blue-600">
                        {selectedClinic.totalActiveJobs}
                      </Text>
                      <Text className="text-gray-600 text-sm">Active Jobs</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-green-600">
                        {selectedClinic.jobRequirements?.length || 0}
                      </Text>
                      <Text className="text-gray-600 text-sm">Total Postings</Text>
                    </View>
                  </View>
                </View>

                {/* About */}
                {selectedClinic.clinicAdditionalDetails && (
                  <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-3">About the Clinic</Text>
                    <View className="bg-white border border-gray-200 rounded-xl p-4">
                      <Text className="text-gray-600 text-base leading-6">
                        {selectedClinic.clinicAdditionalDetails}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Owner Information */}
                <View className="mb-6">
                  <Text className="text-gray-700 font-medium mb-3">Owner Information</Text>
                  <View className="bg-blue-50 rounded-xl p-4">
                    <View className="space-y-3">
                      <View className="flex-row items-center">
                        <Users size={16} color="#3b82f6" />
                        <Text className="text-gray-700 ml-2 font-medium">
                          Dr. {selectedClinic.owner.ownerName}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Mail size={16} color="#3b82f6" />
                        <Text className="text-gray-700 ml-2">{selectedClinic.owner.email}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Phone size={16} color="#3b82f6" />
                        <Text className="text-gray-700 ml-2">{selectedClinic.owner.ownerPhoneNumber}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Contact Information */}
                <View className="mb-6">
                  <Text className="text-gray-700 font-medium mb-3">Clinic Contact</Text>
                  <View className="bg-green-50 rounded-xl p-4">
                    <View className="space-y-3">
                      <View className="flex-row items-center">
                        <Phone size={16} color="#10b981" />
                        <Text className="text-gray-700 ml-2">{selectedClinic.clinicPhoneNumber}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <MapPin size={16} color="#10b981" />
                        <Text className="text-gray-700 ml-2">{selectedClinic.clinicAddress}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Bottom Actions */}
              <View className="p-6 border-t border-gray-200">
                <View className="flex-row gap-3">
                  {selectedClinic.totalActiveJobs > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setShowDetailModal(false);
                        router.push(`/requirements/view/${selectedClinic.id}`);
                      }}
                      className="flex-1 bg-blue-600 rounded-xl py-4 flex-row items-center justify-center"
                    >
                      <Briefcase size={16} color="white" />
                      <Text className="text-white font-medium ml-2">View Jobs</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    onPress={() => {
                      setShowDetailModal(false);
                      router.push(`/(drawer)/chat?clinic=${selectedClinic.id}`);
                    }}
                    className="flex-1 bg-green-600 rounded-xl py-4 flex-row items-center justify-center"
                  >
                    <MessageSquare size={16} color="white" />
                    <Text className="text-white font-medium ml-2">Start Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
} 