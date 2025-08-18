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
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Search,
  Filter,
  Send,
  Building,
  Award,
  Stethoscope,
  Target,
  TrendingUp,
  X,
  CheckCircle,
  Star,
} from 'lucide-react-native';
import { axiosInstance } from '../../lib/axios';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

interface JobRequirement {
  id: string;
  title: string;
  description: string;
  type: 'FULLTIME' | 'PARTTIME' | 'ONETIME';
  specialization: string | null;
  location: string;
  date: string | null;
  additionalInformation: string | null;
  createdAt: string;
  applicationsCount: number;
  clinic: {
    id: string;
    clinicName: string;
    clinicAddress: string;
    profileImage: string | null;
    totalActiveJobs: number;
    isVerified?: boolean;
    latitude?: number;
    longitude?: number;
  };
  hasApplied?: boolean;
  distance?: number;
}

export default function RequirementsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [requirements, setRequirements] = useState<JobRequirement[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<JobRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<JobRequirement | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applying, setApplying] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const fetchRequirements = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await axiosInstance.get(`/api/doctor/get-requirements-by-location`, {
          params: {
            doctorId: user.id,
            radius: 50
          }
        });
        setRequirements(response.data.requirements || []);
      } catch (error) {
        console.error('Error fetching requirements:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load job opportunities',
        });
      }
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchRequirements().finally(() => setLoading(false));
  }, [fetchRequirements]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRequirements().finally(() => setRefreshing(false));
  }, [fetchRequirements]);

  // Filter and search logic
  useEffect(() => {
    let filtered = requirements;

    if (searchTerm) {
      filtered = filtered.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.clinic.clinicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(req => req.type === typeFilter);
    }

    if (verifiedOnly) {
      filtered = filtered.filter(req => req.clinic.isVerified);
    }

    setFilteredRequirements(filtered);
  }, [requirements, searchTerm, typeFilter, verifiedOnly]);

  const handleApply = async () => {
    if (!selectedRequirement || !applicationMessage.trim()) return;
    
    setApplying(true);
    try {
      await axiosInstance.post(`/api/doctor/pitch-requirement/${selectedRequirement.id}`, {
        doctorId: user?.id,
        message: applicationMessage.trim()
      });
      
      Toast.show({
        type: 'success',
        text1: 'Application Submitted',
        text2: 'Your application has been sent successfully!',
      });
      
      setShowApplyModal(false);
      setApplicationMessage('');
      setSelectedRequirement(null);
      
      // Update the requirement to show as applied
      setRequirements(prev =>
        prev.map(req =>
          req.id === selectedRequirement.id
            ? { ...req, hasApplied: true, applicationsCount: req.applicationsCount + 1 }
            : req
        )
      );
    } catch (error) {
      console.error('Error submitting application:', error);
      Toast.show({
        type: 'error',
        text1: 'Application Failed',
        text2: 'Please try again later',
      });
    } finally {
      setApplying(false);
    }
  };

  const formatJobType = (type: string) => {
    switch (type) {
      case 'FULLTIME': return 'Full-time';
      case 'PARTTIME': return 'Part-time';
      case 'ONETIME': return 'One-time';
      default: return type;
    }
  };

  const formatSpecialization = (spec: string) => {
    return spec?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || '';
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
  };

  const renderJobCard = (requirement: JobRequirement) => (
    <View key={requirement.id} className="bg-white rounded-2xl p-6 shadow-lg mb-4">
      {/* Clinic Header */}
      <View className="flex-row items-center mb-4">
        <View className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mr-4">
          {requirement.clinic.profileImage ? (
            <Image
              source={{ uri: requirement.clinic.profileImage }}
              className="w-14 h-14 rounded-full"
            />
          ) : (
            <Building size={24} color="white" />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-lg font-bold text-gray-900 flex-1">
              {requirement.clinic.clinicName}
            </Text>
            {requirement.clinic.isVerified && (
              <View className="bg-blue-100 rounded-full px-2 py-1 ml-2">
                <Text className="text-blue-800 text-xs font-medium">Verified</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center mt-1">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-gray-600 text-sm ml-1">{requirement.location}</Text>
            {requirement.distance && (
              <Text className="text-gray-500 text-sm ml-2">
                • {requirement.distance.toFixed(1)} km away
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Job Details */}
      <View className="mb-4">
        <Text className="text-xl font-bold text-gray-900 mb-2">{requirement.title}</Text>
        <Text className="text-gray-600 text-base leading-6 mb-3" numberOfLines={3}>
          {requirement.description}
        </Text>
        
        <View className="flex-row flex-wrap gap-2 mb-3">
          <View className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1">
            <Text className="text-blue-700 text-xs font-medium">
              {formatJobType(requirement.type)}
            </Text>
          </View>
          {requirement.specialization && (
            <View className="bg-purple-50 border border-purple-200 rounded-full px-3 py-1">
              <Text className="text-purple-700 text-xs font-medium">
                {formatSpecialization(requirement.specialization)}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center">
              <Users size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {requirement.applicationsCount} applied
              </Text>
            </View>
            <View className="flex-row items-center">
              <Clock size={14} color="#6b7280" />
              <Text className="text-gray-500 text-sm ml-1">
                {timeAgo(requirement.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => router.push(`/requirements/view/${requirement.id}`)}
          className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
        >
          <Text className="text-gray-700 font-medium">View Details</Text>
        </TouchableOpacity>
        
        {requirement.hasApplied ? (
          <View className="flex-1 bg-green-50 border border-green-200 rounded-xl py-3 items-center">
            <View className="flex-row items-center">
              <Heart size={16} color="#10b981" />
              <Text className="text-green-800 font-medium ml-2">Applied</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setSelectedRequirement(requirement);
              setShowApplyModal(true);
            }}
            className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
          >
            <Text className="text-white font-medium">Apply Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilterButton = (label: string, isActive: boolean, onPress: () => void) => (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-xl mr-3 ${
        isActive ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <Text
        className={`font-medium ${
          isActive ? 'text-white' : 'text-gray-700'
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
          <Text className="text-lg font-semibold text-gray-800 mt-4">Loading job opportunities...</Text>
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
          <Text className="text-3xl font-bold text-white mb-2">Job Opportunities</Text>
          <Text className="text-blue-100 text-base">
            Discover and apply for medical positions at top clinics
          </Text>
        </LinearGradient>

        <View style={{ padding: 20, paddingTop: 30 }}>
          {/* Search Bar */}
          <View className="bg-white rounded-2xl p-4 shadow-lg mb-6">
            <View className="flex-row items-center mb-4">
              <View className="flex-1 bg-gray-50 rounded-xl flex-row items-center px-4 py-3 mr-3">
                <Search size={20} color="#9ca3af" />
                <TextInput
                  placeholder="Search jobs, clinics, locations..."
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
                <Text className="text-gray-700 font-medium mb-3">Filters</Text>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                  {renderFilterButton('All Types', typeFilter === 'all', () => setTypeFilter('all'))}
                  {renderFilterButton('Full-time', typeFilter === 'FULLTIME', () => setTypeFilter('FULLTIME'))}
                  {renderFilterButton('Part-time', typeFilter === 'PARTTIME', () => setTypeFilter('PARTTIME'))}
                  {renderFilterButton('One-time', typeFilter === 'ONETIME', () => setTypeFilter('ONETIME'))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => setVerifiedOnly(!verifiedOnly)}
                  className={`flex-row items-center p-3 rounded-xl ${
                    verifiedOnly ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <CheckCircle size={16} color={verifiedOnly ? '#3b82f6' : '#9ca3af'} />
                  <Text className={`ml-2 font-medium ${verifiedOnly ? 'text-blue-700' : 'text-gray-700'}`}>
                    Verified Clinics Only
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Results Summary */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-gray-600 text-base">
              Found {filteredRequirements.length} job{filteredRequirements.length !== 1 ? 's' : ''}
            </Text>
            <View className="bg-green-50 border border-green-200 rounded-full px-3 py-1">
              <Text className="text-green-700 text-sm font-medium">
                {filteredRequirements.filter(req => !req.hasApplied).length} Available
              </Text>
            </View>
          </View>

          {/* Job List */}
          {filteredRequirements.length > 0 ? (
            filteredRequirements.map(renderJobCard)
          ) : (
            <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Briefcase size={32} color="#9ca3af" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</Text>
              <Text className="text-gray-600 text-center">
                {searchTerm || typeFilter !== 'all' || verifiedOnly
                  ? "Try adjusting your search criteria to see more opportunities"
                  : "No job opportunities are available at the moment. Check back later!"
                }
              </Text>
              {(searchTerm || typeFilter !== 'all' || verifiedOnly) && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setVerifiedOnly(false);
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

      {/* Apply Modal */}
      <Modal
        visible={showApplyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowApplyModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          <View className="flex-1">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
              <Text className="text-xl font-bold text-gray-900">Apply for Position</Text>
              <TouchableOpacity
                onPress={() => setShowApplyModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedRequirement && (
              <ScrollView className="flex-1 p-6">
                {/* Job Info */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {selectedRequirement.title}
                  </Text>
                  <Text className="text-gray-600 text-base">
                    at {selectedRequirement.clinic.clinicName}
                  </Text>
                  <View className="flex-row items-center mt-2">
                    <MapPin size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-1">
                      {selectedRequirement.location}
                    </Text>
                  </View>
                </View>

                {/* Application Message */}
                <View className="mb-6">
                  <Text className="text-gray-700 font-medium mb-3">Cover Message *</Text>
                  <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-900"
                    placeholder="Write a brief message explaining why you're interested in this position..."
                    value={applicationMessage}
                    onChangeText={setApplicationMessage}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    placeholderTextColor="#9ca3af"
                  />
                  <Text className="text-gray-500 text-xs mt-2">
                    {applicationMessage.length}/500 characters
                  </Text>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setShowApplyModal(false)}
                    className="flex-1 bg-gray-200 rounded-xl py-4 items-center"
                    disabled={applying}
                  >
                    <Text className="text-gray-700 font-medium">Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleApply}
                    disabled={!applicationMessage.trim() || applying}
                    className={`flex-1 rounded-xl py-4 items-center ${
                      !applicationMessage.trim() || applying ? 'bg-gray-300' : 'bg-blue-600'
                    }`}
                  >
                    <View className="flex-row items-center">
                      {applying ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Send size={16} color="white" />
                      )}
                      <Text className="text-white font-medium ml-2">
                        {applying ? 'Submitting...' : 'Submit Application'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}