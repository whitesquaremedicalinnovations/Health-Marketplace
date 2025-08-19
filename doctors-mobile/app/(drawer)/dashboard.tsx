import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Chart } from '@/components/Chart';

interface DashboardStats {
  totalApplications: number;
  acceptedApplications: number;
  pendingApplications: number;
  rejectedApplications: number;
  totalConnections: number;
  monthlyEarnings: number;
  completedPatients: number;
  activePatients: number;
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    totalConnections: 0,
    monthlyEarnings: 0,
    completedPatients: 0,
    activePatients: 0,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalApplications: 24,
        acceptedApplications: 18,
        pendingApplications: 4,
        rejectedApplications: 2,
        totalConnections: 12,
        monthlyEarnings: 15000,
        completedPatients: 45,
        activePatients: 8,
      });
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    onRefresh();
  }, []);

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    icon: string; 
    color: string;
  }) => (
    <ThemedView variant="surface" style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={24} color={color} />
        <ThemedText type="muted" style={styles.statTitle}>
          {title}
        </ThemedText>
      </View>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
    </ThemedView>
  );

  const chartData = [
    { name: 'Accepted', value: stats.acceptedApplications, color: colors.secondary },
    { name: 'Pending', value: stats.pendingApplications, color: colors.warning },
    { name: 'Rejected', value: stats.rejectedApplications, color: colors.error },
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.welcomeText}>
            Dashboard
          </ThemedText>
          <ThemedText type="muted">
            Welcome back! Here's your overview
          </ThemedText>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon="document-text-outline"
            color={colors.primary}
          />
          <StatCard
            title="Accepted"
            value={stats.acceptedApplications}
            icon="checkmark-circle-outline"
            color={colors.secondary}
          />
          <StatCard
            title="Pending"
            value={stats.pendingApplications}
            icon="time-outline"
            color={colors.warning}
          />
          <StatCard
            title="Connections"
            value={stats.totalConnections}
            icon="people-outline"
            color={colors.primary}
          />
        </View>

        <ThemedView variant="surface" style={styles.chartContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Application Status
          </ThemedText>
          <Chart data={chartData} />
        </ThemedView>

        <View style={styles.statsGrid}>
          <StatCard
            title="Active Patients"
            value={stats.activePatients}
            icon="medical-outline"
            color={colors.primary}
          />
          <StatCard
            title="Completed"
            value={stats.completedPatients}
            icon="checkmark-done-outline"
            color={colors.secondary}
          />
        </View>

        <ThemedView variant="surface" style={styles.earningsCard}>
          <View style={styles.earningsHeader}>
            <Ionicons name="wallet-outline" size={28} color={colors.secondary} />
            <View style={styles.earningsInfo}>
              <ThemedText type="muted">Monthly Earnings</ThemedText>
              <ThemedText type="title" style={styles.earningsAmount}>
                ₹{stats.monthlyEarnings.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  chartContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  earningsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  earningsInfo: {
    flex: 1,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
});