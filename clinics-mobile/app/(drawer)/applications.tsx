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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Star,
  Award,
  Stethoscope,
  Filter,
} from 'lucide-react-native';
import { axiosInstance } from '../../lib/axios';
import Toast from 'react-native-toast-message';

interface Application {
  id: string;
  createdAt: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  doctor: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    specialization: string;
    experience: number;
    profileImage?: string;
    location?: {
      address: string;
    };
  };
  jobRequirement: {
    id: string;
    title: string;
    description: string;
    location: string;
    salary?: string;
  };
}

export default function ApplicationsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');

  const fetchApplications = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await axiosInstance.get(`/api/clinic/applications/${user.id}`);
        setApplications(response.data.applications || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load applications',
        });
      }
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchApplications().finally(() => setLoading(false));
  }, [fetchApplications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications().finally(() => setRefreshing(false));
  }, [fetchApplications]);

  const handleApplicationAction = async (applicationId: string, action: 'ACCEPT' | 'REJECT') => {
    try {
      await axiosInstance.post(`/api/clinic/application/${applicationId}/${action.toLowerCase()}`);
      
      setApplications(prev =>
        prev.map(app =>
          app.id === applicationId
            ? { ...app, status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED' }
            : app
        )
      );

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `Application ${action.toLowerCase()}ed successfully`,
      });
    } catch (error) {
      console.error(`Error ${action.toLowerCase()}ing application:`, error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: `Failed to ${action.toLowerCase()} application`,
      });
    }
  };

  const confirmAction = (applicationId: string, action: 'ACCEPT' | 'REJECT', doctorName: string) => {
    Alert.alert(
      `${action === 'ACCEPT' ? 'Accept' : 'Reject'} Application`,
      `Are you sure you want to ${action.toLowerCase()} ${doctorName}'s application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'ACCEPT' ? 'Accept' : 'Reject',
          style: action === 'ACCEPT' ? 'default' : 'destructive',
          onPress: () => handleApplicationAction(applicationId, action),
        },
      ]
    );
  };

  const filteredApplications = applications.filter(app => 
    filter === 'ALL' || app.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
      case 'ACCEPTED':
        return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'REJECTED':
        return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };
    }
  };

  const renderFilterButton = (filterType: typeof filter, label: string, count: number) => (
    <TouchableOpacity
      onPress={() => setFilter(filterType)}
      className={`px-4 py-2 rounded-xl mr-3 ${
        filter === filterType ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <Text
        className={`font-medium ${
          filter === filterType ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label} ({count})
      </Text>
    </TouchableOpacity>
  );

  const renderApplicationCard = (application: Application) => {
    const statusColors = getStatusColor(application.status);
    
    return (
      <View key={application.id} className="bg-white rounded-2xl p-6 shadow-lg mb-4">
        {/* Doctor Info Header */}
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mr-4">
            {application.doctor.profileImage ? (
              <Image
                source={{ uri: application.doctor.profileImage }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <Text className="text-white font-bold text-lg">
                {application.doctor.fullName[0]}
              </Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {application.doctor.fullName}
            </Text>
            <View className="flex-row items-center mb-1">
              <Stethoscope size={14} color="#6b7280" />
              <Text className="text-gray-600 ml-1 capitalize">
                {application.doctor.specialization.replace(/_/g, ' ').toLowerCase()}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Award size={14} color="#6b7280" />
              <Text className="text-gray-600 ml-1">
                {application.doctor.experience} years experience
              </Text>
            </View>
          </View>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: statusColors.bg, borderColor: statusColors.border, borderWidth: 1 }}
          >
            <Text style={{ color: statusColors.text }} className="text-xs font-medium capitalize">
              {application.status.toLowerCase()}
            </Text>
          </View>
        </View>

        {/* Job Details */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="font-semibold text-gray-900 mb-2">Applied for:</Text>
          <Text className="text-lg font-bold text-blue-600 mb-1">
            {application.jobRequirement.title}
          </Text>
          <View className="flex-row items-center">
            <MapPin size={14} color="#6b7280" />
            <Text className="text-gray-600 ml-1">{application.jobRequirement.location}</Text>
          </View>
        </View>

        {/* Contact Info */}
        <View className="flex-row justify-between mb-4">
          <TouchableOpacity className="flex-row items-center">
            <View className="bg-blue-100 rounded-lg p-2 mr-2">
              <Mail size={16} color="#3b82f6" />
            </View>
            <Text className="text-blue-600 font-medium">Email</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center">
            <View className="bg-green-100 rounded-lg p-2 mr-2">
              <Phone size={16} color="#10b981" />
            </View>
            <Text className="text-green-600 font-medium">Call</Text>
          </TouchableOpacity>
        </View>

        {/* Application Date */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Calendar size={14} color="#6b7280" />
            <Text className="text-gray-500 text-sm ml-1">
              Applied on {new Date(application.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        {application.status === 'PENDING' && (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => confirmAction(application.id, 'REJECT', application.doctor.fullName)}
              className="flex-1 bg-red-50 border border-red-200 rounded-xl py-3 flex-row items-center justify-center"
            >
              <XCircle size={16} color="#ef4444" />
              <Text className="text-red-600 font-medium ml-2">Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => confirmAction(application.id, 'ACCEPT', application.doctor.fullName)}
              className="flex-1 bg-green-600 rounded-xl py-3 flex-row items-center justify-center"
            >
              <CheckCircle size={16} color="white" />
              <Text className="text-white font-medium ml-2">Accept</Text>
            </TouchableOpacity>
          </View>
        )}

        {application.status === 'ACCEPTED' && (
          <TouchableOpacity
            onPress={() => router.push(`/(drawer)/chat?doctor=${application.doctor.id}`)}
            className="bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
          >
            <Text className="text-white font-medium">Start Conversation</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-800 mt-4">Loading applications...</Text>
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
        <View style={{ padding: 20 }}>
          {/* Header */}
          <View className="mb-6">
            <Text className="text-3xl font-bold text-gray-900 mb-2">Doctor Applications</Text>
            <Text className="text-gray-600 text-base">
              Review and manage applications from qualified doctors
            </Text>
          </View>

          {/* Filter Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {renderFilterButton('ALL', 'All', applications.length)}
            {renderFilterButton('PENDING', 'Pending', applications.filter(a => a.status === 'PENDING').length)}
            {renderFilterButton('ACCEPTED', 'Accepted', applications.filter(a => a.status === 'ACCEPTED').length)}
            {renderFilterButton('REJECTED', 'Rejected', applications.filter(a => a.status === 'REJECTED').length)}
          </ScrollView>

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            filteredApplications.map(renderApplicationCard)
          ) : (
            <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Users size={32} color="#9ca3af" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</Text>
              <Text className="text-gray-600 text-center">
                {filter === 'ALL' 
                  ? "You haven't received any applications yet. Post job requirements to attract qualified doctors."
                  : `No ${filter.toLowerCase()} applications found.`
                }
              </Text>
              {filter === 'ALL' && (
                <TouchableOpacity
                  onPress={() => router.push('/(drawer)/tabs/requirements')}
                  className="bg-blue-600 rounded-xl px-6 py-3 mt-4"
                >
                  <Text className="text-white font-medium">Post a Job</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}