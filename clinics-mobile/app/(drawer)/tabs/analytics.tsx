import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  Activity,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react-native';
import Chart from '../../../components/Chart';
import { getDashboardOverview } from '../../../lib/utils';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  totalRequirements: number;
  requirementsByStatus: {
    requirementStatus: string;
    _count: { requirementStatus: number };
  }[];
  totalPitches: number;
  pitchesByStatus: { status: string; _count: { status: number } }[];
  totalAccepted: number;
  recentPitches: any[];
  monthlyStats?: {
    month: string;
    requirements: number;
    applications: number;
    connections: number;
  }[];
}

export default function AnalyticsScreen() {
  const { user } = useUser();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, year

  const fetchAnalyticsData = useCallback(async () => {
    if (user?.id) {
      try {
        const data = await getDashboardOverview(user.id);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    fetchAnalyticsData().finally(() => setLoading(false));
  }, [fetchAnalyticsData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnalyticsData().finally(() => setRefreshing(false));
  }, [fetchAnalyticsData]);

  if (loading || !analytics) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View className="flex-1 justify-center items-center">
          <Activity size={32} color="#3b82f6" />
          <Text className="text-lg font-semibold text-gray-800 mt-4">Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const requirementsChartData = (analytics?.requirementsByStatus || []).map(
    (item) => item._count.requirementStatus
  );
  const requirementChartColors = (analytics?.requirementsByStatus || []).map((item) =>
    item.requirementStatus === 'POSTED' ? '#10b981' : '#3b82f6'
  );

  const pitchesChartData = (analytics?.pitchesByStatus || []).map((item) => item._count.status);
  const pitchChartColors = (analytics?.pitchesByStatus || []).map((item) =>
    item.status === 'ACCEPTED'
      ? '#10b981'
      : item.status === 'REJECTED'
      ? '#ef4444'
      : '#f97316'
  );

  const acceptanceRate = (analytics?.totalPitches || 0) > 0 
    ? (((analytics?.totalAccepted || 0) / (analytics?.totalPitches || 1)) * 100).toFixed(1)
    : '0.0';

  const renderMetricCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    change: string,
    changeType: 'positive' | 'negative' | 'neutral',
    gradientColors: string[]
  ) => (
    <View className="rounded-2xl shadow-lg overflow-hidden mb-4">
      <LinearGradient colors={gradientColors} style={{ padding: 20 }}>
        <View className="flex-row justify-between items-start mb-3">
          <View className="bg-white/20 rounded-xl p-3">
            {icon}
          </View>
          <View className="flex-row items-center">
            {changeType === 'positive' && <ArrowUp size={16} color="#10b981" />}
            {changeType === 'negative' && <ArrowDown size={16} color="#ef4444" />}
            <Text
              className={`text-sm font-medium ml-1 ${
                changeType === 'positive'
                  ? 'text-green-600'
                  : changeType === 'negative'
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {change}
            </Text>
          </View>
        </View>
        <Text className="text-3xl font-bold text-white mb-1">{value}</Text>
        <Text className="text-white/80 text-base">{title}</Text>
      </LinearGradient>
    </View>
  );

  const renderPeriodButton = (period: string, label: string) => (
    <TouchableOpacity
      onPress={() => setSelectedPeriod(period)}
      className={`px-4 py-2 rounded-lg mr-2 ${
        selectedPeriod === period ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <Text
        className={`font-medium ${
          selectedPeriod === period ? 'text-white' : 'text-gray-700'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

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
            <Text className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</Text>
            <Text className="text-gray-600 text-base">
              Comprehensive insights into your clinic's performance
            </Text>
          </View>

          {/* Period Selector */}
          <View className="mb-6">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {renderPeriodButton('week', 'This Week')}
              {renderPeriodButton('month', 'This Month')}
              {renderPeriodButton('year', 'This Year')}
            </ScrollView>
          </View>

          {/* Key Metrics */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Key Metrics</Text>
            
            {renderMetricCard(
              <Briefcase color="white" size={24} />,
              'Total Job Posts',
              analytics.totalRequirements,
              '+12%',
              'positive',
              ['#3b82f6', '#1d4ed8']
            )}

            <View className="flex-row gap-4">
              <View style={{ flex: 1 }}>
                {renderMetricCard(
                  <Users color="white" size={20} />,
                  'Applications',
                  analytics.totalPitches,
                  '+8%',
                  'positive',
                  ['#8b5cf6', '#7c3aed']
                )}
              </View>
              <View style={{ flex: 1 }}>
                {renderMetricCard(
                  <CheckCircle color="white" size={20} />,
                  'Success Rate',
                  `${acceptanceRate}%`,
                  '+5%',
                  'positive',
                  ['#10b981', '#059669']
                )}
              </View>
            </View>
          </View>

          {/* Charts Section */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Performance Charts</Text>
            
            <View className="bg-white rounded-2xl p-6 shadow-lg mb-4">
              <View className="flex-row items-center mb-4">
                <View className="bg-blue-100 rounded-lg p-2 mr-3">
                  <PieChart size={20} color="#3b82f6" />
                </View>
                <Text className="text-xl font-semibold text-gray-900">Job Requirements Status</Text>
              </View>
              <Chart
                data={requirementsChartData}
                colors={requirementChartColors}
                title=""
              />
              <View className="flex-row justify-around mt-4">
                {analytics.requirementsByStatus.map((item, index) => (
                  <View key={item.requirementStatus} className="items-center">
                    <View
                      className="w-3 h-3 rounded-full mb-1"
                      style={{ backgroundColor: requirementChartColors[index] }}
                    />
                    <Text className="text-xs text-gray-600 capitalize">
                      {item.requirementStatus.toLowerCase()}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {item._count.requirementStatus}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <View className="flex-row items-center mb-4">
                <View className="bg-purple-100 rounded-lg p-2 mr-3">
                  <BarChart3 size={20} color="#8b5cf6" />
                </View>
                <Text className="text-xl font-semibold text-gray-900">Application Status</Text>
              </View>
              <Chart
                data={pitchesChartData}
                colors={pitchChartColors}
                title=""
              />
              <View className="flex-row justify-around mt-4">
                {analytics.pitchesByStatus.map((item, index) => (
                  <View key={item.status} className="items-center">
                    <View
                      className="w-3 h-3 rounded-full mb-1"
                      style={{ backgroundColor: pitchChartColors[index] }}
                    />
                    <Text className="text-xs text-gray-600 capitalize">
                      {item.status.toLowerCase()}
                    </Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {item._count.status}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Performance Insights */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Performance Insights</Text>
            
            <View className="bg-white rounded-2xl p-6 shadow-lg">
              <View className="space-y-4">
                <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <View className="bg-green-100 rounded-lg p-2 mr-3">
                      <CheckCircle size={20} color="#10b981" />
                    </View>
                    <View>
                      <Text className="font-semibold text-gray-900">Acceptance Rate</Text>
                      <Text className="text-gray-600 text-sm">Applications accepted</Text>
                    </View>
                  </View>
                  <Text className="text-2xl font-bold text-green-600">{acceptanceRate}%</Text>
                </View>

                <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
                  <View className="flex-row items-center">
                    <View className="bg-blue-100 rounded-lg p-2 mr-3">
                      <Clock size={20} color="#3b82f6" />
                    </View>
                    <View>
                      <Text className="font-semibold text-gray-900">Avg. Response Time</Text>
                      <Text className="text-gray-600 text-sm">Time to respond to applications</Text>
                    </View>
                  </View>
                  <Text className="text-2xl font-bold text-blue-600">2.3d</Text>
                </View>

                <View className="flex-row items-center justify-between py-3">
                  <View className="flex-row items-center">
                    <View className="bg-orange-100 rounded-lg p-2 mr-3">
                      <AlertCircle size={20} color="#f97316" />
                    </View>
                    <View>
                      <Text className="font-semibold text-gray-900">Pending Applications</Text>
                      <Text className="text-gray-600 text-sm">Awaiting your review</Text>
                    </View>
                  </View>
                  <Text className="text-2xl font-bold text-orange-600">
                    {analytics.pitchesByStatus.find(p => p.status === 'PENDING')?._count.status || 0}
                  </Text>
                </View>
              </div>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => router.push('/(drawer)/tabs/requirements')}
                className="bg-blue-600 rounded-xl p-4 flex-1"
              >
                <TrendingUp size={20} color="white" />
                <Text className="text-white font-medium mt-2">View Jobs</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => router.push('/(drawer)/applications')}
                className="bg-purple-600 rounded-xl p-4 flex-1"
              >
                <Users size={20} color="white" />
                <Text className="text-white font-medium mt-2">Applications</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}