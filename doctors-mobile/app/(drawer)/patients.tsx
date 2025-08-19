import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  condition: string;
  status: 'Active' | 'Completed' | 'In Progress';
  assignedDate: string;
  clinicName: string;
  urgency: 'Low' | 'Medium' | 'High';
  lastUpdate: string;
}

export default function PatientsScreen() {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed' | 'In Progress'>('All');

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setPatients([
        {
          id: '1',
          name: 'Sarah Johnson',
          age: 45,
          gender: 'Female',
          condition: 'Hypertension',
          status: 'Active',
          assignedDate: '2024-01-15',
          clinicName: 'City Medical Center',
          urgency: 'Medium',
          lastUpdate: '2024-01-20',
        },
        {
          id: '2',
          name: 'Michael Chen',
          age: 32,
          gender: 'Male',
          condition: 'Chest Pain',
          status: 'In Progress',
          assignedDate: '2024-01-18',
          clinicName: 'Heart Care Clinic',
          urgency: 'High',
          lastUpdate: '2024-01-21',
        },
        {
          id: '3',
          name: 'Emily Davis',
          age: 28,
          gender: 'Female',
          condition: 'Regular Checkup',
          status: 'Completed',
          assignedDate: '2024-01-10',
          clinicName: 'Health Plus',
          urgency: 'Low',
          lastUpdate: '2024-01-12',
        },
      ]);
      setRefreshing(false);
    }, 2000);
  }, []);

  useEffect(() => {
    onRefresh();
  }, []);

  const filteredPatients = patients.filter(patient => 
    filter === 'All' || patient.status === filter
  );

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'Active':
        return colors.secondary;
      case 'In Progress':
        return colors.warning;
      case 'Completed':
        return colors.success;
      default:
        return colors.muted;
    }
  };

  const getUrgencyColor = (urgency: Patient['urgency']) => {
    switch (urgency) {
      case 'High':
        return colors.error;
      case 'Medium':
        return colors.warning;
      case 'Low':
        return colors.secondary;
      default:
        return colors.muted;
    }
  };

  const PatientCard = ({ patient }: { patient: Patient }) => (
    <TouchableOpacity
      style={[styles.patientCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => router.push(`/patients/${patient.id}`)}
    >
      <View style={styles.patientHeader}>
        <View style={styles.patientInfo}>
          <ThemedText type="defaultSemiBold" style={styles.patientName}>
            {patient.name}
          </ThemedText>
          <ThemedText type="muted" style={styles.patientDetails}>
            {patient.age} years • {patient.gender}
          </ThemedText>
        </View>
        <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(patient.urgency) + '20' }]}>
          <ThemedText style={[styles.urgencyText, { color: getUrgencyColor(patient.urgency) }]}>
            {patient.urgency}
          </ThemedText>
        </View>
      </View>

      <View style={styles.patientCondition}>
        <Ionicons name="medical-outline" size={16} color={colors.icon} />
        <ThemedText style={styles.conditionText}>
          {patient.condition}
        </ThemedText>
      </View>

      <View style={styles.patientMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="business-outline" size={14} color={colors.icon} />
          <ThemedText type="muted" style={styles.metaText}>
            {patient.clinicName}
          </ThemedText>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={colors.icon} />
          <ThemedText type="muted" style={styles.metaText}>
            {new Date(patient.assignedDate).toLocaleDateString()}
          </ThemedText>
        </View>
      </View>

      <View style={styles.patientFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(patient.status) + '20' }]}>
          <ThemedText style={[styles.statusText, { color: getStatusColor(patient.status) }]}>
            {patient.status}
          </ThemedText>
        </View>
        <ThemedText type="muted" style={styles.lastUpdate}>
          Updated {new Date(patient.lastUpdate).toLocaleDateString()}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  const FilterButton = ({ 
    title, 
    isActive 
  }: { 
    title: typeof filter; 
    isActive: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { borderColor: colors.border },
        isActive && { backgroundColor: colors.primary, borderColor: colors.primary }
      ]}
      onPress={() => setFilter(title)}
    >
      <ThemedText
        style={[
          styles.filterText,
          isActive && { color: 'white' }
        ]}
      >
        {title}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          My Patients
        </ThemedText>
        <Button
          title="Add Patient"
          size="small"
          onPress={() => router.push('/create-patient')}
          leftIcon={<Ionicons name="add" size={16} color="white" />}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(['All', 'Active', 'In Progress', 'Completed'] as const).map((filterOption) => (
          <FilterButton
            key={filterOption}
            title={filterOption}
            isActive={filter === filterOption}
          />
        ))}
      </ScrollView>

      <ScrollView
        style={styles.patientsList}
        contentContainerStyle={styles.patientsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))
        ) : (
          <ThemedView variant="surface" style={styles.emptyState}>
            <Ionicons name="medical-outline" size={48} color={colors.muted} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No patients found
            </ThemedText>
            <ThemedText type="muted" style={styles.emptyDescription}>
              {filter === 'All' 
                ? "You don't have any patients assigned yet."
                : `No patients with ${filter.toLowerCase()} status.`
              }
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  patientsList: {
    flex: 1,
  },
  patientsContent: {
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  patientCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    marginBottom: 2,
  },
  patientDetails: {
    fontSize: 14,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  patientCondition: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  patientMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  patientFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  lastUpdate: {
    fontSize: 12,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
});