import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  Building,
  MapPin,
  Briefcase,
  Search,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Star,
  Users,
  Filter,
  X,
  CheckCircle,
  Award,
} from 'lucide-react-native';
import { axiosInstance } from '../../lib/axios';
import Toast from 'react-native-toast-message';

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

export default function SearchClinicsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('nearest');
  const [activeJobsFilter, setActiveJobsFilter] = useState('all');

  const fetchClinics = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await axiosInstance.get(`/api/doctor/get-clinics`, {
          params: {
            doctorId: user.id,
            radius: 50
          }
        });
        setClinics(response.data.clinics || []);
      } catch (error) {
        console.error('Error fetching clinics:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load clinics',
        });
      }
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchClinics().finally(() => setLoading(false));
  }, [fetchClinics]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClinics().finally(() => setRefreshing(false));
  }, [fetchClinics]);

  // Filter and search logic
  useEffect(() => {
    let filtered = clinics;

    if (searchTerm) {
      filtered = filtered.filter(clinic =>
        clinic.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.clinicAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (clinic.clinicAdditionalDetails?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (activeJobsFilter !== 'all') {
      if (activeJobsFilter === 'with_jobs') {
        filtered = filtered.filter(clinic => clinic.totalActiveJobs > 0);
      } else if (activeJobsFilter === 'no_jobs') {
        filtered = filtered.filter(clinic => clinic.totalActiveJobs === 0);
      }
    }

    // Sort filtered results
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nearest':
          return (a.distance || 999999) - (b.distance || 999999);
        case 'most_jobs':
          return b.totalActiveJobs - a.totalActiveJobs;
        case 'name':
          return a.clinicName.localeCompare(b.clinicName);
        default:
          return 0;
      }
    });

    setFilteredClinics(filtered);
  }, [clinics, searchTerm, sortBy, activeJobsFilter]);

  const renderClinicCard = (clinic: Clinic) => (
    <View key={clinic.id} className="bg-white rounded-2xl p-6 shadow-lg mb-4">
      {/* Clinic Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mr-4">
          {clinic.profileImage ? (
            <Image
              source={{ uri: clinic.profileImage }}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <Building size={28} color="white" />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-xl font-bold text-gray-900 flex-1">
              {clinic.clinicName}
            </Text>
            {clinic.isVerified && (
              <View className="bg-blue-100 rounded-full px-2 py-1 ml-2">
                <Text className="text-blue-800 text-xs font-medium">Verified</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center mt-1">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1" numberOfLines={1}>
              {clinic.clinicAddress}
            </Text>
          </View>
          {clinic.distance && (
            <Text className="text-gray-500 text-sm mt-1">
              {clinic.distance.toFixed(1)} km away
            </Text>
          )}
        </View>
      </View>

      {/* Clinic Stats */}
      <View className="bg-gray-50 rounded-xl p-4 mb-4">
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-2xl font-bold text-blue-600">{clinic.totalActiveJobs}</Text>
            <Text className="text-gray-600 text-sm">Active Jobs</Text>
          </View>
          <View className="items-center">
            <Text className="text-2xl font-bold text-green-600">{clinic.jobRequirements?.length || 0}</Text>
            <Text className="text-gray-600 text-sm">Total Postings</Text>
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <Star size={16} color="#f59e0b" />
              <Text className="text-2xl font-bold text-gray-900 ml-1">4.8</Text>
            </View>
            <Text className="text-gray-600 text-sm">Rating</Text>
          </View>
        </View>
      </View>

      {/* Additional Details */}
      {clinic.clinicAdditionalDetails && (
        <View className="mb-4">
          <Text className="text-gray-600 text-sm leading-5" numberOfLines={2}>
            {clinic.clinicAdditionalDetails}
          </Text>
        </View>
      )}

      {/* Recent Jobs Preview */}
      {clinic.jobRequirements && clinic.jobRequirements.length > 0 && (
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Recent Job Postings:</Text>
          {clinic.jobRequirements.slice(0, 2).map((job, index) => (
            <View key={job.id} className="bg-blue-50 rounded-lg p-3 mb-2">
              <Text className="font-semibold text-blue-900" numberOfLines={1}>
                {job.title}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="bg-blue-200 rounded-full px-2 py-1 mr-2">
                  <Text className="text-blue-800 text-xs">
                    {job.type.replace('_', ' ')}
                  </Text>
                </View>
                <Text className="text-blue-700 text-xs">
                  {job.applicationsCount} applications
                </Text>
              </View>
            </View>
          ))}
          {clinic.jobRequirements.length > 2 && (
            <Text className="text-blue-600 text-sm font-medium">
              +{clinic.jobRequirements.length - 2} more jobs
            </Text>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => {
            setSelectedClinic(clinic);
            setShowDetailModal(true);
          }}
          className="flex-1 bg-gray-100 rounded-xl py-3 flex-row items-center justify-center"
        >
          <Eye size={16} color="#6b7280" />
          <Text className="text-gray-700 font-medium ml-2">View Profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => router.push(`/(drawer)/chat?clinic=${clinic.id}`)}
          className="flex-1 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
        >
          <MessageSquare size={16} color="white" />
          <Text className="text-white font-medium ml-2">Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButton = (label: string, value: string, currentValue: string, onPress: () => void) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-xl mr-3 ${
        currentValue === value ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <Text
        className={`font-medium ${
          currentValue === value ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-800 mt-4">Loading clinics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ flex: 1 }}
      >
        {/* Header */}
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6']}
          style={{ 
            paddingHorizontal: 20, 
            paddingTop: 20, 
            paddingBottom: 30,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <Text className="text-3xl font-bold text-white mb-2">Search Clinics</Text>
          <Text className="text-blue-100 text-base">
            Find healthcare facilities and explore opportunities
          </Text>
        </LinearGradient>

        <View style={{ padding: 20, paddingTop: 30 }}>
          {/* Search Bar */}
          <View className="bg-white rounded-2xl p-4 shadow-lg mb-6">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 bg-gray-50 rounded-xl flex-row items-center px-4 py-3 mr-3">
                <Search size={20} color="#9ca3af" />
                <TextInput
                  placeholder="Search clinics, locations..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  className="flex-1 ml-3 text-gray-900"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                className={`p-3 rounded-xl ${showFilters ? 'bg-blue-600' : 'bg-gray-200'}`}
              >
                <Filter size={20} color={showFilters ? 'white' : '#6b7280'} />
              </TouchableOpacity>
            </View>

            {/* Filter Options */}
            {showFilters && (
              <View className="border-t border-gray-100 pt-4">
                <Text className="text-gray-700 font-medium mb-3">Sort By</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  {renderFilterButton('Nearest', 'nearest', sortBy, () => setSortBy('nearest'))}
                  {renderFilterButton('Most Jobs', 'most_jobs', sortBy, () => setSortBy('most_jobs'))}
                  {renderFilterButton('Name A-Z', 'name', sortBy, () => setSortBy('name'))}
                </ScrollView>

                <Text className="text-gray-700 font-medium mb-3">Job Availability</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {renderFilterButton('All', 'all', activeJobsFilter, () => setActiveJobsFilter('all'))}
                  {renderFilterButton('With Jobs', 'with_jobs', activeJobsFilter, () => setActiveJobsFilter('with_jobs'))}
                  {renderFilterButton('No Jobs', 'no_jobs', activeJobsFilter, () => setActiveJobsFilter('no_jobs'))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Results Summary */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-gray-600 text-base">
              Found {filteredClinics.length} clinic{filteredClinics.length !== 1 ? 's' : ''}
            </Text>
            <View className="bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <Text className="text-green-700 text-sm font-medium">
                {filteredClinics.filter(c => c.totalActiveJobs > 0).length} With Jobs
              </Text>
            </View>
          </View>

          {/* Clinics List */}
          {filteredClinics.length > 0 ? (
            filteredClinics.map(renderClinicCard)
          ) : (
            <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Building size={32} color="#9ca3af" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No Clinics Found</Text>
              <Text className="text-gray-600 text-center">
                {searchTerm || activeJobsFilter !== 'all'
                  ? "Try adjusting your search criteria"
                  : "No clinics are available in your area at the moment"
                }
              </Text>
              {(searchTerm || activeJobsFilter !== 'all') && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchTerm('');
                    setActiveJobsFilter('all');
                  }}
                  className="bg-blue-600 rounded-xl px-6 py-3 mt-4"
                >
                  <Text className="text-white font-medium">Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

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
                <Text className="text-xl font-bold text-gray-900">Clinic Profile</Text>
                <TouchableOpacity
                  onPress={() => setShowDetailModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 p-6">
                {/* Clinic Info */}
                <View className="items-center mb-6">
                  <View className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mb-4">
                    {selectedClinic.profileImage ? (
                      <Image
                        source={{ uri: selectedClinic.profileImage }}
                        className="w-24 h-24 rounded-full"
                      />
                    ) : (
                      <Building size={36} color="white" />
                    )}
                  </View>
                  <Text className="text-2xl font-bold text-gray-900 text-center mb-1">
                    {selectedClinic.clinicName}
                  </Text>
                  <View className="flex-row items-center">
                    <MapPin size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-1">{selectedClinic.clinicAddress}</Text>
                  </View>
                  {selectedClinic.distance && (
                    <Text className="text-gray-500 text-sm mt-1">
                      {selectedClinic.distance.toFixed(1)} km from your location
                    </Text>
                  )}
                </View>

                {/* Stats */}
                <View className="bg-gray-50 rounded-xl p-4 mb-6">
                  <View className="flex-row justify-around">
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-blue-600">
                        {selectedClinic.totalActiveJobs}
                      </Text>
                      <Text className="text-gray-600 text-sm">Active Jobs</Text>
                    </View>
                    <View className="items-center">
                      <View className="flex-row items-center">
                        <Star size={16} color="#f59e0b" />
                        <Text className="text-2xl font-bold text-gray-900 ml-1">4.8</Text>
                      </View>
                      <Text className="text-gray-600 text-sm">Rating</Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-2xl font-bold text-green-600">15+</Text>
                      <Text className="text-gray-600 text-sm">Years</Text>
                    </View>
                  </View>
                </View>

                {/* About */}
                {selectedClinic.clinicAdditionalDetails && (
                  <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">About</Text>
                    <Text className="text-gray-600 text-base leading-6">
                      {selectedClinic.clinicAdditionalDetails}
                    </Text>
                  </View>
                )}

                {/* Contact Information */}
                <View className="bg-blue-50 rounded-xl p-4 mb-6">
                  <Text className="text-gray-700 font-medium mb-3">Contact Information</Text>
                  <View className="space-y-2">
                    <View className="flex-row items-center">
                      <Phone size={16} color="#3b82f6" />
                      <Text className="text-gray-700 ml-2">{selectedClinic.clinicPhoneNumber}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Mail size={16} color="#3b82f6" />
                      <Text className="text-gray-700 ml-2">{selectedClinic.owner.email}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Users size={16} color="#3b82f6" />
                      <Text className="text-gray-700 ml-2">Owner: {selectedClinic.owner.ownerName}</Text>
                    </View>
                  </View>
                </View>

                {/* Recent Job Postings */}
                {selectedClinic.jobRequirements && selectedClinic.jobRequirements.length > 0 && (
                  <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-3">Recent Job Postings</Text>
                    {selectedClinic.jobRequirements.map((job) => (
                      <TouchableOpacity
                        key={job.id}
                        onPress={() => {
                          setShowDetailModal(false);
                          router.push(`/requirements/view/${job.id}`);
                        }}
                        className="bg-white border border-gray-200 rounded-xl p-4 mb-3"
                      >
                        <Text className="font-semibold text-gray-900 mb-1">{job.title}</Text>
                        <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                          {job.description}
                        </Text>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <View className="bg-blue-100 rounded-full px-2 py-1 mr-2">
                              <Text className="text-blue-800 text-xs">
                                {job.type.replace('_', ' ')}
                              </Text>
                            </View>
                            <Text className="text-gray-500 text-xs">
                              {job.applicationsCount} applications
                            </Text>
                          </View>
                          <ArrowRight size={16} color="#9ca3af" />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>

              {/* Bottom Actions */}
              <View className="p-6 border-t border-gray-200">
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => router.push(`/(drawer)/requirements?clinic=${selectedClinic.id}`)}
                    className="flex-1 bg-blue-600 rounded-xl py-4 flex-row items-center justify-center"
                  >
                    <Briefcase size={16} color="white" />
                    <Text className="text-white font-medium ml-2">View All Jobs</Text>
                  </TouchableOpacity>
                  
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