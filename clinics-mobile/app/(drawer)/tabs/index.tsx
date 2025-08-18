import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useState, useCallback } from "react";

import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle,
  MessageSquare,
} from "lucide-react-native";
import Chart from "../../../components/Chart";

import { getDashboardOverview } from "../../../lib/utils";

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
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2">Loading your dashboard...</Text>
      </View>
    );
  }

  if (!overview) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Could not load dashboard data.</Text>
      </View>
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
    screen: string
  ) => (
    <TouchableOpacity
      onPress={() => router.push(screen as any)}
      className="bg-white rounded-lg p-4 flex-1 shadow-md"
    >
      <View className="flex-row justify-between items-center">
        {icon}
        <Text className="text-2xl font-bold">{value}</Text>
      </View>
      <Text className="text-lg font-semibold mt-2">{title}</Text>
      <Text className="text-gray-500">{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={overview.latestNews}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View className="p-4">
          <View className="bg-blue-600 rounded-xl p-6 shadow-lg mb-6">
            <Text className="text-3xl font-bold text-white">Welcome Back!</Text>
            <Text className="text-white opacity-80 mt-1">
              Here's what's happening with your clinic.
            </Text>
            <View className="flex-row justify-between mt-4">
              <View className="items-center">
                <Text className="text-white font-bold text-2xl">
                  {overview.totalRequirements}
                </Text>
                <Text className="text-white opacity-80">Total Jobs</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold text-2xl">
                  {overview.totalPitches}
                </Text>
                <Text className="text-white opacity-80">Applications</Text>
              </View>
              <View className="items-center">
                <Text className="text-white font-bold text-2xl">
                  {overview.totalAccepted}
                </Text>
                <Text className="text-white opacity-80">Connections</Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between gap-4 mb-6">
            {renderStatCard(
              <Briefcase color="#3b82f6" size={24} />,
              "Job Requirements",
              overview.totalRequirements,
              "Total posted jobs",
              "/(drawer)/tabs/requirements"
            )}
            {renderStatCard(
              <MessageSquare color="#8b5cf6" size={24} />,
              "Applications",
              overview.totalPitches,
              "Applications received",
              "/(drawer)/applications"
            )}
          </View>
          <View className="mb-6">
            {renderStatCard(
              <CheckCircle color="#10b981" size={24} />,
              "Connections",
              overview.totalAccepted,
              "Successful connections",
              "/(drawer)/connections"
            )}
          </View>

          <View className="flex-row justify-between gap-4 mb-6">
            <Chart
              data={requirementsChartData}
              colors={requirementChartColors}
              title="Requirements Overview"
            />
            <Chart
              data={pitchesChartData}
              colors={pitchChartColors}
              title="Applications Status"
            />
          </View>

          <View className="bg-white rounded-lg p-4 shadow-md mb-6">
            <Text className="text-xl font-bold mb-2">Recent Applications</Text>
            {overview.recentPitches.length > 0 ? (
              overview.recentPitches.map((item) => (
                <View key={item.id} className="flex-row items-center py-2 border-b border-gray-200">
                  <Image
                    source={{ uri: item.doctor.profileImage?.docUrl }}
                    className="w-10 h-10 rounded-full"
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-semibold">{item.doctor.fullName}</Text>
                    <Text className="text-gray-500">
                      Applied for {item.jobRequirement.title}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-xs">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-center py-5 text-gray-500">
                No recent applications.
              </Text>
            )}
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <View className="px-4">
          <View className="bg-white rounded-lg p-4 shadow-md">
            <Text className="text-xl font-bold mb-2">Latest News</Text>
            <TouchableOpacity
              onPress={() => router.push(`/news/${item.id}`)}
              className="flex-row items-center py-2 border-b border-gray-200"
            >
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-16 h-16 rounded-md"
                />
              )}
              <View className="ml-3 flex-1">
                <Text className="font-semibold">{item.title}</Text>
                <View className="flex-row items-center mt-1">
                  <Calendar size={12} color="gray" />
                  <Text className="text-gray-500 text-xs ml-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <ArrowRight color="gray" />
            </TouchableOpacity>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <View className="px-4">
          <View className="bg-white rounded-lg p-4 shadow-md">
            <Text className="text-xl font-bold mb-2">Latest News</Text>
            <Text className="text-center py-5 text-gray-500">
              No news to show.
            </Text>
          </View>
        </View>
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
}
