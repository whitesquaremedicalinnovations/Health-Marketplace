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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  MessageSquare,
  Calendar,
  Building,
  MapPin,
  Eye,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { axiosInstance } from '@/lib/axios';
import Toast from 'react-native-toast-message';

interface Application {
  id: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
  jobRequirement: {
    id: string;
    title: string;
    description: string;
    type: string;
    specialization: string | null;
    location: string;
    date: string | null;
    additionalInformation: string | null;
    clinic: {
      id: string;
      clinicName: string;
      clinicAddress: string;
      profileImage: string | null;
    };
  };
}

export default function ApplicationsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (user?.id) {
      try {
        const response = await axiosInstance.get(`/api/doctor/get-my-pitches?doctorId=${user.id}`);
        setApplications(response.data.pitches || []);
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

  const handleWithdraw = async (applicationId: string) => {
    setWithdrawing(true);
    try {
      await axiosInstance.post(`/api/doctor/withdraw-pitch/${applicationId}`, {
        doctorId: user?.id
      });
      
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'WITHDRAWN' as const }
            : app
        )
      );
      
      Toast.show({
        type: 'success',
        text1: 'Application Withdrawn',
        text2: 'Your application has been withdrawn successfully',
      });
    } catch (error) {
      console.error('Error withdrawing application:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to withdraw application',
      });
    } finally {
      setWithdrawing(false);
    }
  };

  const confirmWithdraw = (applicationId: string, jobTitle: string) => {
    Alert.alert(
      'Withdraw Application',
      `Are you sure you want to withdraw your application for "${jobTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: () => handleWithdraw(applicationId),
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' };
      case 'ACCEPTED':
        return { bg: '#d1fae5', text: '#065f46', border: '#10b981' };
      case 'REJECTED':
        return { bg: '#fee2e2', text: '#991b1b', border: '#ef4444' };
      case 'WITHDRAWN':
        return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };
      default:
        return { bg: '#f3f4f6', text: '#374151', border: '#9ca3af' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} color="#d97706" />;
      case 'ACCEPTED':
        return <CheckCircle size={16} color="#10b981" />;
      case 'REJECTED':
        return <XCircle size={16} color="#ef4444" />;
      case 'WITHDRAWN':
        return <AlertCircle size={16} color="#6b7280" />;
      default:
        return <Clock size={16} color="#6b7280" />;
    }
  };

  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' || app.status === statusFilter
  );

  const renderFilterButton = (filterType: string, label: string, count: number) => (
    <TouchableOpacity
      onPress={() => setStatusFilter(filterType)}
      className={`px-4 py-2 rounded-xl mr-3 ${
        statusFilter === filterType ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <Text
        className={`font-medium ${
          statusFilter === filterType ? 'text-white' : 'text-gray-700'
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
        {/* Clinic Info Header */}
        <View className="flex-row items-center mb-4">
          <View className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mr-4">
            {application.jobRequirement.clinic.profileImage ? (
              <Image
                source={{ uri: application.jobRequirement.clinic.profileImage }}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <Building size={24} color="white" />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {application.jobRequirement.clinic.clinicName}
            </Text>
            <View className="flex-row items-center">
              <MapPin size={14} color="#6b7280" />
              <Text className="text-gray-600 ml-1">{application.jobRequirement.location}</Text>
            </View>
          </View>
          <View
            className="px-3 py-2 rounded-full flex-row items-center"
            style={{ 
              backgroundColor: statusColors.bg, 
              borderColor: statusColors.border, 
              borderWidth: 1 
            }}
          >
            {getStatusIcon(application.status)}
            <Text style={{ color: statusColors.text }} className="text-sm font-medium ml-1 capitalize">
              {application.status.toLowerCase()}
            </Text>
          </View>
        </View>

        {/* Job Details */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-bold text-blue-600 mb-2">
            {application.jobRequirement.title}
          </Text>
          <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
            {application.jobRequirement.description}
          </Text>
          <View className="flex-row items-center">
            <View className="bg-blue-100 rounded-full px-2 py-1 mr-2">
              <Text className="text-blue-800 text-xs font-medium">
                {application.jobRequirement.type.replace('_', ' ')}
              </Text>
            </View>
            {application.jobRequirement.specialization && (
              <View className="bg-purple-100 rounded-full px-2 py-1">
                <Text className="text-purple-800 text-xs font-medium">
                  {application.jobRequirement.specialization.replace(/_/g, ' ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Application Message */}
        <View className="bg-blue-50 rounded-xl p-4 mb-4">
          <Text className="text-gray-700 font-medium mb-2">Your Message:</Text>
          <Text className="text-gray-600 text-sm" numberOfLines={3}>
            {application.message}
          </Text>
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
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => {
              setSelectedApplication(application);
              setShowDetailModal(true);
            }}
            className="flex-1 bg-gray-100 rounded-xl py-3 flex-row items-center justify-center"
          >
            <Eye size={16} color="#6b7280" />
            <Text className="text-gray-700 font-medium ml-2">View Details</Text>
          </TouchableOpacity>
          
          {application.status === 'PENDING' && (
            <TouchableOpacity
              onPress={() => confirmWithdraw(application.id, application.jobRequirement.title)}
              className="flex-1 bg-red-50 border border-red-200 rounded-xl py-3 flex-row items-center justify-center"
            >
              <Trash2 size={16} color="#ef4444" />
              <Text className="text-red-600 font-medium ml-2">Withdraw</Text>
            </TouchableOpacity>
          )}

          {application.status === 'ACCEPTED' && (
            <TouchableOpacity
              onPress={() => router.push(`/(drawer)/chat?clinic=${application.jobRequirement.clinic.id}`)}
              className="flex-1 bg-green-600 rounded-xl py-3 flex-row items-center justify-center"
            >
              <MessageSquare size={16} color="white" />
              <Text className="text-white font-medium ml-2">Start Chat</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-800 mt-4">Loading your applications...</Text>
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
          <Text className="text-3xl font-bold text-white mb-2">My Applications</Text>
          <Text className="text-blue-100 text-base">
            Track the status of your job applications
          </Text>
        </LinearGradient>

        <View style={{ padding: 20, paddingTop: 30 }}>
          {/* Summary Stats */}
          <View className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">Application Summary</Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-600">
                  {applications.filter(a => a.status === 'PENDING').length}
                </Text>
                <Text className="text-gray-600 text-sm">Pending</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-600">
                  {applications.filter(a => a.status === 'ACCEPTED').length}
                </Text>
                <Text className="text-gray-600 text-sm">Accepted</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-red-600">
                  {applications.filter(a => a.status === 'REJECTED').length}
                </Text>
                <Text className="text-gray-600 text-sm">Rejected</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-gray-600">
                  {applications.length}
                </Text>
                <Text className="text-gray-600 text-sm">Total</Text>
              </View>
            </View>
          </View>

          {/* Filter Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
            {renderFilterButton('all', 'All', applications.length)}
            {renderFilterButton('PENDING', 'Pending', applications.filter(a => a.status === 'PENDING').length)}
            {renderFilterButton('ACCEPTED', 'Accepted', applications.filter(a => a.status === 'ACCEPTED').length)}
            {renderFilterButton('REJECTED', 'Rejected', applications.filter(a => a.status === 'REJECTED').length)}
            {renderFilterButton('WITHDRAWN', 'Withdrawn', applications.filter(a => a.status === 'WITHDRAWN').length)}
          </ScrollView>

          {/* Applications List */}
          {filteredApplications.length > 0 ? (
            filteredApplications.map(renderApplicationCard)
          ) : (
            <View className="bg-white rounded-2xl p-8 shadow-lg items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                <MessageSquare size={32} color="#9ca3af" />
              </View>
              <Text className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</Text>
              <Text className="text-gray-600 text-center mb-4">
                {statusFilter === 'all' 
                  ? "You haven't submitted any job applications yet. Start exploring opportunities!"
                  : `No ${statusFilter.toLowerCase()} applications found.`
                }
              </Text>
              {statusFilter === 'all' && (
                <TouchableOpacity
                  onPress={() => router.push('/(drawer)/tabs/jobs')}
                  className="bg-blue-600 rounded-xl px-6 py-3"
                >
                  <Text className="text-white font-medium">Find Jobs</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
          {selectedApplication && (
            <View className="flex-1">
              {/* Modal Header */}
              <View className="flex-row items-center justify-between p-6 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-900">Application Details</Text>
                <TouchableOpacity
                  onPress={() => setShowDetailModal(false)}
                  className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                >
                  <X size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <ScrollView className="flex-1 p-6">
                {/* Status */}
                <View className="mb-6">
                  <View
                    className="p-4 rounded-xl flex-row items-center"
                    style={{ backgroundColor: getStatusColor(selectedApplication.status).bg }}
                  >
                    {getStatusIcon(selectedApplication.status)}
                    <Text
                      className="font-semibold ml-2 capitalize"
                      style={{ color: getStatusColor(selectedApplication.status).text }}
                    >
                      Application {selectedApplication.status.toLowerCase()}
                    </Text>
                  </View>
                </View>

                {/* Job Information */}
                <View className="bg-gray-50 rounded-2xl p-4 mb-6">
                  <Text className="text-lg font-bold text-gray-900 mb-2">
                    {selectedApplication.jobRequirement.title}
                  </Text>
                  <Text className="text-gray-600 text-base mb-3">
                    {selectedApplication.jobRequirement.description}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Building size={16} color="#6b7280" />
                    <Text className="text-gray-700 font-medium ml-2">
                      {selectedApplication.jobRequirement.clinic.clinicName}
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <MapPin size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">
                      {selectedApplication.jobRequirement.location}
                    </Text>
                  </View>
                </View>

                {/* Your Message */}
                <View className="bg-blue-50 rounded-2xl p-4 mb-6">
                  <Text className="text-gray-700 font-medium mb-2">Your Cover Message:</Text>
                  <Text className="text-gray-600 text-base leading-6">
                    {selectedApplication.message}
                  </Text>
                </View>

                {/* Application Timeline */}
                <View className="bg-white border border-gray-200 rounded-2xl p-4">
                  <Text className="text-gray-700 font-medium mb-3">Application Timeline</Text>
                  <View className="flex-row items-center">
                    <Calendar size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">
                      Applied on {new Date(selectedApplication.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Bottom Actions */}
              {selectedApplication.status === 'PENDING' && (
                <View className="p-6 border-t border-gray-200">
                  <TouchableOpacity
                    onPress={() => {
                      setShowDetailModal(false);
                      setTimeout(() => {
                        confirmWithdraw(selectedApplication.id, selectedApplication.jobRequirement.title);
                      }, 300);
                    }}
                    className="bg-red-600 rounded-xl py-4 flex-row items-center justify-center"
                    disabled={withdrawing}
                  >
                    {withdrawing ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Trash2 size={16} color="white" />
                    )}
                    <Text className="text-white font-medium ml-2">
                      {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {selectedApplication.status === 'ACCEPTED' && (
                <View className="p-6 border-t border-gray-200">
                  <TouchableOpacity
                    onPress={() => {
                      setShowDetailModal(false);
                      router.push(`/(drawer)/chat?clinic=${selectedApplication.jobRequirement.clinic.id}`);
                    }}
                    className="bg-green-600 rounded-xl py-4 flex-row items-center justify-center"
                  >
                    <MessageSquare size={16} color="white" />
                    <Text className="text-white font-medium ml-2">Start Conversation</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}