import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { LinearGradient } from 'expo-linear-gradient';

import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Stethoscope,
  Heart,
  Bell,
  MapPin,
  Award,
  Clock,
  Building,
} from "lucide-react-native";
import Chart from "../../../components/Chart";

import { getDashboardOverview } from "../../../lib/utils";

const { width, height } = Dimensions.get('window');

interface DoctorOverview {
  totalApplications: number;
  applicationsByStatus: {
    status: string;
    _count: { status: number };
  }[];
  totalConnections: number;
  availableJobs: number;
  recentApplications: {
    id: string;
    createdAt: string;
    status: string;
    jobRequirement: {
      title: string;
      clinic: {
        clinicName: string;
        clinicProfileImage: {
          docUrl: string;
        } | null;
      };
    };
  }[];
  latestNews: {
    id: string;
    title: string;
    imageUrl: string | null;
    createdAt: string;
  }[];
}

export default function DashboardScreen() {
  const { user } = useUser();
  const [overview, setOverview] = useState<DoctorOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    if (user?.id) {
      try {
        // Use doctor-specific dashboard endpoint
        const data = await getDashboardOverview(user.id, 'doctor');
        const overviewWithDefaults = {
          ...data,
          applicationsByStatus: data?.applicationsByStatus || [],
          recentApplications: data?.recentApplications || [],
          latestNews: data?.latestNews || [],
        };
        setOverview(overviewWithDefaults);
      } catch (error) {
        console.error("Error fetching dashboard overview:", error);
        setOverview({
          totalApplications: 0,
          applicationsByStatus: [],
          totalConnections: 0,
          availableJobs: 0,
          recentApplications: [],
          latestNews: [],
        });
      }
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchDashboardData().finally(() => setLoading(false));
  }, [fetchDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().finally(() => setRefreshing(false));
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center bg-gradient-to-br from-slate-50 to-blue-50">
          <View className="bg-white rounded-full p-8 shadow-lg mb-4">
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
          <Text className="text-lg font-semibold text-gray-800">Loading your dashboard...</Text>
          <Text className="text-sm text-gray-500 mt-1">Please wait while we fetch your data</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!overview) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center bg-gradient-to-br from-red-50 to-orange-50">
          <View className="bg-white rounded-2xl p-8 mx-4 shadow-xl">
            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mx-auto mb-4">
              <Activity size={32} color="#dc2626" />
            </View>
            <Text className="text-xl font-semibold text-gray-900 text-center mb-2">Something went wrong</Text>
            <Text className="text-gray-600 text-center">Could not load dashboard data. Please try again.</Text>
            <TouchableOpacity 
              onPress={() => fetchDashboardData()}
              className="bg-red-600 rounded-lg py-3 px-6 mt-4"
            >
              <Text className="text-white font-medium text-center">Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const applicationChartData = overview.applicationsByStatus.map((item) => item._count.status);
  const applicationChartColors = overview.applicationsByStatus.map((item) =>
    item.status === 'ACCEPTED'
      ? '#10b981'
      : item.status === 'REJECTED'
      ? '#ef4444'
      : '#f97316'
  );

  const renderStatCard = (
    icon: React.ReactNode,
    title: string,
    value: number,
    subtitle: string,
    screen: string,
    gradientColors: string[] = ['#ffffff', '#f8fafc']
  ) => (
    <TouchableOpacity
      onPress={() => router.push(screen as any)}
      className="rounded-2xl shadow-lg overflow-hidden"
      style={{ 
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      }}
    >
      <LinearGradient
        colors={gradientColors}
        style={{ padding: 20, minHeight: 120 }}
      >
        <View className="flex-row justify-between items-start mb-3">
          <View className="bg-white/50 rounded-xl p-3 shadow-sm">
            {icon}
          </View>
          <View className="bg-blue-100 rounded-full px-2 py-1">
            <Text className="text-blue-800 text-xs font-medium">Active</Text>
          </View>
        </View>
        <Text className="text-3xl font-bold text-gray-900 mb-1">{value}</Text>
        <Text className="text-lg font-semibold text-gray-800 mb-1">{title}</Text>
        <Text className="text-gray-600 text-sm">{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ flex: 1 }}
      >
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6', '#6366f1']}
          style={{ 
            paddingHorizontal: 20, 
            paddingTop: 20, 
            paddingBottom: 30,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-3xl font-bold text-white">Welcome back, Doctor!</Text>
              <Text className="text-blue-100 text-base mt-1">
                Here's your professional activity and new opportunities
              </Text>
            </View>
            <TouchableOpacity className="bg-white/20 rounded-full p-3">
              <Bell size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats in Header */}
          <View className="flex-row justify-between">
            <View className="bg-white/10 rounded-2xl p-4 flex-1 mr-2">
              <Text className="text-2xl font-bold text-white">{overview.totalApplications}</Text>
              <Text className="text-blue-100 text-sm">Applications</Text>
            </View>
            <View className="bg-white/10 rounded-2xl p-4 flex-1 mx-1">
              <Text className="text-2xl font-bold text-white">{overview.totalConnections}</Text>
              <Text className="text-blue-100 text-sm">Active Jobs</Text>
            </View>
            <View className="bg-white/10 rounded-2xl p-4 flex-1 ml-2">
              <Text className="text-2xl font-bold text-white">{overview.availableJobs}</Text>
              <Text className="text-blue-100 text-sm">Available Jobs</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 20, paddingTop: 30 }}>
          {/* Enhanced Statistics Cards */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Overview</Text>
            <View className="gap-4">
              {renderStatCard(
                <MessageSquare color="#3b82f6" size={28} />,
                "My Applications",
                overview.totalApplications,
                "Job applications submitted",
                "/(drawer)/applications",
                ['#ffffff', '#dbeafe']
              )}
              
              <View className="flex-row gap-4">
                <View style={{ flex: 1 }}>
                  {renderStatCard(
                    <CheckCircle color="#10b981" size={24} />,
                    "Active Positions",
                    overview.totalConnections,
                    "Currently working with clinics",
                    "/(drawer)/connections",
                    ['#ffffff', '#dcfce7']
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {renderStatCard(
                    <Briefcase color="#8b5cf6" size={24} />,
                    "New Opportunities",
                    overview.availableJobs,
                    "Jobs available in your area",
                    "/(drawer)/jobs",
                    ['#ffffff', '#f3e8ff']
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Charts Section */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Analytics</Text>
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-100 rounded-lg p-2 mr-3">
                  <TrendingUp size={20} color="#3b82f6" />
                </View>
                <Text className="text-xl font-semibold text-gray-900">Application Status</Text>
              </View>
              <Chart
                data={applicationChartData}
                colors={applicationChartColors}
                title=""
              />
            </View>
          </View>

          {/* Activity Sections */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</Text>
            
            {/* Recent Applications */}
            <View className="bg-white rounded-2xl p-6 shadow-lg mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 rounded-lg p-2 mr-3">
                    <MessageSquare size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900">Recent Applications</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push("/(drawer)/applications")}
                  className="bg-blue-50 rounded-lg px-3 py-2"
                >
                  <Text className="text-blue-600 font-medium text-sm">See All</Text>
                </TouchableOpacity>
              </View>
              
              {overview.recentApplications.length > 0 ? (
                overview.recentApplications.map((application, index) => (
                  <View key={application.id} className={`flex-row items-center py-4 ${index < overview.recentApplications.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <View className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mr-4">
                      {application.jobRequirement.clinic.clinicProfileImage?.docUrl ? (
                        <Image
                          source={{ uri: application.jobRequirement.clinic.clinicProfileImage.docUrl }}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <Building size={20} color="white" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 text-base">{application.jobRequirement.title}</Text>
                      <Text className="text-gray-600 text-sm">
                        At {application.jobRequirement.clinic.clinicName}
                      </Text>
                      <View className="flex-row items-center gap-2 mt-1">
                        <View className={`px-2 py-1 rounded-full ${getStatusBadgeColor(application.status)}`}>
                          <Text className="text-xs font-medium capitalize">
                            {application.status.toLowerCase()}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Calendar size={12} color="#6b7280" />
                          <Text className="text-gray-500 text-xs ml-1">
                            {new Date(application.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View className="items-center py-8">
                  <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                    <MessageSquare size={24} color="#9ca3af" />
                  </View>
                  <Text className="text-gray-500 text-center">No applications yet</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">Start applying for jobs to see your activity here</Text>
                </View>
              )}
            </View>

            {/* Latest News */}
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="bg-emerald-100 rounded-lg p-2 mr-3">
                    <FileText size={20} color="#10b981" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900">Healthcare News</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push("/(drawer)/news")}
                  className="bg-emerald-50 rounded-lg px-3 py-2"
                >
                  <Text className="text-emerald-600 font-medium text-sm">Read More</Text>
                </TouchableOpacity>
              </View>
              
              {overview.latestNews.length > 0 ? (
                overview.latestNews.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => router.push(`/news/${item.id}`)}
                    className={`flex-row items-center py-4 ${index < overview.latestNews.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {item.imageUrl ? (
                      <Image
                        source={{ uri: item.imageUrl }}
                        className="w-16 h-16 rounded-xl mr-4"
                      />
                    ) : (
                      <View className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-xl items-center justify-center mr-4">
                        <FileText size={24} color="#10b981" />
                      </View>
                    )}
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 text-base" numberOfLines={2}>
                        {item.title}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Calendar size={12} color="#6b7280" />
                        <Text className="text-gray-500 text-xs ml-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <ArrowRight size={20} color="#9ca3af" />
                  </TouchableOpacity>
                ))
              ) : (
                <View className="items-center py-8">
                  <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                    <FileText size={24} color="#9ca3af" />
                  </View>
                  <Text className="text-gray-500 text-center">No recent news</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">Stay tuned for the latest healthcare news</Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</Text>
            <View className="flex-row flex-wrap gap-3">
              <TouchableOpacity 
                onPress={() => router.push("/(drawer)/jobs")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 flex-row items-center flex-1 min-w-[45%]"
              >
                <Briefcase size={20} color="white" />
                <Text className="text-white font-medium ml-2">Find New Jobs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push("/(drawer)/profile")}
                className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 flex-row items-center flex-1 min-w-[45%]"
              >
                <Users size={20} color="white" />
                <Text className="text-white font-medium ml-2">Update Profile</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push("/(drawer)/applications")}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 flex-row items-center flex-1 min-w-[45%]"
              >
                <MessageSquare size={20} color="white" />
                <Text className="text-white font-medium ml-2">My Applications</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push("/(drawer)/connections")}
                className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 flex-row items-center flex-1 min-w-[45%]"
              >
                <Heart size={20} color="white" />
                <Text className="text-white font-medium ml-2">My Work History</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
