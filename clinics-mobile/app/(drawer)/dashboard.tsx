import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Chart } from '@/components/Chart';

interface DashboardStats {
  totalRequirements: number;
  activeRequirements: number;
  fulfilledRequirements: number;
  totalDoctors: number;
  connectedDoctors: number;
  totalPatients: number;
  activePatients: number;
  completedPatients: number;
  monthlyRevenue: number;
}

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequirements: 0,
    activeRequirements: 0,
    fulfilledRequirements: 0,
    totalDoctors: 0,
    connectedDoctors: 0,
    totalPatients: 0,
    activePatients: 0,
    completedPatients: 0,
    monthlyRevenue: 0,
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setStats({
        totalRequirements: 15,
        activeRequirements: 8,
        fulfilledRequirements: 7,
        totalDoctors: 32,
        connectedDoctors: 18,
        totalPatients: 124,
        activePatients: 28,
        completedPatients: 96,
        monthlyRevenue: 45000,
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

  const requirementsChartData = [
    { name: 'Active', value: stats.activeRequirements, color: colors.primary },
    { name: 'Fulfilled', value: stats.fulfilledRequirements, color: colors.secondary },
  ];

  const patientsChartData = [
    { name: 'Active', value: stats.activePatients, color: colors.primary },
    { name: 'Completed', value: stats.completedPatients, color: colors.secondary },
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
            Clinic Dashboard
          </ThemedText>
          <ThemedText type="muted">
            Welcome back! Here's your clinic overview
          </ThemedText>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Requirements"
            value={stats.totalRequirements}
            icon="document-text-outline"
            color={colors.primary}
          />
          <StatCard
            title="Active Requirements"
            value={stats.activeRequirements}
            icon="time-outline"
            color={colors.warning}
          />
          <StatCard
            title="Fulfilled"
            value={stats.fulfilledRequirements}
            icon="checkmark-circle-outline"
            color={colors.secondary}
          />
          <StatCard
            title="Connected Doctors"
            value={stats.connectedDoctors}
            icon="people-outline"
            color={colors.primary}
          />
        </View>

        <ThemedView variant="surface" style={styles.chartContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Requirements Status
          </ThemedText>
          <Chart data={requirementsChartData} />
        </ThemedView>

        <View style={styles.statsGrid}>
          <StatCard
            title="Total Patients"
            value={stats.totalPatients}
            icon="medical-outline"
            color={colors.primary}
          />
          <StatCard
            title="Active Patients"
            value={stats.activePatients}
            icon="pulse-outline"
            color={colors.warning}
          />
          <StatCard
            title="Completed"
            value={stats.completedPatients}
            icon="checkmark-done-outline"
            color={colors.secondary}
          />
          <StatCard
            title="Available Doctors"
            value={stats.totalDoctors}
            icon="person-outline"
            color={colors.muted}
          />
        </View>

        <ThemedView variant="surface" style={styles.chartContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Patient Status Distribution
          </ThemedText>
          <Chart data={patientsChartData} />
        </ThemedView>

        <ThemedView variant="surface" style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <Ionicons name="trending-up-outline" size={28} color={colors.secondary} />
            <View style={styles.revenueInfo}>
              <ThemedText type="muted">Monthly Revenue</ThemedText>
              <ThemedText type="title" style={styles.revenueAmount}>
                ₹{stats.monthlyRevenue.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        {/* Quick Actions */}
        <ThemedView variant="surface" style={styles.quickActions}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Actions
          </ThemedText>
          <View style={styles.actionsGrid}>
            <View style={[styles.actionItem, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
              <ThemedText type="primary" style={styles.actionText}>
                New Requirement
              </ThemedText>
            </View>
            <View style={[styles.actionItem, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="search-outline" size={24} color={colors.secondary} />
              <ThemedText type="secondary" style={styles.actionText}>
                Find Doctors
              </ThemedText>
            </View>
            <View style={[styles.actionItem, { backgroundColor: colors.warning + '20' }]}>
              <Ionicons name="person-add-outline" size={24} color={colors.warning} />
              <ThemedText style={[styles.actionText, { color: colors.warning }]}>
                Add Patient
              </ThemedText>
            </View>
            <View style={[styles.actionItem, { backgroundColor: colors.muted + '20' }]}>
              <Ionicons name="analytics-outline" size={24} color={colors.muted} />
              <ThemedText style={[styles.actionText, { color: colors.muted }]}>
                Analytics
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
  revenueCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  revenueInfo: {
    flex: 1,
  },
  revenueAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  quickActions: {
    padding: 20,
    borderRadius: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionItem: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});