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
import { BlurView } from 'expo-blur';

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
  Hospital,
  Stethoscope,
  Heart,
  Bell,
} from "lucide-react-native";
import Chart from "../../../components/Chart";

import { getDashboardOverview } from "../../../lib/utils";

const { width, height } = Dimensions.get('window');

interface Overview {
  totalRequirements: number;
  requirementsByStatus: {
    requirementStatus: string;
    _count: { requirementStatus: number };
  }[];
  totalPitches: number;
  pitchesByStatus: { status: string; _count: { status: number } }[];
  totalAccepted: number;
  recentPitches: {
    id: string;
    createdAt: string;
    doctor: {
      id: string;
      fullName: string;
      profileImage: { docUrl: string } | null;
    };
    jobRequirement: {
      title: string;
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
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    if (user?.id) {
      try {
        const data = await getDashboardOverview(user.id);
        const overviewWithDefaults = {
          ...data,
          requirementsByStatus: data?.requirementsByStatus || [],
          pitchesByStatus: data?.pitchesByStatus || [],
          recentPitches: data?.recentPitches || [],
          latestNews: data?.latestNews || [],
        };
        setOverview(overviewWithDefaults);
      } catch (error) {
        console.error("Error fetching dashboard overview:", error);
        setOverview({
          totalRequirements: 0,
          requirementsByStatus: [],
          totalPitches: 0,
          pitchesByStatus: [],
          totalAccepted: 0,
          recentPitches: [],
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

  const requirementsChartData =
    overview.requirementsByStatus.map(
      (item) => item._count.requirementStatus
    ) || [];
  const requirementChartColors =
    overview.requirementsByStatus.map((item) =>
      item.requirementStatus === "POSTED" ? "#10b981" : "#3b82f6"
    ) || [];

  const pitchesChartData =
    overview.pitchesByStatus.map((item) => item._count.status) || [];
  const pitchChartColors =
    overview.pitchesByStatus.map((item) =>
      item.status === "ACCEPTED"
        ? "#10b981"
        : item.status === "REJECTED"
        ? "#ef4444"
        : "#f97316"
    ) || [];

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

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={['#3b82f6', '#8b5cf6', '#6366f1']}
          style={{ 
            paddingHorizontal: 16, 
            paddingTop: 16, 
            paddingBottom: 24,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 }}>
                Welcome Back!
              </Text>
              <Text style={{ fontSize: 14, color: '#bfdbfe', lineHeight: 20 }}>
                Here's what's happening with your healthcare facility
              </Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}>
              <Bell size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Quick Stats in Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12, flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                {overview?.totalRequirements || 0}
              </Text>
              <Text style={{ fontSize: 11, color: '#bfdbfe' }}>Total Jobs</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12, flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                {overview?.totalPitches || 0}
              </Text>
              <Text style={{ fontSize: 11, color: '#bfdbfe' }}>Applications</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12, flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                {overview?.totalAccepted || 0}
              </Text>
              <Text style={{ fontSize: 11, color: '#bfdbfe' }}>Connections</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 16, paddingTop: 24 }}>
          {/* Enhanced Statistics Cards */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
              Overview
            </Text>
            <View style={{ gap: 16 }}>
              {renderStatCard(
                <Briefcase color="#3b82f6" size={24} />,
                "Job Requirements",
                overview?.totalRequirements || 0,
                "Total posted requirements",
                "/(drawer)/tabs/requirements",
                ['#ffffff', '#dbeafe']
              )}
              
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  {renderStatCard(
                    <MessageSquare color="#8b5cf6" size={20} />,
                    "Applications",
                    overview?.totalPitches || 0,
                    "Doctor applications received",
                    "/(drawer)/applications",
                    ['#ffffff', '#f3e8ff']
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {renderStatCard(
                    <CheckCircle color="#10b981" size={20} />,
                    "Connections",
                    overview?.totalAccepted || 0,
                    "Successful doctor connections",
                    "/(drawer)/connections",
                    ['#ffffff', '#dcfce7']
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Charts Section */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16 }}>
              Analytics
            </Text>
            {requirementsChartData && requirementsChartData.length > 0 && (
              <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#dbeafe', borderRadius: 8, padding: 8, marginRight: 12 }}>
                    <TrendingUp size={16} color="#3b82f6" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    Requirements Overview
                  </Text>
                </View>
                <Chart
                  data={requirementsChartData}
                  colors={requirementChartColors}
                  title=""
                />
              </View>
            )}
            
            {pitchesChartData && pitchesChartData.length > 0 && (
              <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ backgroundColor: '#f3e8ff', borderRadius: 8, padding: 8, marginRight: 12 }}>
                    <Activity size={16} color="#8b5cf6" />
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
                    Applications Status
                  </Text>
                </View>
                <Chart
                  data={pitchesChartData}
                  colors={pitchChartColors}
                  title=""
                />
              </View>
            )}
          </View>

          {/* Activity Sections */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</Text>
            
            {/* Recent Applications */}
            <View className="bg-white rounded-2xl p-6 shadow-lg mb-4">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="bg-blue-100 rounded-lg p-2 mr-3">
                    <Users size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-xl font-semibold text-gray-900">Recent Applications</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => router.push("/(drawer)/applications")}
                  className="bg-blue-50 rounded-lg px-3 py-2"
                >
                  <Text className="text-blue-600 font-medium text-sm">View All</Text>
                </TouchableOpacity>
              </View>
              
              {overview.recentPitches.length > 0 ? (
                overview.recentPitches.map((item, index) => (
                  <View key={item.id} className={`flex-row items-center py-4 ${index < overview.recentPitches.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <View className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 items-center justify-center mr-4">
                      {item.doctor.profileImage?.docUrl ? (
                        <Image
                          source={{ uri: item.doctor.profileImage.docUrl }}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <Text className="text-white font-bold">
                          {item.doctor.fullName[0]}
                        </Text>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900 text-base">{item.doctor.fullName}</Text>
                      <Text className="text-gray-600 text-sm">
                        Applied for {item.jobRequirement.title}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Calendar size={12} color="#6b7280" />
                        <Text className="text-gray-500 text-xs ml-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    <ArrowRight size={20} color="#9ca3af" />
                  </View>
                ))
              ) : (
                <View className="items-center py-8">
                  <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                    <MessageSquare size={24} color="#9ca3af" />
                  </View>
                  <Text className="text-gray-500 text-center">No recent applications</Text>
                  <Text className="text-gray-400 text-sm text-center mt-1">New applications will appear here</Text>
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
                  <Text className="text-xl font-semibold text-gray-900">Latest News</Text>
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
                onPress={() => router.push("/(drawer)/search-doctors")}
                className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 flex-row items-center flex-1 min-w-[45%]"
              >
                <Stethoscope size={20} color="white" />
                <Text className="text-white font-medium ml-2">Find Doctors</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push("/(drawer)/tabs/requirements")}
                className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 flex-row items-center flex-1 min-w-[45%]"
              >
                <Briefcase size={20} color="white" />
                <Text className="text-white font-medium ml-2">Post Job</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push("/(drawer)/chat")}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 flex-row items-center flex-1 min-w-[45%]"
              >
                <MessageSquare size={20} color="white" />
                <Text className="text-white font-medium ml-2">Messages</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push("/(drawer)/connections")}
                className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 flex-row items-center flex-1 min-w-[45%]"
              >
                <Heart size={20} color="white" />
                <Text className="text-white font-medium ml-2">My Team</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
